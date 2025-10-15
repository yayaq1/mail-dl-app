# Email PDF Extractor Web App

A Next.js web application that allows users to extract PDF attachments from their email inbox. Built with TypeScript, React, and deployed on Vercel.

## Features

- 🔐 Secure email authentication with session-based credential storage
- 📧 Support for multiple email providers (Gmail, Outlook, Yahoo, Dreamhost, iCloud, AOL, and custom IMAP)
- 📁 Browse and select email folders
- 📎 Extract all PDF attachments from selected folder
- 📊 Generate Excel summary with email metadata
- 📦 Download everything as a ZIP archive
- 🛡️ Encrypted session data with auto-expiration
- 🎨 Modern, responsive UI with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Email**: IMAP protocol via `imap` package
- **PDF Processing**: Custom processing with `mailparser`
- **Excel Generation**: `exceljs`
- **Session Management**: `iron-session`
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ 
- npm or yarn
- A Vercel account (for deployment)

## Local Development

1. **Clone the repository**
   ```bash
   cd web-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set a secure session secret (at least 32 characters):
   ```
   SESSION_SECRET=your_very_long_and_secure_random_string_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import project in Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Select the `web-app` folder as the root directory

3. **Configure environment variables**
   - In Vercel project settings, go to "Environment Variables"
   - Add `SESSION_SECRET` with a secure random string (32+ characters)
   - You can generate one with: `openssl rand -base64 32`

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set environment variable**
   ```bash
   vercel env add SESSION_SECRET
   ```
   Enter a secure random string when prompted.

5. **Redeploy with environment variables**
   ```bash
   vercel --prod
   ```

## Email Provider Configuration

### Gmail
**Important**: Gmail requires an "App Password" instead of your regular password.

1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account → Security → 2-Step Verification → App passwords
3. Generate an app password for "Mail"
4. Use this app password in the web app

### Outlook/Office 365
- Use your regular email and password
- May require enabling IMAP in settings

### Dreamhost
- Use your full email address and password
- IMAP is enabled by default

### Custom IMAP Server
- Select "Custom IMAP Server" from the provider dropdown
- Enter your IMAP server address and port (usually 993)
- Use your email credentials

## Security Considerations

- ✅ Credentials are encrypted using `iron-session`
- ✅ Sessions expire after 30 minutes of inactivity
- ✅ Credentials are never logged or stored permanently
- ✅ All communication uses HTTPS (enforced by Vercel)
- ✅ Temporary files are cleaned up after processing
- ✅ No database required - fully stateless

## Vercel Configuration

The app is configured for Vercel with:
- Extended timeout for `/api/process` route (300 seconds for Pro plan, 60s for Hobby)
- Serverless functions for all API routes
- Automatic HTTPS
- Edge network for global performance

### Important Notes for Vercel Deployment

1. **Execution Time Limits**:
   - Hobby plan: 60 seconds max (may timeout with large inboxes)
   - Pro plan: 300 seconds max
   - Consider upgrading to Pro for better experience

2. **Memory Limits**:
   - Hobby plan: 1024 MB
   - Pro plan: 3008 MB

3. **File Storage**:
   - Uses `/tmp` directory (512MB limit)
   - Files are automatically cleaned up after response

## Troubleshooting

### "Failed to connect to email server"
- Verify your email and password are correct
- For Gmail, ensure you're using an App Password
- Check if IMAP is enabled in your email settings
- Verify the IMAP server and port are correct

### "Session expired"
- Sessions expire after 30 minutes
- Simply login again to create a new session

### Timeout errors
- Large inboxes may take time to process
- Consider upgrading to Vercel Pro for longer execution time
- Or process fewer emails by selecting specific folders

### No PDFs found
- Verify the selected folder contains emails with PDF attachments
- Check that attachments are actually PDFs (not links)

## Project Structure

```
web-app/
├── app/
│   ├── api/
│   │   ├── folders/route.ts    # Fetch email folders
│   │   ├── process/route.ts    # Process emails and extract PDFs
│   │   └── logout/route.ts     # Clear session
│   ├── page.tsx                # Main application page
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
├── components/
│   ├── EmailLoginForm.tsx      # Login form component
│   ├── FolderSelector.tsx      # Folder selection component
│   └── DownloadResult.tsx      # Results display component
├── lib/
│   ├── imap.ts                 # IMAP client implementation
│   ├── providers.ts            # Email provider configurations
│   ├── session.ts              # Session management
│   └── pdf-processor.ts        # PDF extraction and Excel generation
├── types/
│   └── index.ts                # TypeScript type definitions
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── next.config.js              # Next.js configuration
└── vercel.json                 # Vercel deployment configuration
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SESSION_SECRET` | Secret key for encrypting session data (32+ chars) | Yes | - |
| `NODE_ENV` | Node environment | No | development |

## API Routes

### POST /api/folders
Authenticates with email server and retrieves folder list.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password",
  "imapServer": "imap.example.com",
  "imapPort": 993
}
```

**Response:**
```json
{
  "success": true,
  "folders": ["INBOX", "Sent", "Drafts"]
}
```

### POST /api/process
Processes emails in selected folder and returns ZIP file.

**Request Body:**
```json
{
  "folder": "INBOX"
}
```

**Response:**
- Content-Type: `application/zip`
- Headers: `X-Total-Emails`, `X-Total-PDFs`
- Body: ZIP file containing PDFs and Excel summary

### POST /api/logout
Clears the user session.

**Response:**
```json
{
  "success": true
}
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.


