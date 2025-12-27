# Database Migrations

## Running Migrations

### Development
```bash
cd server
npm run migration:run
```

### Production (in Docker)
```bash
docker-compose -f infra/prod/docker-compose.yml exec backend npm run migration:run
```

## Available Migrations

1. **AddRoleColumn** - Adds `role` column to users table
2. **CreateSuperAdmin** - Creates super admin user:
   - Email: `bilalpasha.dev@gmail.com`
   - Password: `Paskistan@123`
   - Role: `super_admin`

## Migration Scripts

- `npm run migration:run` - Run all pending migrations
- `npm run migration:revert` - Revert the last migration
- `npm run migration:generate` - Generate a new migration from entity changes
- `npm run migration:create` - Create an empty migration file

## Notes

- Migrations are automatically run in development if `synchronize: true` is enabled
- In production, always run migrations manually before starting the application
- The super admin migration checks if the user already exists before inserting


