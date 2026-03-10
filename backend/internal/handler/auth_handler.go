package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/howlrs/qr-tryon/backend/internal/dto"
	"github.com/howlrs/qr-tryon/backend/internal/model"
	"github.com/uptrace/bun"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	db        *bun.DB
	jwtSecret string
}

func NewAuthHandler(db *bun.DB, jwtSecret string) *AuthHandler {
	return &AuthHandler{db: db, jwtSecret: jwtSecret}
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req dto.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "VALIDATION_ERROR", "invalid request body")
		return
	}

	if req.Email == "" || req.Password == "" {
		writeError(w, http.StatusBadRequest, "VALIDATION_ERROR", "email and password are required")
		return
	}

	manager := new(model.Manager)
	err := h.db.NewSelect().
		Model(manager).
		Where("email = ?", req.Email).
		Scan(r.Context())
	if err != nil {
		writeError(w, http.StatusUnauthorized, "UNAUTHORIZED", "invalid credentials")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(manager.PasswordHash), []byte(req.Password)); err != nil {
		writeError(w, http.StatusUnauthorized, "UNAUTHORIZED", "invalid credentials")
		return
	}

	// Generate JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":   manager.ID,
		"email": manager.Email,
		"name":  manager.Name,
		"exp":   time.Now().Add(24 * time.Hour).Unix(),
		"iat":   time.Now().Unix(),
	})

	tokenString, err := token.SignedString([]byte(h.jwtSecret))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to generate token")
		return
	}

	// Set cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    tokenString,
		Path:     "/",
		MaxAge:   86400,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})

	writeJSON(w, http.StatusOK, dto.LoginResponse{
		Token: tokenString,
		Manager: dto.ManagerInfo{
			ID:    manager.ID,
			Email: manager.Email,
			Name:  manager.Name,
		},
	})
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})
	w.WriteHeader(http.StatusNoContent)
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	managerID, ok := r.Context().Value(contextKeyManagerID).(int64)
	if !ok {
		writeError(w, http.StatusUnauthorized, "UNAUTHORIZED", "not authenticated")
		return
	}

	manager := new(model.Manager)
	err := h.db.NewSelect().
		Model(manager).
		Where("id = ?", managerID).
		Scan(r.Context())
	if err != nil {
		writeError(w, http.StatusNotFound, "NOT_FOUND", "manager not found")
		return
	}

	writeJSON(w, http.StatusOK, dto.ManagerInfo{
		ID:    manager.ID,
		Email: manager.Email,
		Name:  manager.Name,
	})
}

type contextKey string

const contextKeyManagerID contextKey = "manager_id"

func ContextWithManagerID(ctx context.Context, id int64) context.Context {
	return context.WithValue(ctx, contextKeyManagerID, id)
}

func ManagerIDFromContext(ctx context.Context) (int64, bool) {
	id, ok := ctx.Value(contextKeyManagerID).(int64)
	return id, ok
}
