#!/bin/sh
set -e

# Print the Node.js and npm versions
echo "🚀 Node version: $(node -v)"
echo "📦 NPM version: $(npm -v)"

# Execute the command passed to the script
echo "🚀 Starting Next.js development server..."
exec "$@" 