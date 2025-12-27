# Development Docker Compose Setup

## Overview
This development setup is optimized for local development with:
- Hot reload enabled for backend
- Exposed ports for direct access
- Development-friendly configurations
- Separate volumes to avoid conflicts with production

## Services

### Backend
- **Port**: `8000` (exposed)
- **Hot Reload**: Enabled via volume mount
- **Command**: `npm run start:dev`
- **Database**: `video_app_dev`

### PostgreSQL
- **Port**: `5432` (exposed for direct access)
- **Database**: `video_app_dev`
- **Access**: Direct connection from host machine

### pgAdmin
- **Port**: `5050` (exposed)
- **URL**: http://localhost:5050
- **Email**: admin@admin.com
- **Password**: admin

### Redis
- **Port**: `6379` (exposed for direct access)
- **Password**: redis

## Usage

### Start all services
```bash
cd infra/dev
docker-compose up -d
```

### View logs
```bash
docker-compose logs -f backend
```

### Stop all services
```bash
docker-compose down
```

### Stop and remove volumes (clean slate)
```bash
docker-compose down -v
```

### Rebuild backend
```bash
docker-compose build backend
docker-compose up -d backend
```

## Environment Variables

Create a `.env` file in `infra/dev/` with:

```env
# Server Configuration
NODE_ENV=development
BACKEND_PORT=8000

# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=video_app_dev
POSTGRES_PORT=5432

# JWT Configuration (use weak secrets for dev)
JWT_SECRET=dev-secret-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=dev-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=30d

# Redis Configuration
REDIS_PASSWORD=redis
REDIS_PORT=6379

# pgAdmin Configuration
PGADMIN_EMAIL=admin@admin.com
PGADMIN_PASSWORD=admin
PGADMIN_PORT=5050
```

## Development Workflow

1. **Start services**: `docker-compose up -d`
2. **Make code changes**: Edit files in `server/src/`
3. **Auto-reload**: Backend automatically restarts on file changes
4. **Access services**:
   - Backend API: http://localhost:8000
   - pgAdmin: http://localhost:5050
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

## Differences from Production

- **Hot reload**: Source code is mounted as volume
- **Exposed ports**: All services accessible from host
- **Development database**: Separate `video_app_dev` database
- **Longer JWT expiry**: 24h access, 30d refresh (for convenience)
- **No Caddy**: Direct access to services
- **Separate volumes**: `*_dev_data` volumes to avoid conflicts

