#!/bin/sh

# set -euo pipefail

set -o errexit
set -o pipefail
set -o nounset

echo "🚀 Starting the app..."

echo "📦 Running database migrations..."
npm run migration:run

echo "🌟 Starting production server..."
npm run start:prod
