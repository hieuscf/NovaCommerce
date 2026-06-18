package config

import (
	"fmt"
	"net/url"
	"strings"
	"time"

	"github.com/spf13/viper"
	"github.com/subosito/gotenv"
)

// Config holds all catalog-service configuration.
type Config struct {
	Server    ServerConfig    `mapstructure:"server"`
	Database  DatabaseConfig  `mapstructure:"database"`
	Redis     RedisConfig     `mapstructure:"redis"`
	Kafka     KafkaConfig     `mapstructure:"kafka"`
	Telemetry TelemetryConfig `mapstructure:"telemetry"`
	HTTP      HTTPConfig      `mapstructure:"http"`
}

// ServerConfig holds HTTP server settings.
type ServerConfig struct {
	Name         string        `mapstructure:"name"`
	Env          string        `mapstructure:"env"`
	Port         int           `mapstructure:"port"`
	GracefulTTL  int           `mapstructure:"graceful_ttl"`
	LogLevel     string        `mapstructure:"log_level"`
	ReadTimeout  time.Duration `mapstructure:"read_timeout"`
	WriteTimeout time.Duration `mapstructure:"write_timeout"`
	IdleTimeout  time.Duration `mapstructure:"idle_timeout"`
}

// DatabaseConfig holds PostgreSQL connection settings.
type DatabaseConfig struct {
	Host            string        `mapstructure:"host"`
	Port            int           `mapstructure:"port"`
	User            string        `mapstructure:"user"`
	Password        string        `mapstructure:"password"`
	Name            string        `mapstructure:"name"`
	SSLMode         string        `mapstructure:"ssl_mode"`
	MaxConns        int           `mapstructure:"max_conns"`
	MinConns        int           `mapstructure:"min_conns"`
	ConnTimeout     time.Duration `mapstructure:"conn_timeout"`
	ConnMaxLifetime time.Duration `mapstructure:"conn_max_lifetime"`
	DSN             string        `mapstructure:"dsn"`
}

// BuildDSN returns a PostgreSQL connection string.
func (c DatabaseConfig) BuildDSN() string {
	if c.DSN != "" {
		return c.DSN
	}

	user := url.QueryEscape(c.User)
	password := url.QueryEscape(c.Password)
	sslMode := c.SSLMode
	if sslMode == "" {
		sslMode = "disable"
	}

	return fmt.Sprintf(
		"postgres://%s:%s@%s:%d/%s?sslmode=%s",
		user,
		password,
		c.Host,
		c.Port,
		c.Name,
		sslMode,
	)
}

// RedisConfig holds Redis client settings.
type RedisConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	Password string `mapstructure:"password"`
	DB       int    `mapstructure:"db"`
	PoolSize int    `mapstructure:"pool_size"`
	Addr     string `mapstructure:"addr"`
}

// BuildAddr returns host:port for the Redis client.
func (c RedisConfig) BuildAddr() string {
	if c.Addr != "" {
		return c.Addr
	}
	return fmt.Sprintf("%s:%d", c.Host, c.Port)
}

// KafkaConfig holds Kafka client settings.
type KafkaConfig struct {
	Brokers       []string `mapstructure:"brokers"`
	ClientID      string   `mapstructure:"client_id"`
	GroupID       string   `mapstructure:"group_id"`
	ConsumeTopics []string `mapstructure:"consume_topics"`
}

// TelemetryConfig holds OpenTelemetry settings.
type TelemetryConfig struct {
	Enabled      bool   `mapstructure:"enabled"`
	OTLPEndpoint string `mapstructure:"otlp_endpoint"`
	ServiceName  string `mapstructure:"service_name"`
}

// HTTPConfig holds HTTP middleware settings.
type HTTPConfig struct {
	CORSAllowOrigins []string `mapstructure:"cors_allow_origins"`
}

