# Deployment Guide for OmniConvert

This guide covers deploying OmniConvert to various platforms.

## 🚀 Quick Deploy Options

### Option 1: Vercel (Recommended for Next.js)

Vercel is the easiest way to deploy Next.js applications with zero configuration.

#### Steps:

1. **Push your code to GitHub** (already done ✅)

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository: `draphael123/Convert-files`

3. **Configure Environment Variables**:
   Add these in Vercel's project settings:
   ```
   DATABASE_URL=your_postgres_connection_string
   REDIS_URL=your_redis_connection_string
   STORAGE_TYPE=s3
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_REGION=us-east-1
   S3_BUCKET=your_bucket_name
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

4. **Deploy**:
   - Vercel will automatically detect Next.js
   - Click "Deploy"
   - Your app will be live in minutes!

#### Note:
- Vercel handles the Next.js frontend and API routes
- You'll need to deploy the worker separately (see Worker Deployment below)

---

### Option 2: Railway

Railway is great for full-stack apps with databases and workers.

#### Steps:

1. **Go to [railway.app](https://railway.app)**
2. **Create New Project** → "Deploy from GitHub repo"
3. **Select your repository**
4. **Add Services**:
   - **Postgres**: Add PostgreSQL service
   - **Redis**: Add Redis service
   - **Web Service**: Deploy your Next.js app
   - **Worker Service**: Deploy the worker process

5. **Configure Environment Variables** for each service

6. **Deploy**: Railway auto-deploys on push to main

---

### Option 3: Render

Similar to Railway, good for full-stack deployments.

#### Steps:

1. **Go to [render.com](https://render.com)**
2. **Create New** → "Web Service"
3. **Connect GitHub** and select your repo
4. **Configure**:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment: Node

5. **Add Services**:
   - PostgreSQL database
   - Redis instance
   - Background Worker (for conversion jobs)

---

### Option 4: Self-Hosted with Docker

For full control, deploy using Docker.

#### Steps:

1. **Build Docker images**:
   ```bash
   docker build -t omniconvert-app .
   docker build -t omniconvert-worker -f Dockerfile.worker .
   ```

2. **Use docker-compose.prod.yml**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

---

## 🔧 Worker Deployment

The conversion worker needs to run as a separate process. Options:

### Option A: Railway/Render Background Worker
- Add a background worker service
- Set command: `npm run worker`
- Use same environment variables

### Option B: Separate Server
- Deploy worker on a VPS (DigitalOcean, AWS EC2, etc.)
- Run: `npm run worker`
- Ensure it can access Redis and storage

### Option C: Docker Container
- Run worker in a separate container
- Use docker-compose or Kubernetes

---

## 📋 Required Services

### Database (PostgreSQL)
- **Vercel**: Use Vercel Postgres or external provider (Supabase, Neon, etc.)
- **Railway**: Built-in PostgreSQL service
- **Render**: Built-in PostgreSQL service
- **Self-hosted**: Use docker-compose or managed service

### Redis
- **Vercel**: Use Upstash Redis or Redis Cloud
- **Railway**: Built-in Redis service
- **Render**: Built-in Redis service
- **Self-hosted**: Use docker-compose or managed service

### Storage
- **Development**: Local filesystem (not recommended for production)
- **Production**: S3-compatible storage (AWS S3, DigitalOcean Spaces, etc.)

---

## 🔐 Environment Variables Checklist

Make sure to set these in your deployment platform:

```bash
# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# Storage (Production)
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
S3_BUCKET=...
S3_ENDPOINT=... # Optional, for S3-compatible services

# App
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Security
MAX_FILE_SIZE_MB=100
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Worker
WORKER_CONCURRENCY=3
WORKER_TIMEOUT_MS=300000
```

---

## 🚦 Post-Deployment Checklist

- [ ] Database migrations run successfully
- [ ] Redis connection working
- [ ] Storage (S3) configured and accessible
- [ ] Worker process running and processing jobs
- [ ] Environment variables set correctly
- [ ] Test file upload and conversion
- [ ] Monitor logs for errors
- [ ] Set up monitoring/alerting (optional)

---

## 📝 Deployment Notes

1. **Vercel Limitations**:
   - API routes have 10s timeout on Hobby plan (30s on Pro)
   - Worker must be deployed separately
   - Consider using Vercel Edge Functions for lighter operations

2. **Database Migrations**:
   - Run migrations after first deployment:
     ```bash
     npm run migrate
     ```
   - Or use a migration service/script in your deployment pipeline

3. **FFmpeg for Audio/Video**:
   - Most platforms don't include FFmpeg by default
   - Use a Docker image with FFmpeg pre-installed
   - Or use a service like Cloudinary for media processing

4. **File Size Limits**:
   - Adjust based on your platform's limits
   - Vercel: 4.5MB for serverless functions
   - Consider direct S3 uploads for large files

---

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## 🆘 Troubleshooting

### Worker not processing jobs
- Check Redis connection
- Verify worker is running
- Check worker logs

### Database connection errors
- Verify DATABASE_URL format
- Check database is accessible from your deployment
- Ensure migrations have run

### File upload failures
- Check storage configuration
- Verify S3 credentials
- Check file size limits

### Conversion timeouts
- Increase WORKER_TIMEOUT_MS
- Check FFmpeg is installed (for audio/video)
- Monitor resource usage



