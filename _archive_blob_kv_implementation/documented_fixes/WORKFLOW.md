# Email PDF Extractor - Workflow Diagram

## User Journey

```
┌─────────────────────────────────────────────────────────────┐
│                    User Opens Web App                        │
│              https://your-app.vercel.app                     │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    STEP 1: LOGIN                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Select Email Provider                              │     │
│  │  [Dropdown: Gmail, Outlook, Dreamhost, etc.]       │     │
│  └────────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Enter Email: user@example.com                     │     │
│  └────────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Enter Password: ••••••••••                        │     │
│  └────────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────────┐     │
│  │  [Connect & Fetch Folders Button]                  │     │
│  └────────────────────────────────────────────────────┘     │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ POST /api/folders
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Processing                        │
│  1. Connect to IMAP server                                   │
│  2. Authenticate user                                        │
│  3. Fetch list of all folders                                │
│  4. Store credentials in encrypted session                   │
│  5. Return folder list to frontend                           │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 STEP 2: SELECT FOLDER                        │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Search: [Type to filter folders...]              │     │
│  └────────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Available Folders:                                 │     │
│  │  ○ INBOX                                           │     │
│  │  ● INBOX.Campus Ambassadors   ← Selected          │     │
│  │  ○ Sent                                            │     │
│  │  ○ Drafts                                          │     │
│  │  ○ Spam                                            │     │
│  └────────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────────┐     │
│  │  [Back]  [Extract PDFs Button]                     │     │
│  └────────────────────────────────────────────────────┘     │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ POST /api/process
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend Processing (The Heavy Work)             │
│                                                               │
│  1. Read credentials from session                            │
│  2. Connect to IMAP server                                   │
│  3. Open selected folder                                     │
│  4. Fetch all emails (in batches of 50)                     │
│  5. Parse each email                                         │
│  6. Extract PDF attachments → Save to /tmp                   │
│  7. Collect metadata (sender, subject, date)                 │
│  8. Generate Excel summary with all metadata                 │
│  9. Create ZIP archive with PDFs + Excel                     │
│  10. Stream ZIP to client                                    │
│  11. Cleanup /tmp directory                                  │
│  12. Clear session                                           │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                STEP 3: DOWNLOAD RESULT                       │
│  ┌────────────────────────────────────────────────────┐     │
│  │  ✓ Processing Complete!                            │     │
│  └────────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────────┐     │
│  │  📧 Emails Processed:  47                          │     │
│  └────────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────────┐     │
│  │  📄 PDFs Found:  35                                │     │
│  └────────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────────┐     │
│  │  ZIP file automatically downloaded to browser       │     │
│  │  Contents: All PDFs + Excel summary                 │     │
│  └────────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────────┐     │
│  │  [Process Another Folder Button]                    │     │
│  └────────────────────────────────────────────────────┘     │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              User Downloads ZIP File                         │
│          email-pdfs-1697234567890.zip                        │
│  ├── email_pdf_summary.xlsx                                  │
│  ├── Application_Form_John_Doe.pdf                           │
│  ├── Resume_Jane_Smith.pdf                                   │
│  ├── Cover_Letter_Bob_Johnson.pdf                            │
│  └── ... (all other PDFs)                                    │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

```
┌──────────────┐
│   Browser    │
│  (Frontend)  │
└──────┬───────┘
       │
       │ 1. User submits login form
       │
       ▼
┌─────────────────────────────────────┐
│     Next.js API Route               │
│     /api/folders                    │
│                                     │
│  • Receives: email, password,       │
│    provider config                  │
│  • Validates input                  │
│  • Creates IMAP client              │
└──────┬──────────────────────────────┘
       │
       │ 2. Connect to IMAP
       │
       ▼
┌─────────────────────────────────────┐
│     IMAP Server                     │
│     (imap.example.com:993)          │
│                                     │
│  • Authenticates user               │
│  • Returns mailbox structure        │
└──────┬──────────────────────────────┘
       │
       │ 3. Folder list
       │
       ▼
┌─────────────────────────────────────┐
│     Session Management              │
│     (iron-session)                  │
│                                     │
│  • Encrypt credentials              │
│  • Store in secure cookie           │
│  • Set 30-minute expiration         │
└──────┬──────────────────────────────┘
       │
       │ 4. Encrypted session cookie
       │
       ▼
┌──────────────┐
│   Browser    │
│  (Shows      │
│   folders)   │
└──────┬───────┘
       │
       │ 5. User selects folder
       │
       ▼
┌─────────────────────────────────────┐
│     Next.js API Route               │
│     /api/process                    │
│                                     │
│  • Read session                     │
│  • Get credentials                  │
│  • Connect to IMAP                  │
└──────┬──────────────────────────────┘
       │
       │ 6. Fetch emails
       │
       ▼