// Load reads configuration from config.yaml with environment variable overrides.
func Load() (*Config, error) {
	_ = gotenv.Load(".env")

	v := viper.New()
	v.SetConfigName("config")
	v.SetConfigType("yaml")
	v.AddConfigPath("./config")
	v.AddConfigPath(".")

	setDefaults(v)
	bindEnv(v)
	v.AutomaticEnv()

	if err := v.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, fmt.Errorf("read config file: %w", err)
		}
	}

	cfg := &Config{
		Server: ServerConfig{
			Name:         v.GetString("server.name"),
			Env:          v.GetString("server.env"),
			Port:         v.GetInt("server.port"),
			GracefulTTL:  v.GetInt("server.graceful_ttl"),
			LogLevel:     v.GetString("server.log_level"),
			ReadTimeout:  v.GetDuration("server.read_timeout"),
			WriteTimeout: v.GetDuration("server.write_timeout"),
			IdleTimeout:  v.GetDuration("server.idle_timeout"),
		},
		Database: DatabaseConfig{
			Host:            v.GetString("database.host"),
			Port:            v.GetInt("database.port"),
			User:            v.GetString("database.user"),
			Password:        v.GetString("database.password"),
			Name:            v.GetString("database.name"),
			SSLMode:         v.GetString("database.ssl_mode"),
			MaxConns:        v.GetInt("database.max_conns"),
			MinConns:        v.GetInt("database.min_conns"),
			ConnTimeout:     v.GetDuration("database.conn_timeout"),
			ConnMaxLifetime: v.GetDuration("database.conn_max_lifetime"),
			DSN:             v.GetString("database.dsn"),
		},
		Redis: RedisConfig{
			Host:     v.GetString("redis.host"),
			Port:     v.GetInt("redis.port"),
			Password: v.GetString("redis.password"),
			DB:       v.GetInt("redis.db"),
			PoolSize: v.GetInt("redis.pool_size"),
			Addr:     v.GetString("redis.addr"),
		},
		Kafka: KafkaConfig{
			Brokers:       v.GetStringSlice("kafka.brokers"),
			ClientID:      v.GetString("kafka.client_id"),
			GroupID:       v.GetString("kafka.group_id"),
			ConsumeTopics: v.GetStringSlice("kafka.consume_topics"),
		},
		Telemetry: TelemetryConfig{
			Enabled:      v.GetBool("telemetry.enabled"),
			OTLPEndpoint: v.GetString("telemetry.otlp_endpoint"),
			ServiceName:  v.GetString("telemetry.service_name"),
		},
		HTTP: HTTPConfig{
			CORSAllowOrigins: v.GetStringSlice("http.cors_allow_origins"),
		},
	}

	applyLegacyEnvFallback(v, cfg)
	normalize(&cfg.Server, &cfg.Database, &cfg.Redis, &cfg.Kafka, &cfg.Telemetry, &cfg.HTTP)

	return cfg, nil
}

func setDefaults(v *viper.Viper) {
	v.SetDefault("server.name", "catalog-service")
	v.SetDefault("server.env", "development")
	v.SetDefault("server.port", 8082)
	v.SetDefault("server.graceful_ttl", 30)
	v.SetDefault("server.log_level", "info")
	v.SetDefault("server.read_timeout", "30s")
	v.SetDefault("server.write_timeout", "30s")
	v.SetDefault("server.idle_timeout", "120s")

	v.SetDefault("database.host", "localhost")
	v.SetDefault("database.port", 5432)
	v.SetDefault("database.user", "nova_catalog")
	v.SetDefault("database.password", "secret")
	v.SetDefault("database.name", "catalog_db")
	v.SetDefault("database.ssl_mode", "disable")
	v.SetDefault("database.max_conns", 25)
	v.SetDefault("database.min_conns", 5)
	v.SetDefault("database.conn_timeout", "5s")
	v.SetDefault("database.conn_max_lifetime", "300s")

	v.SetDefault("redis.host", "localhost")
	v.SetDefault("redis.port", 6379)
	v.SetDefault("redis.password", "")
	v.SetDefault("redis.db", 0)
	v.SetDefault("redis.pool_size", 10)

	v.SetDefault("kafka.brokers", []string{"localhost:9092"})
	v.SetDefault("kafka.client_id", "catalog-service")
	v.SetDefault("kafka.group_id", "catalog-service")
	v.SetDefault("kafka.consume_topics", []string{"user-events"})

	v.SetDefault("telemetry.enabled", false)
	v.SetDefault("telemetry.otlp_endpoint", "localhost:4317")
	v.SetDefault("telemetry.service_name", "catalog-service")

	v.SetDefault("http.cors_allow_origins", []string{"*"})
}

