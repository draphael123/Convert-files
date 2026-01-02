# OmniConvert Quick Start Guide

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Docker Desktop running
- [ ] FFmpeg installed (for audio/video conversions)
  - Windows: `choco install ffmpeg` or download from https://ffmpeg.org
  - Mac: `brew install ffmpeg`
  - Linux: `sudo apt-get install ffmpeg`

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Copy the example env file
cp env.example .env

# The defaults should work for local development, but you can customize:
# - DATABASE_URL (default: postgresql://postgres:postgres@localhost:5432/omniconvert)
# - REDIS_URL (default: redis://localhost:6379)
# - STORAGE_TYPE (default: local)
```

### 3. Start Infrastructure
```bash
# Start Postgres and Redis
docker-compose up -d

# Verify they're running
docker ps
```

### 4. Initialize Database
```bash
npm run migrate
```

### 5. Start the Application

**Terminal 1 - Web Server:**
```bash
npm run dev
```

**Terminal 2 - Worker:**
```bash
npm run worker
```

### 6. Open the App
Navigate to: http://localhost:3000

## Testing the Application

### Basic Conversion Test (Image)
1. Go to http://localhost:3000
2. Upload a PNG image
3. Select "JPG" as output format
4. Click "Start Conversion"
5. Wait for job to complete
6. Download the converted file

### Text Conversion Test
1. Create a CSV file with headers: `name,age\nJohn,30\nJane,25`
2. Upload the CSV file
3. Select "JSON" as output format
4. Start conversion
5. Download and verify the JSON output

## Troubleshooting

### Database Connection Issues
- Ensure Docker containers are running: `docker ps`
- Check Postgres logs: `docker logs omniconvert-postgres`
- Verify DATABASE_URL in .env matches docker-compose.yml

### Redis Connection Issues
- Check Redis logs: `docker logs omniconvert-redis`
- Verify REDIS_URL in .env

### Worker Not Processing Jobs
- Ensure worker is running in a separate terminal
- Check worker logs for errors
- Verify Redis is accessible

### FFmpeg Not Found (Audio/Video)
- Install FFmpeg (see Prerequisites)
- Verify installation: `ffmpeg -version`
- Audio/video conversions will fail without FFmpeg

### File Upload Fails
- Check file size (default max: 100MB)
- Verify file type is supported
- Check browser console for errors

## Development Workflow

1. **Make code changes** → Auto-reloads in dev mode
2. **Test locally** → Use the UI at localhost:3000
3. **Run tests** → `npm test`
4. **Check linting** → `npm run lint`

## Production Build

```bash
# Build the application
npm run build

# Start production server
npm start

# Start worker (separate process)
npm run worker
```

## Next Steps

- Add user authentication
- Set up S3 storage for production
- Configure proper rate limiting (Redis-based)
- Add antivirus scanning integration
- Implement file cleanup job
- Add monitoring and logging

