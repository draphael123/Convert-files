# Setup script for OmniConvert (PowerShell)

Write-Host "🚀 Setting up OmniConvert..." -ForegroundColor Cyan

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

# Start infrastructure
Write-Host "📦 Starting Docker containers..." -ForegroundColor Yellow
docker-compose up -d

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Run migrations
Write-Host "🗄️  Running database migrations..." -ForegroundColor Yellow
npm run migrate

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Copy .env.example to .env and configure if needed"
Write-Host "2. Run 'npm install' to install dependencies"
Write-Host "3. Run 'npm run dev' to start the development server"
Write-Host "4. Run 'npm run worker' in a separate terminal to start the worker"



