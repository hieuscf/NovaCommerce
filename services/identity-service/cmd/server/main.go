package main

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/novacommerce/identity-service/config"
	"github.com/novacommerce/identity-service/internal/application/service"
	"github.com/novacommerce/identity-service/internal/infrastructure/cache"
	"github.com/novacommerce/identity-service/internal/infrastructure/http/handler"
	"github.com/novacommerce/identity-service/internal/infrastructure/http/middleware"
	"github.com/novacommerce/identity-service/internal/infrastructure/http/router"
	"github.com/novacommerce/identity-service/internal/infrastructure/persistence/postgres"
	pkglogger "github.com/novacommerce/pkg/logger"
)

// Version is injected at build time via -ldflags.
var Version = "1.0.0"

func main() {
	ctx := context.Background()

	cfg, err := config.Load()
	if err != nil {
		fmt.Fprintf(os.Stderr, "load config: %v\n", err)
		os.Exit(1)
	}

	log := pkglogger.New(cfg.App.Name, cfg.App.Env, cfg.App.LogLevel)

	shutdownTelemetry, err := initTelemetry(ctx, cfg, Version)
	if err != nil {
		log.Error().Err(err).Msg("init telemetry")
		os.Exit(1)
	}
	defer func() {
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := shutdownTelemetry(shutdownCtx); err != nil {
			log.Error().Err(err).Msg("shutdown telemetry")
		}
	}()

	pool, err := postgres.NewPool(ctx, cfg.Database, log)
	if err != nil {
		log.Error().Err(err).Msg("connect to PostgreSQL")
		os.Exit(1)
	}
	defer pool.Close()

	redisClient, err := cache.NewRedisClient(ctx, cfg.Redis, log)
	if err != nil {
		log.Error().Err(err).Msg("connect to Redis")
		os.Exit(1)
	}
	defer func() {
		if err := redisClient.Close(); err != nil {
			log.Error().Err(err).Msg("close redis client")
		}
	}()

	healthService := service.NewHealthService(pool, redisClient, cfg.App.Name)
	healthHandler := handler.NewHealthHandler(healthService)

	middleware.Init(log, cfg.HTTP.CORSAllowOrigins)
	engine := router.NewRouter(cfg, healthHandler)

	srv := &http.Server{
		Addr:              fmt.Sprintf(":%d", cfg.App.Port),
		Handler:           engine,
		ReadHeaderTimeout: 10 * time.Second,
	}

	go func() {
		log.Info().Int("port", cfg.App.Port).Str("version", Version).Msg("starting HTTP server")
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Error().Err(err).Msg("HTTP server failed")
			os.Exit(1)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Info().Msg("shutting down server")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), time.Duration(cfg.App.GracefulTTL)*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Error().Err(err).Msg("graceful shutdown failed")
		os.Exit(1)
	}

	log.Info().Msg("server stopped")
}
