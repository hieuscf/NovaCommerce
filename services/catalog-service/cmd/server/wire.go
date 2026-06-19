package main

import (
	"context"

	pkglogger "github.com/novacommerce/pkg/logger"
	"github.com/novacommerce/services/catalog-service/config"
	httpserver "github.com/novacommerce/services/catalog-service/internal/infrastructure/http/server"
)

type wiredApp struct {
	*httpserver.Application
}

func wireApp(ctx context.Context, cfg *config.Config, log *pkglogger.Logger, version string) (*wiredApp, error) {
	app, err := httpserver.New(ctx, cfg, log, version)
	if err != nil {
		return nil, err
	}
	return &wiredApp{Application: app}, nil
}

func (a *wiredApp) close(log *pkglogger.Logger) {
	if a != nil && a.Application != nil {
		a.Application.Close(log)
	}
}