func bindEnv(v *viper.Viper) {
	replacer := strings.NewReplacer(".", "_")
	v.SetEnvKeyReplacer(replacer)

	envBindings := map[string][]string{
		"server.name":          {"SERVER_NAME", "APP_NAME"},
		"server.env":           {"SERVER_ENV", "APP_ENV"},
		"server.port":          {"SERVER_PORT", "APP_PORT"},
		"server.graceful_ttl":  {"SERVER_GRACEFUL_TTL", "APP_GRACEFUL_TTL"},
		"server.log_level":     {"SERVER_LOG_LEVEL", "APP_LOG_LEVEL"},
		"server.read_timeout":  {"SERVER_READ_TIMEOUT"},
		"server.write_timeout": {"SERVER_WRITE_TIMEOUT"},
		"server.idle_timeout":  {"SERVER_IDLE_TIMEOUT"},

		"database.host":              {"DB_HOST"},
		"database.port":              {"DB_PORT"},
		"database.user":              {"DB_USER"},
		"database.password":          {"DB_PASSWORD"},
		"database.name":              {"DB_NAME"},
		"database.ssl_mode":          {"DB_SSL_MODE"},
		"database.max_conns":         {"DB_MAX_CONNS", "DATABASE_MAX_OPEN_CONNS"},
		"database.min_conns":         {"DB_MIN_CONNS", "DATABASE_MAX_IDLE_CONNS"},
		"database.conn_timeout":      {"DB_CONN_TIMEOUT"},
		"database.conn_max_lifetime": {"DB_CONN_MAX_LIFETIME", "DATABASE_CONN_MAX_LIFETIME"},
		"database.dsn":               {"DATABASE_DSN"},

		"redis.host":      {"REDIS_HOST"},
		"redis.port":      {"REDIS_PORT"},
		"redis.password":  {"REDIS_PASSWORD"},
		"redis.db":        {"REDIS_DB"},
		"redis.pool_size": {"REDIS_POOL_SIZE"},
		"redis.addr":      {"REDIS_ADDR"},

		"kafka.brokers":         {"KAFKA_BROKERS"},
		"kafka.client_id":       {"KAFKA_CLIENT_ID"},
		"kafka.group_id":        {"KAFKA_GROUP_ID"},
		"kafka.consume_topics":  {"KAFKA_CONSUME_TOPICS"},

		"telemetry.enabled":       {"TELEMETRY_ENABLED"},
		"telemetry.otlp_endpoint": {"TELEMETRY_OTLP_ENDPOINT"},
		"telemetry.service_name":  {"TELEMETRY_SERVICE_NAME"},

		"http.cors_allow_origins": {"HTTP_CORS_ALLOW_ORIGINS"},
	}

	for key, envs := range envBindings {
		for _, env := range envs {
			_ = v.BindEnv(key, env)
		}
	}
}

func applyLegacyEnvFallback(v *viper.Viper, cfg *Config) {
	if cfg.Database.DSN == "" && v.GetString("database.dsn") == "" {
		if legacyDSN := v.GetString("DATABASE_DSN"); legacyDSN != "" {
			cfg.Database.DSN = legacyDSN
		}
	}
	if cfg.Redis.Addr == "" && v.GetString("redis.addr") == "" {
		if legacyAddr := v.GetString("REDIS_ADDR"); legacyAddr != "" {
			cfg.Redis.Addr = legacyAddr
		}
	}
	if len(cfg.Kafka.Brokers) == 0 {
		if brokers := v.GetString("KAFKA_BROKERS"); brokers != "" {
			cfg.Kafka.Brokers = strings.Split(brokers, ",")
		}
	}
	if len(cfg.Kafka.ConsumeTopics) == 0 {
		if topics := v.GetString("KAFKA_CONSUME_TOPICS"); topics != "" {
			cfg.Kafka.ConsumeTopics = strings.Split(topics, ",")
		}
	}
}

func normalize(
	server *ServerConfig,
	db *DatabaseConfig,
	redis *RedisConfig,
	kafka *KafkaConfig,
	telemetry *TelemetryConfig,
	http *HTTPConfig,
) {
	if server.LogLevel == "" {
		server.LogLevel = "info"
	}
	if server.ReadTimeout <= 0 {
		server.ReadTimeout = 30 * time.Second
	}
	if server.WriteTimeout <= 0 {
		server.WriteTimeout = 30 * time.Second
	}
	if server.IdleTimeout <= 0 {
		server.IdleTimeout = 120 * time.Second
	}
	if db.MaxConns <= 0 {
		db.MaxConns = 25
	}
	if db.MinConns <= 0 {
		db.MinConns = 5
	}
	if db.ConnTimeout <= 0 {
		db.ConnTimeout = 5 * time.Second
	}
	if db.ConnMaxLifetime <= 0 {
		db.ConnMaxLifetime = 300 * time.Second
	}
	if redis.Port <= 0 {
		redis.Port = 6379
	}
	if redis.PoolSize <= 0 {
		redis.PoolSize = 10
	}
	if kafka.ClientID == "" {
		kafka.ClientID = "catalog-service"
	}
	if kafka.GroupID == "" {
		kafka.GroupID = "catalog-service"
	}
	if len(kafka.ConsumeTopics) == 0 {
		kafka.ConsumeTopics = []string{"user-events"}
	}
	if telemetry.ServiceName == "" {
		telemetry.ServiceName = server.Name
	}
	if len(http.CORSAllowOrigins) == 0 {
		http.CORSAllowOrigins = []string{"*"}
	}
}
