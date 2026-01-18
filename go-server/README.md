# Go Server - Video Mobile Application Backend

A professional, modular Go backend server for the Video Mobile Application, built with Gin framework and GORM.

## Features

- **Authentication System**
  - User registration with password validation
  - User login with JWT tokens
  - Token refresh mechanism
  - Protected routes with JWT middleware
  - HTTP-only cookie support

- **Architecture**
  - Clean, modular architecture
  - Separation of concerns (handlers, services, repositories)
  - Dependency injection pattern
  - Professional folder structure

- **Database**
  - PostgreSQL with GORM
  - Automatic migrations
  - User model with password hashing

- **Security**
  - JWT-based authentication
  - Password hashing with bcrypt
  - CORS configuration
  - Input validation

## Project Structure

```
go-server/
├── cmd/
│   └── server/
│       └── main.go              # Application entry point
├── internal/
│   ├── config/                  # Configuration management
│   │   └── config.go
│   ├── constants/               # Application constants
│   │   └── constants.go
│   ├── database/                # Database connection and migrations
│   │   └── database.go
│   ├── dto/                     # Data Transfer Objects
│   │   └── auth_dto.go
│   ├── handler/                 # HTTP handlers (controllers)
│   │   ├── auth_handler.go
│   │   └── validation_handler.go
│   ├── middleware/              # HTTP middleware
│   │   ├── auth_middleware.go
│   │   ├── cors_middleware.go
│   │   └── logger_middleware.go
│   ├── models/                  # Database models
│   │   └── user.go
│   ├── repository/              # Data access layer
│   │   └── user_repository.go
│   ├── router/                  # Route setup
│   │   └── router.go
│   ├── service/                 # Business logic layer
│   │   └── auth_service.go
│   └── utils/                   # Utility functions
│       ├── cookie.go
│       ├── jwt.go
│       └── response.go
├── go.mod                       # Go module definition
├── go.sum                       # Go module checksums
├── .gitignore
└── README.md
```

## Prerequisites

- Go 1.21 or higher
- PostgreSQL 12 or higher
- Make (optional, for convenience commands)

## Installation

1. Clone the repository and navigate to the go-server directory:
```bash
cd go-server
```

2. Install dependencies:
```bash
go mod download
```

3. Create a `.env` file (copy from `.env.example` if available):
```bash
# Server Configuration
SERVER_PORT=8000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=video_app

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=*

# Assets URL
ASSETS_URL=http://localhost:8000
```

4. Make sure PostgreSQL is running and the database exists.

5. Run the server:
```bash
go run cmd/server/main.go
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user
  - Body: `{ "name": "John Doe", "email": "john@example.com", "password": "SecurePass123!" }`
  - Returns: User data and sets HTTP-only cookies

- `POST /api/auth/login` - Login user
  - Body: `{ "email": "john@example.com", "password": "SecurePass123!" }`
  - Returns: User data and sets HTTP-only cookies

- `POST /api/auth/token/refresh` - Refresh access token
  - Uses refresh token from cookie
  - Returns: Success message and sets new cookies

- `POST /api/auth/logout` - Logout user (requires authentication)
  - Clears authentication cookies

- `GET /api/auth/me` - Get current user (requires authentication)
  - Returns: Current user data

## Development

### Running in Development Mode

```bash
go run cmd/server/main.go
```

### Building for Production

```bash
go build -o bin/server cmd/server/main.go
./bin/server
```

### Running Tests

```bash
go test ./...
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SERVER_PORT` | Server port | `8000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `DB_HOST` | Database host | `postgres` |
| `DB_PORT` | Database port | `5432` |
| `POSTGRES_USER` | Database user | `postgres` |
| `POSTGRES_PASSWORD` | Database password | `postgres` |
| `POSTGRES_DB` | Database name | `video_app` |
| `JWT_SECRET` | JWT secret key | `your-secret-key` |
| `JWT_REFRESH_SECRET` | JWT refresh secret | `your-refresh-secret-key` |
| `JWT_EXPIRES_IN` | Access token expiration | `1h` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `7d` |
| `CORS_ORIGIN` | CORS origin | `*` |
| `ASSETS_URL` | Assets base URL | `http://localhost:8000` |

## Password Requirements

- Minimum 8 characters
- Maximum 128 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## Architecture Notes

- **Handlers**: Handle HTTP requests/responses, validation, and error handling
- **Services**: Contain business logic and orchestrate repository calls
- **Repositories**: Handle database operations (CRUD)
- **Models**: Define database schema and entity methods
- **Middleware**: Handle cross-cutting concerns (auth, CORS, logging)
- **Utils**: Reusable utility functions

## License

Private - UNLICENSED
