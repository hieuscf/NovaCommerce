package main

import (
	"context"
	"fmt"
	"time"

	"github.com/novacommerce/services/catalog-service/config"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.24.0"
)

func initTelemetry(ctx context.Context, cfg *config.Config, version string) (func(context.Context) error, error) {
	if !cfg.Telemetry.Enabled {
		return func(context.Context) error { return nil }, nil
	}

	serviceName := cfg.Telemetry.ServiceName
	if serviceName == "" {
		serviceName = cfg.Server.Name
	}

	res, err := resource.New(ctx,
		resource.WithAttributes(
			semconv.ServiceName(serviceName),
			semconv.ServiceVersion(version),
			semconv.DeploymentEnvironment(cfg.Server.Env),
		),
	)
	if err != nil {
		return nil, fmt.Errorf("create otel resource: %w", err)
	}

	traceExporter, err := otlptracegrpc.New(ctx,
		otlptracegrpc.WithEndpoint(cfg.Telemetry.OTLPEndpoint),
		otlptracegrpc.WithInsecure(),
	)
	if err != nil {
		return nil, fmt.Errorf("create trace exporter: %w", err)
	}

	traceProvider := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(traceExporter),
		sdktrace.WithResource(res),
	)
	otel.SetTracerProvider(traceProvider)

	metricExporter, err := otlpmetricgrpc.New(ctx,
		otlpmetricgrpc.WithEndpoint(cfg.Telemetry.OTLPEndpoint),
		otlpmetricgrpc.WithInsecure(),
	)
	if err != nil {
		return nil, fmt.Errorf("create metric exporter: %w", err)
	}

	meterProvider := metric.NewMeterProvider(
		metric.WithReader(metric.NewPeriodicReader(metricExporter, metric.WithInterval(15*time.Second))),
		metric.WithResource(res),
	)
	otel.SetMeterProvider(meterProvider)

	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(
		propagation.TraceContext{},
		propagation.Baggage{},
	))

	shutdown := func(shutdownCtx context.Context) error {
		var shutdownErr error
		if err := traceProvider.Shutdown(shutdownCtx); err != nil {
			shutdownErr = fmt.Errorf("shutdown trace provider: %w", err)
		}
		if err := meterProvider.Shutdown(shutdownCtx); err != nil {
			if shutdownErr != nil {
				return fmt.Errorf("%v; shutdown meter provider: %w", shutdownErr, err)
			}
			return fmt.Errorf("shutdown meter provider: %w", err)
		}
		return shutdownErr
	}

	return shutdown, nil
}
