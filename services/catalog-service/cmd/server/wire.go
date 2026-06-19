package main

import (
	"context"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	pkgcache "github.com/novacommerce/pkg/cache"
	pkgdatabase "github.com/novacommerce/pkg/database"
	"github.com/novacommerce/pkg/kafka"
	pkglogger "github.com/novacommerce/pkg/logger"
	"github.com/novacommerce/services/catalog-service/config"
	"github.com/novacommerce/services/catalog-service/internal/application"
	"github.com/novacommerce/services/catalog-service/internal/application/service"
	infracache "github.com/novacommerce/services/catalog-service/internal/infrastructure/cache"
	"github.com/novacommerce/services/catalog-service/internal/infrastructure/http/handler"
	"github.com/novacommerce/services/catalog-service/internal/infrastructure/http/router"
	"github.com/novacommerce/services/catalog-service/internal/infrastructure/messaging"
	"github.com/novacommerce/services/catalog-service/internal/infrastructure/persistence"
)

type wiredApp struct {
	engine       *gin.Engine
	db           *pkgdatabase.DB
	cache        *pkgcache.Cache
	kafkaClients *messaging.KafkaClients
	outboxWorker *messaging.OutboxWorker
}

func wireApp(ctx context.Context, cfg *config.Config, log *pkglogger.Logger, version string) (*wiredApp, error) {
	db, err := persistence.NewDatabase(ctx, cfg.Database, log)
	if err != nil {
		return nil, err
	}

	if err := persistence.RunMigrations(cfg.Database.BuildDSN()); err != nil {
		db.Close()
		return nil, fmt.Errorf("run migrations: %w", err)
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

	pool := db.Pool

	pgProductRepo := persistence.NewProductPostgresRepo(pool, log)
	pgVariantRepo := persistence.NewProductVariantPostgresRepo(pool, log)
	pgImageRepo := persistence.NewProductImagePostgresRepo(pool, log)
	variantAttrRepo := persistence.NewVariantAttributeValuePostgresRepo(pool, log)

	productCache := infracache.NewProductRedisCache(cacheClient, log)
	cachedProductRepo := infracache.NewCachedProductRepository(
		pgProductRepo,
		productCache,
		log,
		infracache.DefaultProductCacheTTL,
	)

	outbox := kafka.NewPostgresOutboxWriter(pool)
	transactor := persistence.NewTransactor(pool)
	fileClient := application.NewFileServiceClient(cfg.FileService.URL, cfg.FileService.PublicURL)
	productUC := application.NewProductUseCase(
		cachedProductRepo,
		pgVariantRepo,
		pgImageRepo,
		variantAttrRepo,
		outbox,
		transactor,
		fileClient,
	)

	pgCategoryRepo := persistence.NewCategoryPostgresRepository(pool, log)
	categoryRepo := infracache.NewCachedCategoryRepository(
		pgCategoryRepo,
		cacheClient,
		log,
		infracache.DefaultCategoryCacheTTL,
	)
	categorySvc := application.NewCategoryService(categoryRepo)

	pgBrandRepo := persistence.NewBrandPostgresRepository(pool, log)
	brandRepo := infracache.NewCachedBrandRepository(
		pgBrandRepo,
		cacheClient,
		log,
		infracache.DefaultBrandCacheTTL,
	)
	brandSvc := application.NewBrandService(brandRepo)

	productHandler := handler.NewProductHandler(productUC)
	categoryHandler := handler.NewCategoryHandler(categorySvc, productUC)
	brandHandler := handler.NewBrandHandler(brandSvc)

	kafkaChecker := func() error {
		return messaging.ValidateKafkaBrokers(cfg.Kafka.Brokers)
	}
	healthService := service.NewHealthService(db, cacheClient, kafkaChecker, cfg.Server.Name, version)
	healthHandler := handler.NewHealthHandler(healthService)
	catalogHandler := handler.NewCatalogHandler()

	engine := router.SetupRouter(&router.Dependencies{
		Config:          cfg,
		HealthHandler:   healthHandler,
		CatalogHandler:  catalogHandler,
		CategoryHandler: categoryHandler,
		BrandHandler:    brandHandler,
		ProductHandler:  productHandler,
	})

	outboxWorker := messaging.NewOutboxWorker(pool, kafkaClients.Producer, log, time.Second)

	return &wiredApp{
		engine:       engine,
		db:           db,
		cache:        cacheClient,
		kafkaClients: kafkaClients,
		outboxWorker: outboxWorker,
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
