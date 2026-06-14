.PHONY: test-unit test-integration test-coverage

test-unit:
	go test ./... -tags unit -v -count=1

test-integration:
	go test ./internal/infrastructure/persistence/postgres/... -tags integration -v -count=1

test-coverage:
	go test ./... -tags unit -coverprofile=coverage.out -covermode=atomic
	go tool cover -html=coverage.out -o coverage.html
