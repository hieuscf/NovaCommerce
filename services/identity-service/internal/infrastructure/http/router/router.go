package router

import (
	"github.com/gin-gonic/gin"
	"github.com/novacommerce/identity-service/config"
	"github.com/novacommerce/identity-service/internal/application/port"
	"github.com/novacommerce/identity-service/internal/infrastructure/http/handler"
	"github.com/novacommerce/identity-service/internal/infrastructure/http/middleware"
	"github.com/redis/go-redis/v9"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
)

// Dependencies groups HTTP router dependencies.
type Dependencies struct {
	Config        *config.Config
	RedisClient   *redis.Client
	JWTService    port.JWTService
	HealthHandler *handler.HealthHandler
	AuthHandler   *handler.AuthHandler
	OAuthHandler  *handler.OAuthHandler
	UserHandler   *handler.UserHandler
}

// SetupRouter builds the Gin engine with middleware and routes.
func SetupRouter(deps *Dependencies) *gin.Engine {
	if deps.Config.Server.Env != "development" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	if deps.Config.Telemetry.Enabled {
		r.Use(otelgin.Middleware(deps.Config.Telemetry.ServiceName))
	}
	r.Use(middleware.Recovery())
	r.Use(middleware.SecurityHeaders())
	r.Use(middleware.RequestID())
	r.Use(middleware.InjectLogger())
	r.Use(middleware.Logger())
	r.Use(middleware.CORS())

	deps.HealthHandler.RegisterRoutes(r)
	registerDocsRoutes(r)

	registerLimiter := middleware.RegisterRateLimiter(deps.RedisClient, deps.Config.RateLimit)
	loginLimiter := middleware.LoginRateLimiter(deps.RedisClient, deps.Config.RateLimit)

	auth := r.Group("/auth")
	{
		auth.POST("/register", registerLimiter, deps.AuthHandler.Register)
		auth.POST("/login", loginLimiter, deps.AuthHandler.Login)
		auth.POST("/refresh", deps.AuthHandler.RefreshToken)
		auth.POST("/forgot-password", deps.AuthHandler.ForgotPassword)
		auth.POST("/reset-password", deps.AuthHandler.ResetPassword)

		protected := auth.Group("", middleware.JWTAuthMiddleware(deps.JWTService))
		{
			protected.POST("/logout", deps.AuthHandler.Logout)
			protected.POST("/logout-all", deps.AuthHandler.LogoutAll)
			protected.GET("/me", deps.AuthHandler.GetMe)
			protected.PUT("/change-password", deps.AuthHandler.ChangePassword)
		}

		// OAuth2 social login — no JWT required, CSRF protected via state parameter.
		if deps.OAuthHandler != nil {
			oauth := auth.Group("/oauth")
			{
				oauth.GET("/:provider", deps.OAuthHandler.Redirect)
				oauth.GET("/:provider/callback", deps.OAuthHandler.Callback)
			}
		}
	}

	if deps.UserHandler != nil {
		v1 := r.Group("/api/v1")
		users := v1.Group("/users", middleware.JWTAuthMiddleware(deps.JWTService))
		{
			adminOnly := middleware.RequireRole("admin")
			users.GET("", adminOnly, deps.UserHandler.ListUsers)

			selfOrAdmin := middleware.RequireSelfOrAdmin("id")
			users.GET("/:id/roles", adminOnly, deps.UserHandler.GetUserRoles)
			users.POST("/:id/roles", adminOnly, deps.UserHandler.AssignRole)
			users.DELETE("/:id/roles/:role_id", adminOnly, deps.UserHandler.RevokeRole)
			users.GET("/:id", selfOrAdmin, deps.UserHandler.GetUser)
			users.PUT("/:id", selfOrAdmin, deps.UserHandler.UpdateProfile)
			users.PUT("/:id/status", adminOnly, deps.UserHandler.UpdateUserStatus)
		}
	}

	return r
}

// NewRouter is a compatibility wrapper around SetupRouter.
func NewRouter(cfg *config.Config, deps *Dependencies) *gin.Engine {
	deps.Config = cfg
	return SetupRouter(deps)
}
