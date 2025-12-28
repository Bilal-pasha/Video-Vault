#!/bin/sh

# set -euo pipefail

set -o errexit
set -o pipefail
set -o nounset

echo "📦 Running database migrations..."
npm run migration:run
