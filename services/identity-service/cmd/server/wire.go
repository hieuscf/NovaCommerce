package main

import (
	"context"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/novacommerce/identity-service/config"
	"github.com/novacommerce/identity-service/internal/application/port"
	"github.com/novacommerce/identity-service/internal/application/service"
	"github.com/novacommerce/identity-service/internal/application/usecase"
	"github.com/novacommerce/identity-service/internal/domain/entity"
	"github.com/novacommerce/identity-service/internal/infrastructure/cache"
	"github.com/novacommerce/identity-service/internal/infrastructure/email"
	"github.com/novacommerce/identity-service/internal/infrastructure/http/handler"
	"github.com/novacommerce/identity-service/internal/infrastructure/http/router"
	infrajwt "github.com/novacommerce/identity-service/internal/infrastructure/jwt"
	"github.com/novacommerce/identity-service/internal/infrastructure/messaging"
	infraoauth "github.com/novacommerce/identity-service/internal/infrastructure/oauth"
	"github.com/novacommerce/identity-service/internal/infrastructure/persistence/postgres"
	pkglogger "github.com/novacommerce/pkg/logger"
	"github.com/redis/go-redis/v9"
)

type wiredApp struct {
	engine        *gin.Engine
	pool          *pgxpool.Pool
	redisClient   *redis.Client
	kafkaProducer *messaging.KafkaProducer
}

func wireApp(ctx context.Context, cfg *config.Config, log *pkglogger.Logger) (*wiredApp, error) {
	pool, err := postgres.NewPool(ctx, cfg.Database, log)
	if err != nil {
		return nil, fmt.Errorf("connect to PostgreSQL: %w", err)
	}

	redisClient, err := cache.NewRedisClient(ctx, cfg.Redis, log)
	if err != nil {
		pool.Close()
		return nil, fmt.Errorf("connect to Redis: %w", err)
	}

	kafkaProducer, err := messaging.NewKafkaProducer(cfg.Kafka.Brokers)
	if err != nil {
		pool.Close()
		_ = redisClient.Close()
		return nil, fmt.Errorf("init kafka producer: %w", err)
	}

	userRepo := postgres.NewUserPostgresRepo(pool)
	refreshTokenRepo := postgres.NewRefreshTokenPostgresRepo(pool)
	passwordResetRepo := postgres.NewPasswordResetPostgresRepo(pool)
	oauthRepo := postgres.NewOAuthPostgresRepo(pool)
	outboxRepo := postgres.NewOutboxPostgresRepo(pool)
	roleRepo := postgres.NewRolePostgresRepo(pool)
	transactor := postgres.NewTransactor(pool)

	jwtService, err := infrajwt.NewJWTService(*cfg)
	if err != nil {
		pool.Close()
		_ = redisClient.Close()
		_ = kafkaProducer.Close()
		return nil, fmt.Errorf("init jwt service: %w", err)
	}

	emailService := email.NewLogEmailService(log)
	useCaseRateLimiter := cache.NewUseCaseRateLimiter(redisClient, cfg.RateLimit.LoginMaxAttempts, cfg.RateLimit.LoginWindow)

	authUseCase := usecase.NewAuthUseCase(
		userRepo,
		refreshTokenRepo,
		passwordResetRepo,
		jwtService,
		emailService,
		kafkaProducer,
		useCaseRateLimiter,
	)

	oauthProviders := map[string]port.OAuthProvider{
		entity.ProviderGoogle:   infraoauth.NewGoogleProvider(cfg.OAuth.Google),
		entity.ProviderFacebook: infraoauth.NewFacebookProvider(cfg.OAuth.Facebook),
	}
	stateManager := infraoauth.NewStateManager(redisClient)

	oauthUseCase := usecase.NewOAuthUseCase(
		userRepo,
		oauthRepo,
		outboxRepo,
		refreshTokenRepo,
		jwtService,
		oauthProviders,
		stateManager,
		transactor,
		kafkaProducer,
	)

	healthService := service.NewHealthService(pool, redisClient, cfg.Server.Name)
	healthHandler := handler.NewHealthHandler(healthService)
	authHandler := handler.NewAuthHandler(authUseCase)
	oauthHandler := handler.NewOAuthHandler(oauthUseCase)

	userUseCase := usecase.NewUserUseCase(userRepo, roleRepo, outboxRepo, transactor)
	userHandler := handler.NewUserHandler(userUseCase)

	engine := router.SetupRouter(&router.Dependencies{
		Config:        cfg,
		RedisClient:   redisClient,
		JWTService:    jwtService,
		HealthHandler: healthHandler,
		AuthHandler:   authHandler,
		OAuthHandler:  oauthHandler,
		UserHandler:   userHandler,
	})

	return &wiredApp{
		engine:        engine,
		pool:          pool,
		redisClient:   redisClient,
		kafkaProducer: kafkaProducer,
	}, nil
}

func (a *wiredApp) close(log *pkglogger.Logger) {
	if a.kafkaProducer != nil {
		if err := a.kafkaProducer.Close(); err != nil {
			log.Error().Err(err).Msg("close kafka producer")
		}
	}
	if a.redisClient != nil {
		if err := a.redisClient.Close(); err != nil {
			log.Error().Err(err).Msg("close redis client")
		}
	}
	if a.pool != nil {
		a.pool.Close()
	}
}
