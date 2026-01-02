# Vercel Storage Configuration

## ⚠️ Important: Local Storage Won't Work on Vercel

Vercel is a serverless platform with a **read-only filesystem**. You **cannot** write files to the local filesystem on Vercel.

## ✅ Solution: Use S3 Storage

You **must** configure S3 (or S3-compatible) storage for file uploads to work on Vercel.

### Required Environment Variables

Add these to your Vercel project settings (Settings → Environment Variables):

```
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET=your-bucket-name
```

### Optional S3-Compatible Services

You can also use S3-compatible services like:
- **Cloudflare R2** (free tier available)
- **DigitalOcean Spaces**
- **Backblaze B2**
- **MinIO**

For S3-compatible services, also add:
```
S3_ENDPOINT=https://your-endpoint.com
```

### Quick Setup with Cloudflare R2 (Free)

1. Create a Cloudflare R2 bucket
2. Get your API token and credentials
3. Set environment variables:
   ```
   STORAGE_TYPE=s3
   AWS_ACCESS_KEY_ID=your_r2_access_key
   AWS_SECRET_ACCESS_KEY=your_r2_secret_key
   AWS_REGION=auto
   S3_BUCKET=your-bucket-name
   S3_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
   ```

### Testing Locally

For local development, you can use local storage:
```
STORAGE_TYPE=local
STORAGE_LOCAL_PATH=./storage
```

But remember: **this won't work on Vercel!**

## 🔍 Troubleshooting Upload Failures

If uploads are failing:

1. **Check environment variables** - Ensure all S3 variables are set
2. **Verify S3 credentials** - Test with AWS CLI or S3 browser
3. **Check bucket permissions** - Bucket must allow read/write
4. **Review Vercel logs** - Check function logs for specific errors
5. **Test file size** - Ensure files are under the limit (default: 100MB)

## 📝 Current Error Messages

The app now provides more detailed error messages:
- If storage is not configured: "File storage not configured. Please configure S3 storage for production deployments."
- If file type cannot be determined: More lenient validation with extension fallback
- If upload fails: Specific error message from the storage adapter

