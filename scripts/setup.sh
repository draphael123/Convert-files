#!/bin/bash

# Setup script for OmniConvert

echo "🚀 Setting up OmniConvert..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start infrastructure
echo "📦 Starting Docker containers..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Run migrations
echo "🗄️  Running database migrations..."
npm run migrate

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env and configure if needed"
echo "2. Run 'npm install' to install dependencies"
echo "3. Run 'npm run dev' to start the development server"
echo "4. Run 'npm run worker' in a separate terminal to start the worker"

