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
	"github.com/novacommerce/identity-service/internal/infrastructure/http/middleware"
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

	log := pkglogger.New(cfg.Server.Name, cfg.Server.Env, cfg.Server.LogLevel)

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

	middleware.Init(log, cfg.HTTP.CORSAllowOrigins)

	app, err := wireApp(ctx, cfg, log)
	if err != nil {
		log.Error().Err(err).Msg("wire application")
		os.Exit(1)
	}
	defer app.close(log)

	relayCtx, relayCancel := context.WithCancel(ctx)
	defer relayCancel()
	go func() {
		log.Info().Msg("starting outbox relay")
		if err := app.outboxRelay.Run(relayCtx); err != nil && !errors.Is(err, context.Canceled) {
			log.Error().Err(err).Msg("outbox relay stopped")
		}
	}()

	srv := &http.Server{
		Addr:              fmt.Sprintf(":%d", cfg.Server.Port),
		Handler:           app.engine,
		ReadTimeout:       cfg.Server.ReadTimeout,
		WriteTimeout:      cfg.Server.WriteTimeout,
		IdleTimeout:       cfg.Server.IdleTimeout,
		ReadHeaderTimeout: 10 * time.Second,
	}

	go func() {
		log.Info().Int("port", cfg.Server.Port).Str("version", Version).Msg("starting HTTP server")
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Error().Err(err).Msg("HTTP server failed")
			os.Exit(1)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Info().Msg("shutting down server")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), time.Duration(cfg.Server.GracefulTTL)*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Error().Err(err).Msg("graceful shutdown failed")
		os.Exit(1)
	}

	log.Info().Msg("server stopped")
}
