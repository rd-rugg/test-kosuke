#!/bin/sh
set -e

# Environment variable defaults
SKIP_TEMPLATE_INIT=${SKIP_TEMPLATE_INIT:-false}
DEV_MODE=${DEV_MODE:-true}
TEMPLATE_VERSION=${TEMPLATE_VERSION:-1.0.0}

# Print system information
echo "🚀 Node version: $(node -v)"
echo "📦 NPM version: $(npm -v)"
echo "🏷️  Template version: $TEMPLATE_VERSION"

# Check if template initialization should be skipped
if [ "$SKIP_TEMPLATE_INIT" = "true" ]; then
  echo "⏭️  Skipping template initialization (SKIP_TEMPLATE_INIT=true)"
else
  # Check if /app is empty or doesn't have package.json (new project initialization)
  if [ ! -f "/app/package.json" ]; then
    echo "🚀 Initializing new project from template..."

    # Ensure /app directory exists
    mkdir -p /app

    # Copy all template files to /app (mounted volume), excluding node_modules first
    echo "📁 Copying template files..."
    find /template -mindepth 1 -maxdepth 1 ! -name "node_modules" -exec cp -r {} /app/ \; 2>/dev/null || true

    # Copy essential hidden files only
    echo "📁 Copying essential hidden files..."
    for file in .env.example .env.local .gitignore .editorconfig .nvmrc; do
      if [ -f "/template/$file" ]; then
        cp "/template/$file" "/app/$file" 2>/dev/null || true
      fi
    done

    # Copy node_modules separately with proper handling
    if [ -d "/template/node_modules" ]; then
      echo "📦 Copying node_modules (this may take a moment)..."
      cp -r /template/node_modules /app/ 2>/dev/null || {
        echo "⚠️  Failed to copy node_modules, running npm install instead..."
        cd /app && npm install --silent
      }
    else
      echo "📦 Installing dependencies..."
      cd /app && npm install --silent
    fi

    # Copy .env.example to .env.local if it doesn't exist
    if [ -f "/app/.env.example" ] && [ ! -f "/app/.env.local" ]; then
      echo "📝 Creating .env.local from .env.example..."
      cp /app/.env.example /app/.env.local
    fi

    # Set proper ownership for mounted volumes
    if [ -n "$PUID" ] && [ -n "$PGID" ]; then
      echo "👤 Setting file ownership to $PUID:$PGID..."
      chown -R $PUID:$PGID /app 2>/dev/null || true
    fi

    echo "✅ Project initialized with template files"
    echo "🎯 Template version: $TEMPLATE_VERSION"
  else
    echo "📁 Project files already exist, skipping template initialization"
  fi
fi

# Change to app directory
cd /app

# Show current working directory and list files for debugging
echo "📍 Working directory: $(pwd)"
if [ "$DEV_MODE" = "true" ]; then
  echo "📋 Project structure:"
  ls -la | head -10
fi

# Execute the command passed to docker run
echo "🚀 Starting application..."
exec "$@" 