#!/bin/sh

# set -euo pipefail

set -o errexit
set -o pipefail
set -o nounset

echo "🚀 Starting the app..."

# Optional: run migrations
# echo "📦 Running database migrations..."
# npm run migration:run -- --dataSource src/database/data-source.ts

npm run start:dev
