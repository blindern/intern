#!/bin/bash
set -e

# Run migrations before starting the server.
# --force is required in production (APP_ENV != local).
gosu www-data php artisan migrate --force

exec apache2-foreground "$@"
