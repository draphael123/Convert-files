# OmniConvert

A **100% free** production-ready MVP web application for converting files between various formats, built with a plugin-based architecture for easy extensibility.

**✨ Completely Free - No Sign Up Required - No Hidden Costs**

## Features

- **Multiple Format Support**: Convert images, documents, text files, audio, and video
- **Async Processing**: Queue-based conversion system with job status tracking
- **Plugin Architecture**: Easy to add new converters
- **Secure**: File validation, sandboxed processing, rate limiting
- **Scalable**: Built with Next.js, Postgres, Redis, and BullMQ

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL
- **Queue**: Redis + BullMQ
- **Storage**: Local filesystem (dev) / S3-compatible (prod)
- **Conversion**: Sharp (images), FFmpeg (audio/video), LibreOffice (documents)

## Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- FFmpeg (for audio/video conversions)
- LibreOffice (for document conversions) - optional

### Setup

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp env.example .env
   # Edit .env with your configuration (defaults work for local dev)
   ```

3. **Start infrastructure**:
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**:
   ```bash
   npm run migrate
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **In a separate terminal, start the worker**:
   ```bash
   npm run worker
   ```

7. **Open your browser**:
   Navigate to `http://localhost:3000`

## Project Structure

```
omniconvert/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── (pages)/           # Frontend pages
│   └── layout.tsx
├── lib/
│   ├── conversion/        # Converter registry and plugins
│   ├── storage/           # Storage abstraction (local/S3)
│   ├── db/                # Database client and queries
│   └── queue/             # BullMQ setup
├── worker/                # Async conversion worker
├── scripts/               # Utility scripts (migrate, etc.)
├── storage/               # Local file storage (dev)
└── tests/                 # Test files
```

## Available Converters

### MVP Converters
- **Images**: PNG ↔ JPG ↔ WebP (via Sharp)
- **Text**: TXT/CSV/JSON ↔ CSV/JSON (simple transforms)
- **Audio**: MP3 ↔ WAV (via FFmpeg)
- **Video**: MP4 → WebM (via FFmpeg)
- **Documents**: DOCX → PDF (via LibreOffice headless) - *stubbed for MVP*

## API Endpoints

- `POST /api/uploads` - Upload a file
- `POST /api/jobs` - Create a conversion job
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/:id` - Get job status and download URL
- `GET /api/formats?inputMime=...` - Get available output formats

## Development Scripts

- `npm run dev` - Start Next.js dev server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run worker` - Start conversion worker
- `npm run migrate` - Run database migrations
- `npm test` - Run tests

## Security Features

- File type validation via magic bytes
- File size limits
- Rate limiting on API endpoints
- Sandboxed conversion processes with timeouts
- Signed download URLs
- Auto-deletion of files after retention period

## Testing

### Unit Tests
- Converter registry and format mapping
- Individual converter logic

### Integration Tests
- End-to-end conversion flow (image or text)

### E2E Checklist
- [ ] Upload PNG file
- [ ] Convert PNG → JPG
- [ ] Download converted file
- [ ] View job status
- [ ] Handle unsupported format gracefully

## Adding New Converters

1. Create a new converter class in `lib/conversion/converters/`
2. Implement the `Converter` interface
3. Register it in `lib/conversion/registry.ts`
4. The converter will automatically appear in the UI

Example:
```typescript
export class MyConverter implements Converter {
  id = 'my-converter'
  name = 'My Converter'
  supportedInputMimeTypes = ['application/x-custom']
  supportedOutputFormats = ['application/x-output']
  
  async run(inputPath: string, outputFormat: string): Promise<string> {
    // Conversion logic
    return outputPath
  }
}
```

## Limitations & Future Work

- Document conversion (DOCX → PDF) is stubbed - requires LibreOffice container setup
- Antivirus scanning is stubbed - integrate with ClamAV or similar
- User authentication is optional (nullable userId)
- File retention is configurable but not automatically cleaned up in MVP

## License

MIT

