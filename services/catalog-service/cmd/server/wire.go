package main

import (
	"context"

	"github.com/gin-gonic/gin"
	"github.com/novacommerce/services/catalog-service/config"
	"github.com/novacommerce/services/catalog-service/internal/application/service"
	infracache "github.com/novacommerce/services/catalog-service/internal/infrastructure/cache"
	"github.com/novacommerce/services/catalog-service/internal/infrastructure/http/handler"
	"github.com/novacommerce/services/catalog-service/internal/infrastructure/http/router"
	"github.com/novacommerce/services/catalog-service/internal/infrastructure/messaging"
	"github.com/novacommerce/services/catalog-service/internal/infrastructure/persistence"
	pkgcache "github.com/novacommerce/pkg/cache"
	pkgdatabase "github.com/novacommerce/pkg/database"
	pkglogger "github.com/novacommerce/pkg/logger"
)

type wiredApp struct {
	engine       *gin.Engine
	db           *pkgdatabase.DB
	cache        *pkgcache.Cache
	kafkaClients *messaging.KafkaClients
}

func wireApp(ctx context.Context, cfg *config.Config, log *pkglogger.Logger) (*wiredApp, error) {
	db, err := persistence.NewDatabase(ctx, cfg.Database, log)
	if err != nil {
		return nil, err
	}

	cacheClient, err := infracache.NewRedisClient(ctx, cfg.Redis, log)
	if err != nil {
		db.Close()
		return nil, err
	}

	kafkaClients, err := messaging.NewKafkaClients(cfg.Kafka, cfg.Server.Name)
	if err != nil {
		db.Close()
		_ = cacheClient.Close()
		return nil, err
	}

	healthService := service.NewHealthService(db, cacheClient)
	healthHandler := handler.NewHealthHandler(healthService)
	catalogHandler := handler.NewCatalogHandler()

	engine := router.SetupRouter(&router.Dependencies{
		Config:         cfg,
		HealthHandler:  healthHandler,
		CatalogHandler: catalogHandler,
	})

	return &wiredApp{
		engine:       engine,
		db:           db,
		cache:        cacheClient,
		kafkaClients: kafkaClients,
	}, nil
}

func (a *wiredApp) close(log *pkglogger.Logger) {
	if a.kafkaClients != nil {
		if err := a.kafkaClients.Close(); err != nil {
			log.Error().Err(err).Msg("close kafka clients")
		}
	}
	if a.cache != nil {
		if err := a.cache.Close(); err != nil {
			log.Error().Err(err).Msg("close redis client")
		}
	}
	if a.db != nil {
		a.db.Close()
	}
}
