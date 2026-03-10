package config

import (
	env "github.com/caarlos0/env/v11"
)

type Config struct {
	DatabaseURL           string `env:"DATABASE_URL" envDefault:"postgres://dev:dev@localhost:5432/store_management?sslmode=disable"`
	JWTSecret             string `env:"JWT_SECRET" envDefault:"dev-secret"`
	Port                  string `env:"PORT" envDefault:"8080"`
	DefaultStockThreshold int    `env:"DEFAULT_STOCK_THRESHOLD" envDefault:"3"`
}

func Load() (*Config, error) {
	cfg := &Config{}
	if err := env.Parse(cfg); err != nil {
		return nil, err
	}
	return cfg, nil
}
