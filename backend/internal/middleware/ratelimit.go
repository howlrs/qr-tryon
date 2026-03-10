package middleware

import (
	"net"
	"net/http"
	"sync"
	"time"
)

type ipRecord struct {
	count    int
	windowAt time.Time
}

type RateLimiter struct {
	mu       sync.Mutex
	clients  map[string]*ipRecord
	limit    int
	window   time.Duration
}

func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		clients: make(map[string]*ipRecord),
		limit:   limit,
		window:  window,
	}
	// Clean up old entries periodically
	go func() {
		ticker := time.NewTicker(window)
		defer ticker.Stop()
		for range ticker.C {
			rl.mu.Lock()
			now := time.Now()
			for ip, rec := range rl.clients {
				if now.Sub(rec.windowAt) > rl.window {
					delete(rl.clients, ip)
				}
			}
			rl.mu.Unlock()
		}
	}()
	return rl
}

func (rl *RateLimiter) Middleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := extractIP(r)

			rl.mu.Lock()
			rec, exists := rl.clients[ip]
			now := time.Now()

			if !exists || now.Sub(rec.windowAt) > rl.window {
				rl.clients[ip] = &ipRecord{count: 1, windowAt: now}
				rl.mu.Unlock()
				next.ServeHTTP(w, r)
				return
			}

			rec.count++
			if rec.count > rl.limit {
				rl.mu.Unlock()
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusTooManyRequests)
				w.Write([]byte(`{"error":{"code":"RATE_LIMITED","message":"too many requests"}}`))
				return
			}
			rl.mu.Unlock()

			next.ServeHTTP(w, r)
		})
	}
}

func extractIP(r *http.Request) string {
	// Check X-Forwarded-For
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		return xff
	}
	// Check X-Real-IP
	if xri := r.Header.Get("X-Real-IP"); xri != "" {
		return xri
	}
	// Fall back to RemoteAddr
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return ip
}
