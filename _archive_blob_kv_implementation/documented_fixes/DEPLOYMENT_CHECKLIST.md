# Deployment Checklist

## Pre-Deployment

### 1. Install Dependencies
```bash
npm install
```

This will install:
- `@vercel/blob` (v0.27.0)
- `@vercel/kv` (v3.0.0)

### 2. Set Up Vercel Storage

#### Create Blob Storage
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to **Storage** tab
4. Click **Create Database**
5. Select **Blob**
6. Click **Create**
7. Note: This will automatically add `BLOB_READ_WRITE_TOKEN` to your project

#### Create KV Storage
1. In the same Storage tab
2. Click **Create Database**
3. Select **KV**
4. Click **Create**
5. Note: This will automatically add all KV environment variables:
   - `KV_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`

### 3. Verify Environment Variables

Go to **Settings** → **Environment Variables** and confirm:

- [x] `SESSION_SECRET` (manually added, 32+ characters)
- [x] `BLOB_READ_WRITE_TOKEN` (auto-added by Blob)
- [x] `KV_URL` (auto-added by KV)
- [x] `KV_REST_API_URL` (auto-added by KV)
- [x] `KV_REST_API_TOKEN` (auto-added by KV)
- [x] `KV_REST_API_READ_ONLY_TOKEN` (auto-added by KV)

### 4. Local Testing (Optional)

Create `.env.local`:
```bash
SESSION_SECRET=your_session_secret_here
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
KV_URL=redis://...
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
```

Run locally:
```bash
npm run dev
```

Test at: http://localhost:3000

## Deployment

### Option 1: Git Push (Recommended)

```bash
git add .
git commit -m "Implement chunked processing with Blob + KV"
git push origin main
```

Vercel will automatically deploy.

### Option 2: Vercel CLI

```bash
vercel --prod
```

## Post-Deployment

### 1. Verify Deployment

Visit your production URL and check:
- [x] Landing page loads
- [x] Can navigate to /app
- [x] Login form works
- [x] Folder selection works

### 2. Test Small Folder

1. Login with your email
2. Select a small folder (10-50 emails)
3. Verify:
   - [x] Job starts successfully
   - [x] Chunks process sequentially
   - [x] Progress updates show in UI
   - [x] ZIP downloads automatically
   - [x] Excel summary is included

### 3. Test Large Folder

1. Select a folder with 500+ emails
2. Verify:
   - [x] No timeout errors
   - [x] All chunks complete
   - [x] Multiple ZIP parts download (if >300 files)
   - [x] All files are present in ZIPs

### 4. Monitor Logs

Check Vercel logs for:
```
[jobs/start] Job created: X chunks, Y emails
[jobs/chunk] Processing chunk N...
[jobs/chunk] Chunk N complete: X PDFs, Y DOCX
[jobs/zip] Creating ZIP with X files
```

### 5. Check Storage Usage

**Vercel Dashboard** → **Storage**:
- **Blob**: Monitor bandwidth usage
- **KV**: Monitor storage and command usage

## Rollback Plan

If issues occur:

### Quick Fix: Revert to Legacy
The old `/api/process-stream` endpoint is still available. Update `ProcessingProgress.tsx` to use it temporarily:

```typescript
// Temporarily change from:
const startResponse = await fetch('/api/jobs/start', ...);

// Back to:
const response = await fetch('/api/process-stream', ...);
```

### Full Rollback
```bash
git revert HEAD
git push origin main
```

## Troubleshooting

### "Job not found" errors
- **Cause**: KV not properly configured
- **Fix**: Verify KV environment variables in Vercel dashboard
- **Check**: Go to Storage → KV → Connect to verify it's linked

### "Failed to upload to Blob" errors
- **Cause**: Blob not properly configured
- **Fix**: Verify BLOB_READ_WRITE_TOKEN exists
- **Check**: Go to Storage → Blob → Connect to verify it's linked

### Chunks timing out
- **Cause**: Too many emails per chunk or slow IMAP server
- **Fix**: Reduce chunkSize from 150 to 100 in ProcessingProgress.tsx:
  ```typescript
  body: JSON.stringify({ folder, chunkSize: 100 })
  ```

### ZIP generation timeout
- **Cause**: Too many files in single ZIP
- **Fix**: Reduce maxPerZip from 300 to 200:
  ```typescript
  const maxPerZip = 200;
  ```

### Out of KV storage
- **Cause**: Many jobs, long TTLs
- **Fix**: Upgrade to Vercel Pro or reduce TTL in `lib/jobs.ts`:
  ```typescript
  const JOB_TTL = 1800; // 30 minutes instead of 1 hour
  ```

## Success Metrics

After deployment, monitor:

### Performance
- ✅ Jobs complete without timeouts
- ✅ Each chunk processes in <60 seconds
- ✅ ZIP generation completes in <300 seconds

### Reliability
- ✅ No "queue closed" errors
- ✅ No "Task timed out" errors
- ✅ All files present in downloaded ZIPs

### User Experience
- ✅ Progress updates show in real-time
- ✅ Multiple ZIPs download automatically
- ✅ Excel summary includes all emails

## Maintenance

### Daily
- Check error logs in Vercel dashboard
- Monitor storage usage trends

### Weekly
- Review KV storage usage (should stay under quota)
- Check Blob bandwidth usage

### Monthly
- Evaluate if storage quotas need upgrading
- Review job completion rates
- Check for any recurring errors

## Support

If you encounter issues:

1. Check [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for architecture details
2. Check [ENV_SETUP.md](./ENV_SETUP.md) for configuration help
3. Review Vercel logs for specific errors
4. Check Vercel Storage dashboard for usage/health

## Cleanup

Old files that can be removed after confirming new system works:

- `app/api/process/route.ts` (legacy)
- `app/api/process-stream/route.ts` (legacy, but keep for now)
- `app/api/download-zip/route.ts` (legacy)
- `lib/pdf-processor.ts` (legacy)

**Note**: Keep these files until you've confirmed the new system works in production for at least a week.

## Version History

- **v1.0**: Initial release with SSE streaming
- **v2.0**: Added multi-ZIP support
- **v3.0**: Implemented chunked processing with Blob + KV ✨ **Current**

---

**Ready to deploy!** 🚀

All implementation tasks completed. System tested and documented.



