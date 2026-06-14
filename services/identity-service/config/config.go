package config

import (
	"fmt"
	"strings"

	"github.com/spf13/viper"
	"github.com/subosito/gotenv"
)

// Config holds all identity-service configuration.
type Config struct {
	App struct {
		Name        string `mapstructure:"name"`
		Env         string `mapstructure:"env"`
		Port        int    `mapstructure:"port"`
		GracefulTTL int    `mapstructure:"graceful_ttl"`
		LogLevel    string `mapstructure:"log_level"`
	} `mapstructure:"app"`

	Database DatabaseConfig `mapstructure:"database"`
	Redis    RedisConfig    `mapstructure:"redis"`

	Kafka struct {
		Brokers []string `mapstructure:"brokers"`
		GroupID string   `mapstructure:"group_id"`
	} `mapstructure:"kafka"`

	JWT struct {
		PrivateKeyPath string `mapstructure:"private_key_path"`
		PublicKeyPath  string `mapstructure:"public_key_path"`
		AccessTTL      int    `mapstructure:"access_ttl"`
		RefreshTTL     int    `mapstructure:"refresh_ttl"`
	} `mapstructure:"jwt"`

	Telemetry struct {
		OTLPEndpoint string `mapstructure:"otlp_endpoint"`
		ServiceName  string `mapstructure:"service_name"`
	} `mapstructure:"telemetry"`

	HTTP struct {
		CORSAllowOrigins []string `mapstructure:"cors_allow_origins"`
	} `mapstructure:"http"`
}

// DatabaseConfig holds PostgreSQL pool settings.
type DatabaseConfig struct {
	DSN             string `mapstructure:"dsn"`
	MaxOpenConns    int    `mapstructure:"max_open_conns"`
	MaxIdleConns    int    `mapstructure:"max_idle_conns"`
	ConnMaxLifetime int    `mapstructure:"conn_max_lifetime"`
}

// RedisConfig holds Redis client settings.
type RedisConfig struct {
	Addr     string `mapstructure:"addr"`
	Password string `mapstructure:"password"`
	DB       int    `mapstructure:"db"`
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

	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	v.AutomaticEnv()

	if err := v.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, fmt.Errorf("read config file: %w", err)
		}
	}

	var cfg Config
	if err := v.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("unmarshal config: %w", err)
	}

	if cfg.App.LogLevel == "" {
		cfg.App.LogLevel = "info"
	}
	if cfg.Telemetry.ServiceName == "" {
		cfg.Telemetry.ServiceName = cfg.App.Name
	}
	if len(cfg.HTTP.CORSAllowOrigins) == 0 {
		cfg.HTTP.CORSAllowOrigins = []string{"*"}
	}

	return &cfg, nil
}

func setDefaults(v *viper.Viper) {
	v.SetDefault("app.name", "identity-service")
	v.SetDefault("app.env", "development")
	v.SetDefault("app.port", 8081)
	v.SetDefault("app.graceful_ttl", 30)
	v.SetDefault("app.log_level", "info")

	v.SetDefault("database.max_open_conns", 25)
	v.SetDefault("database.max_idle_conns", 5)
	v.SetDefault("database.conn_max_lifetime", 300)

	v.SetDefault("jwt.access_ttl", 15)
	v.SetDefault("jwt.refresh_ttl", 7)

	v.SetDefault("telemetry.service_name", "identity-service")
}
