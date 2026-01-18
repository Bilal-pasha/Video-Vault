.PHONY: build run test clean deps

# Build the application
build:
	go build -o bin/server cmd/server/main.go

# Run the application
run:
	go run cmd/server/main.go

# Run tests
test:
	go test ./...

# Clean build artifacts
clean:
	rm -rf bin/

# Download dependencies
deps:
	go mod download
	go mod tidy

# Run with hot reload (requires air)
dev:
	air -c .air.toml

# Build Docker image
docker-build:
	docker build -t go-server:latest .

# Build Docker image for development
docker-build-dev:
	docker build -f Dockerfile.dev -t go-server:dev .
