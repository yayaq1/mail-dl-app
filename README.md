# Fetchr - Email Attachment Downloader

A beautiful Next.js web application with an elegant landing page that allows users to bulk download PDF and DOCX attachments from their email inbox. Built with TypeScript, React, GSAP animations, and deployed on Vercel.

## Features

### Landing Page
- ✨ Beautiful, animated hero section with GSAP
- 📜 Smooth scroll effects with Lenis
- 🎨 Modern, elegant design with Crimson Pro typography
- 🌗 Light/Dark mode support
- 📱 Fully responsive design

### Application
- 🔐 Secure email authentication with session-based credential storage
- 📧 Support for multiple email providers (Gmail, Outlook, Yahoo, Dreamhost, iCloud, AOL, and custom IMAP)
- 📁 Browse and select email folders
- 📎 Extract all PDF and DOCX attachments from selected folder
- 📊 Generate Excel summary with email metadata
- 📦 Download everything as a ZIP archive
- 🛡️ Encrypted session data with auto-expiration
- 🌈 Modern, responsive UI with Tailwind CSS and theme toggle

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: GSAP (GreenSock Animation Platform)
- **Smooth Scrolling**: Lenis
- **Typography**: Crimson Pro (Google Fonts)
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
   - Landing page: [http://localhost:3000](http://localhost:3000)
   - Main application: [http://localhost:3000/app](http://localhost:3000/app)

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
mail-dl-app/
├── app/
│   ├── api/                    # API routes
│   │   ├── folders/route.ts    # Fetch email folders
│   │   ├── process/route.ts    # Process emails (legacy)
│   │   ├── process-stream/route.ts  # Stream processing (recommended)
│   │   ├── download-zip/route.ts    # Download ZIP file
│   │   └── logout/route.ts     # Clear session
│   ├── app/                    # Main application route
│   │   ├── page.tsx            # Application page
│   │   └── layout.tsx          # App-specific layout
│   ├── page.tsx                # Landing page
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles with theme support
├── components/
│   ├── LandingHeader.tsx       # Landing page header with theme toggle
│   ├── HeroSection.tsx         # Animated hero section
│   ├── ScrollHighlightSection.tsx  # GSAP scroll animations
│   ├── LandingFooter.tsx       # Landing page footer
│   ├── SmoothScroll.tsx        # Lenis smooth scroll wrapper
│   ├── EmailLoginForm.tsx      # Login form component
│   ├── FolderSelector.tsx      # Folder selection component
│   ├── ProcessingProgress.tsx  # Real-time processing display
│   ├── DownloadResult.tsx      # Results display component
│   ├── Header.tsx              # App header
│   ├── ThemeToggle.tsx         # Light/Dark mode toggle
│   └── ui/                     # Reusable UI components
├── lib/
│   ├── imap.ts                 # IMAP client implementation
│   ├── providers.ts            # Email provider configurations
│   ├── session.ts              # Session management
│   └── pdf-processor.ts        # PDF/DOCX extraction and Excel generation
├── types/
│   └── index.ts                # TypeScript type definitions
├── package.json                # Dependencies (includes GSAP, Lenis)
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration with custom fonts
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

## Contributing

We welcome contributions! Fetchr is designed with extensibility in mind, making it easy to add support for new email providers.

### Adding New Email Providers

Fetchr uses a **configuration-driven architecture** that makes adding new email providers simple - usually just a 3-line addition to `lib/providers.ts`!

**Quick Start:**
1. Add provider configuration to `lib/providers.ts`
2. Test thoroughly (connection, folders, downloads)
3. Submit a Pull Request

**Detailed Guide:**
See [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Complete step-by-step guide to adding providers
- Testing checklist
- Special cases (Gmail app passwords, ProtonMail Bridge, etc.)
- Code style guidelines
- Development workflow

### Architecture Highlights

- ✅ **Generic IMAP Client**: Works with any standard IMAP server
- ✅ **Configuration Over Code**: Add providers without changing core logic
- ✅ **Type-Safe**: TypeScript ensures consistency
- ✅ **Auto-Discovery**: UI automatically displays new providers

### Current Provider Status

| Provider | Status | Notes |
|----------|--------|-------|
| Dreamhost | ✅ Fully Tested | Default credentials |
| Gmail | ⚠️ Ready | Requires app password |
| Outlook/Office 365 | ⚠️ Ready | May require IMAP enabled |
| Yahoo | ⚠️ Ready | Requires app password |
| Others | 📝 Need Testing | IMAP configs added, awaiting tests |

Want to help test a provider? See [CONTRIBUTING.md](./CONTRIBUTING.md)!

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

## Acknowledgments

Thanks to all contributors who help make Fetchr better by adding support for more email providers!


