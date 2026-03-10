package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/howlrs/qr-tryon/backend/internal/service"
)

type SSEHandler struct {
	notificationSvc *service.NotificationService
}

func NewSSEHandler(notificationSvc *service.NotificationService) *SSEHandler {
	return &SSEHandler{notificationSvc: notificationSvc}
}

func (h *SSEHandler) Stream(w http.ResponseWriter, r *http.Request) {
	flusher, ok := w.(http.Flusher)
	if !ok {
		writeError(w, http.StatusInternalServerError, "INTERNAL_ERROR", "streaming not supported")
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	clientID, ch := h.notificationSvc.Subscribe()
	defer h.notificationSvc.Unsubscribe(clientID)

	// Send initial connected event
	fmt.Fprintf(w, "event: connected\ndata: {\"client_id\":\"%s\"}\n\n", clientID)
	flusher.Flush()

	ctx := r.Context()
	for {
		select {
		case <-ctx.Done():
			return
		case event, ok := <-ch:
			if !ok {
				return
			}
			data, err := json.Marshal(event.Data)
			if err != nil {
				continue
			}
			fmt.Fprintf(w, "event: %s\ndata: %s\n\n", event.Type, data)
			flusher.Flush()
		}
	}
}