┌─────────────────────────────────────┐
│     IMAP Server                     │
│                                     │
│  • Fetch all messages               │
│  • Return email data                │
└──────┬──────────────────────────────┘
       │
       │ 7. Email data
       │
       ▼
┌─────────────────────────────────────┐
│     PDF Processor                   │
│     (lib/pdf-processor.ts)          │
│                                     │
│  • Parse emails                     │
│  • Extract PDF attachments          │
│  • Save to /tmp                     │
│  • Generate Excel                   │
│  • Create ZIP                       │
└──────┬──────────────────────────────┘
       │
       │ 8. ZIP stream
       │
       ▼
┌──────────────┐
│   Browser    │
│  (Downloads  │
│    ZIP)      │
└──────────────┘
```

## Security Flow

```
┌─────────────────────────────────────────────────────────┐
│                    User Credentials                      │
│             email@example.com + password                 │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ HTTPS (TLS encrypted)
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Vercel Edge Network                     │
│                  (HTTPS enforced)                        │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 Next.js API Route                        │
│            (Server-side processing)                      │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   iron-session                           │
│                                                          │
│  1. Encrypt credentials with SESSION_SECRET              │
│  2. Create signed cookie                                 │
│  3. Set httpOnly (not accessible via JavaScript)         │
│  4. Set secure (HTTPS only)                              │
│  5. Set maxAge (30 minutes)                              │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ Encrypted cookie
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    User Browser                          │
│         (Cookie stored, encrypted data)                  │
│                                                          │
│  • Cannot read cookie content (httpOnly)                 │
│  • Cookie auto-expires after 30 minutes                  │
│  • Cookie only sent over HTTPS (secure)                  │
└─────────────────────────────────────────────────────────┘
```

## File Processing Flow

```
Email with PDF attachments
        │
        ▼
┌──────────────────┐
│ mailparser       │  Parse email structure
│                  │  Extract attachments
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Check content    │  Is it a PDF?
│ type             │  • application/pdf
│                  │  • filename ends with .pdf
└────────┬─────────┘
         │
         ▼ Yes
┌──────────────────┐
│ Save to /tmp/    │  Write PDF to filesystem
│                  │  Generate unique filename
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Collect metadata │  • Sender name
│                  │  • Sender email
│                  │  • Subject
│                  │  • Date
│                  │  • Filename
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ exceljs          │  Create Excel workbook
│                  │  Add metadata rows
│                  │  Style headers
│                  │  Auto-size columns
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ archiver         │  Create ZIP stream
│                  │  Add all PDFs
│                  │  Add Excel file
│                  │  Compress
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Stream to client │  Send ZIP to browser
│                  │  Trigger download
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Cleanup          │  Delete /tmp files
│                  │  Remove temp directory
│                  │  Clear session
└──────────────────┘
```

## Session Lifecycle

```
Login
  ↓
Create session
  ↓
Store encrypted in cookie
  ↓
┌─────────────────────┐
│  Session Active     │
│  (30 minutes max)   │
│                     │
│  Stores:            │
│  • email            │
│  • password         │
│  • imapServer       │
│  • imapPort         │
└─────────────────────┘
  ↓
  ├─→ User processes emails → Session continues
  ├─→ User clicks logout → Session destroyed
  ├─→ 30 minutes pass → Session expires
  └─→ User closes browser → Cookie persists until expiry
```

## Error Handling Flow

```
User Action
  ↓
Try {
  ├─→ Invalid credentials → "Failed to connect" error
  ├─→ Network timeout → "Connection timeout" error
  ├─→ Invalid folder → "Failed to select folder" error
  ├─→ No PDFs found → Success with 0 PDFs
  ├─→ Session expired → "Session expired" error
  ├─→ Large inbox timeout → Vercel function timeout
  └─→ Unknown error → Generic error message
}
  ↓
Display error to user
  ↓
User can retry or go back
```

## Deployment Flow

```
Local Development
  ↓
git push to GitHub
  ↓
Vercel detects push
  ↓
┌──────────────────────┐
│  Vercel Build        │
│                      │
│  1. npm install      │
│  2. next build       │
│  3. Optimize assets  │
│  4. Create serverless│
│     functions        │
└──────────────────────┘
  ↓
┌──────────────────────┐
│  Deploy to Edge      │
│  Network             │
│                      │
│  • Global CDN        │
│  • Auto-scaling      │
│  • HTTPS enabled     │
└──────────────────────┘
  ↓
Live at https://your-app.vercel.app
```


