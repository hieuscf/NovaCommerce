package server

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

// Application holds wired HTTP and background runtime dependencies.
type Application struct {
	Engine       *gin.Engine
	DB           *pkgdatabase.DB
	Cache        *pkgcache.Cache
	KafkaClients *messaging.KafkaClients
	OutboxWorker *messaging.OutboxWorker
}

// New wires repositories, cache decorators, services, handlers, and routes.
func New(ctx context.Context, cfg *config.Config, log *pkglogger.Logger, version string) (*Application, error) {
	db, err := persistence.NewDatabase(ctx, cfg.Database, log)
	if err != nil {
		return nil, err
	}

	if err := persistence.RunMigrations(cfg.Database.BuildDSN()); err != nil {
		db.Close()
		return nil, fmt.Errorf("run migrations: %w", err)
	}

	redisClient, err := infracache.NewRedisClient(ctx, cfg.Redis, log)
	if err != nil {
		db.Close()
		return nil, err
	}

	kafkaClients, err := messaging.NewKafkaClients(cfg.Kafka, cfg.Server.Name)
	if err != nil {
		db.Close()
		_ = redisClient.Close()
		return nil, err
	}

	pool := db.Pool

	// Product stack
	pgProductRepo := persistence.NewProductPostgresRepo(pool, log)
	pgVariantRepo := persistence.NewProductVariantPostgresRepo(pool, log)
	pgImageRepo := persistence.NewProductImagePostgresRepo(pool, log)
	variantAttrRepo := persistence.NewVariantAttributeValuePostgresRepo(pool, log)

	productCache := infracache.NewProductRedisCache(redisClient, log)
	cachedProductRepo := infracache.NewCachedProductRepository(
		pgProductRepo,
		productCache,
		log,
		infracache.DefaultProductCacheTTL,
	)

	outbox := kafka.NewPostgresOutboxWriter(pool)
	transactor := persistence.NewTransactor(pool)
	fileClient := application.NewFileServiceClient(cfg.FileService.URL, cfg.FileService.PublicURL)
	productService := application.NewProductUseCase(
		cachedProductRepo,
		pgVariantRepo,
		pgImageRepo,
		variantAttrRepo,
		outbox,
		transactor,
		fileClient,
	)

	// Category & brand repositories (PostgreSQL)
	categoryRepo := persistence.NewPostgresCategoryRepository(pool, log)
	brandRepo := persistence.NewPostgresBrandRepository(pool, log)

	// Cache decorators (wrap repos)
	cachedCategoryRepo := infracache.NewCachedCategoryRepository(
		categoryRepo,
		redisClient,
		log,
		infracache.DefaultCategoryCacheTTL,
	)
	cachedBrandRepo := infracache.NewCachedBrandRepository(
		brandRepo,
		redisClient,
		log,
		infracache.DefaultBrandCacheTTL,
	)

	// Services
	categoryService := application.NewCategoryService(cachedCategoryRepo)
	brandService := application.NewBrandService(cachedBrandRepo)

	// Handlers
	productHandler := handler.NewProductHandler(productService)
	categoryHandler := handler.NewCategoryHandler(categoryService, productService)
	brandHandler := handler.NewBrandHandler(brandService)

	kafkaChecker := func() error {
		return messaging.ValidateKafkaBrokers(cfg.Kafka.Brokers)
	}
	healthService := service.NewHealthService(db, redisClient, kafkaChecker, cfg.Server.Name, version)
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

	return &Application{
		Engine:       engine,
		DB:           db,
		Cache:        redisClient,
		KafkaClients: kafkaClients,
		OutboxWorker: outboxWorker,
	}, nil
}

// Close releases runtime resources.
func (a *Application) Close(log *pkglogger.Logger) {
	if a == nil {
		return
	}
	if a.KafkaClients != nil {
		if err := a.KafkaClients.Close(); err != nil {
			log.Error().Err(err).Msg("close kafka clients")
		}
	}
	if a.Cache != nil {
		if err := a.Cache.Close(); err != nil {
			log.Error().Err(err).Msg("close redis client")
		}
	}
	if a.DB != nil {
		a.DB.Close()
	}
}
