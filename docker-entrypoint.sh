#!/bin/sh
set -e

# Environment variable defaults
DEV_MODE=${DEV_MODE:-true}

# Print system information
echo "🚀 Node version: $(node -v)"
echo "📦 NPM version: $(npm -v)"

# Check if package.json exists (should exist from GitHub template)
if [ ! -f "package.json" ]; then
  echo "❌ No package.json found. Project should be initialized via GitHub template."
  echo "🔗 Get started at: https://github.com/filopedraz/kosuke-template"
  exit 1
fi

echo "📁 Working directory: $(pwd)"

echo "📦 Installing dependencies..."
npm install --silent  
echo "📦 Dependencies installed"

# Create .env.local from .env.example if it doesn't exist
if [ -f ".env.example" ] && [ ! -f ".env" ]; then
  echo "📝 Creating .env from .env.example..."
  cp .env.example .env
fi

# Run database migrations/push schema
echo "🗄️ Setting up database schema..."
npm run db:push || {
  echo "⚠️ Database setup failed. Make sure PostgreSQL is running and accessible."
  echo "   You can start it with: docker compose up -d postgres"
}

# Show project structure for debugging in dev mode
if [ "$DEV_MODE" = "true" ]; then
  echo "📋 Project structure:"
  ls -la | head -20
fi

# Set proper ownership for mounted volumes if specified
if [ -n "$PUID" ] && [ -n "$PGID" ]; then
  echo "👤 Setting file ownership to $PUID:$PGID..."
  chown -R $PUID:$PGID . 2>/dev/null || true
fi

# Execute the command passed to docker run
echo "🚀 Starting application..."
exec "$@" 