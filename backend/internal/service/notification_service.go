package service

import (
	"sync"

	"github.com/google/uuid"
)

type EventType string

const (
	EventNewOrder      EventType = "new_order"
	EventStatusChanged EventType = "status_changed"
	EventStockAlert    EventType = "stock_alert"
)

type Event struct {
	Type EventType   `json:"type"`
	Data interface{} `json:"data"`
}

type NotificationService struct {
	mu      sync.RWMutex
	clients map[string]chan Event
}

func NewNotificationService() *NotificationService {
	return &NotificationService{
		clients: make(map[string]chan Event),
	}
}

func (s *NotificationService) Subscribe() (string, chan Event) {
	s.mu.Lock()
	defer s.mu.Unlock()

	id := uuid.New().String()
	ch := make(chan Event, 64)
	s.clients[id] = ch
	return id, ch
}

func (s *NotificationService) Unsubscribe(id string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if ch, ok := s.clients[id]; ok {
		close(ch)
		delete(s.clients, id)
	}
}

func (s *NotificationService) Broadcast(event Event) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, ch := range s.clients {
		select {
		case ch <- event:
		default:
			// Drop event if client buffer is full
		}
	}
}
