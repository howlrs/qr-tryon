package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"

	"github.com/howlrs/qr-tryon/backend/internal/config"
	"github.com/howlrs/qr-tryon/backend/internal/handler"
	"github.com/howlrs/qr-tryon/backend/internal/middleware"
	"github.com/howlrs/qr-tryon/backend/internal/repository"
	"github.com/howlrs/qr-tryon/backend/internal/service"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	// Database connection
	sqldb := sql.OpenDB(pgdriver.NewConnector(pgdriver.WithDSN(cfg.DatabaseURL)))
	db := bun.NewDB(sqldb, pgdialect.New())
	defer db.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		log.Printf("warning: database ping failed: %v (continuing anyway)", err)
	}

	// Run migrations
	if err := runMigrations(db); err != nil {
		log.Printf("warning: migration failed: %v (continuing anyway)", err)
	}

	// Initialize services
	notificationSvc := service.NewNotificationService()

	productRepo := repository.NewProductRepository(db)
	orderRepo := repository.NewOrderRepository(db)

	productSvc := service.NewProductService(productRepo)
	orderSvc := service.NewOrderService(orderRepo, productRepo, notificationSvc, cfg.DefaultStockThreshold)

	productHandler := handler.NewProductHandler(productSvc)
	orderHandler := handler.NewOrderHandler(orderSvc)
	authHandler := handler.NewAuthHandler(db, cfg.JWTSecret)
	sseHandler := handler.NewSSEHandler(notificationSvc)

	// Rate limiter for order creation
	orderRateLimiter := middleware.NewRateLimiter(10, time.Minute)

	// Router
	r := chi.NewRouter()

	// Global middleware
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.RealIP)
	r.Use(middleware.CORS())

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})

	// API routes
	r.Route("/api/v1", func(r chi.Router) {
		// Public endpoints
		r.Get("/products", productHandler.List)
		r.Get("/products/{id}", productHandler.GetByID)

		// Order creation with rate limiting
		r.With(orderRateLimiter.Middleware()).Post("/orders", orderHandler.Create)

		// Auth endpoints
		r.Post("/auth/login", authHandler.Login)
		r.Post("/auth/logout", authHandler.Logout)

		// Protected auth endpoint
		r.With(middleware.Auth(cfg.JWTSecret)).Get("/auth/me", authHandler.Me)

		// Admin endpoints (protected)
		r.Route("/admin", func(r chi.Router) {
			r.Use(middleware.Auth(cfg.JWTSecret))

			r.Get("/products", productHandler.AdminList)
			r.Post("/products", productHandler.Create)
			r.Put("/products/{id}", productHandler.Update)
			r.Delete("/products/{id}", productHandler.Delete)

			r.Get("/orders", orderHandler.List)
			r.Patch("/orders/{id}/status", orderHandler.UpdateStatus)
			r.Put("/orders/read", orderHandler.MarkAllRead)

			r.Get("/notifications/stream", sseHandler.Stream)
		})
	})

	// Server
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 0, // SSE needs unlimited write timeout
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown
	go func() {
		sigCh := make(chan os.Signal, 1)
		signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
		<-sigCh

		log.Println("shutting down server...")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		srv.Shutdown(ctx)
	}()

	log.Printf("server starting on :%s", cfg.Port)
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("server failed: %v", err)
	}
	log.Println("server stopped")
}

func runMigrations(db *bun.DB) error {
	migrationSQL, err := os.ReadFile("db/migrations/001_initial.up.sql")
	if err != nil {
		return fmt.Errorf("reading migration file: %w", err)
	}

	_, err = db.ExecContext(context.Background(), string(migrationSQL))
	if err != nil {
		return fmt.Errorf("executing migration: %w", err)
	}

	log.Println("migrations applied successfully")
	return nil
}
