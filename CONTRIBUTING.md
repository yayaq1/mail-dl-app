# Contributing to Fetchr

Thank you for your interest in contributing to Fetchr! This guide will help you add support for new email providers and contribute to the project.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Adding a New Email Provider](#adding-a-new-email-provider)
- [Testing Your Provider](#testing-your-provider)
- [Special Cases](#special-cases)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)

---

## Architecture Overview

Fetchr is designed with **extensibility** as a core principle. The application uses a **configuration-driven architecture** that makes adding new email providers straightforward.

### Key Components

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface (React)                   │
│  EmailLoginForm → ProviderSelector → ProcessingProgress    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Provider Configuration                     │
│              lib/providers.ts (Simple Config)               │
│  { name, imap, port, available } ← ADD NEW PROVIDERS HERE   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Generic IMAP Client                      │
│              lib/imap.ts (Works with ANY IMAP)              │
│     Connect → List Folders → Fetch Emails → Extract PDFs   │
└─────────────────────────────────────────────────────────────┘
```

### Why This Architecture is Extensible

1. **No Provider-Specific Code**: The IMAP client (`lib/imap.ts`) implements the standard IMAP protocol and works with ANY email provider that supports IMAP
2. **Configuration Over Code**: New providers are added by configuration, not code changes
3. **Type-Safe**: TypeScript ensures all provider configs are valid
4. **Auto-Discovery**: The UI automatically discovers and displays all configured providers

---

## Adding a New Email Provider

Adding support for a new email provider is **incredibly simple** - just 3 steps!

### Step 1: Add Provider Configuration

Edit `lib/providers.ts` and add your provider to the `EMAIL_PROVIDERS` object:

```typescript
export const EMAIL_PROVIDERS: Record<string, EmailProvider> = {
  // ... existing providers ...
  
  yourprovider: {
    name: 'Your Provider Name',
    imap: 'imap.yourprovider.com',  // IMAP server address
    port: 993,                       // Usually 993 for SSL/TLS
    available: true,                 // Set to true when ready for users
  },
};
```

**Configuration Fields:**

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `name` | string | Display name shown in UI | Yes |
| `imap` | string | IMAP server hostname | Yes |
| `port` | number | IMAP port (usually 993) | Yes |
| `available` | boolean | Enable/disable in UI | Yes |

### Step 2: Test Your Provider

See [Testing Your Provider](#testing-your-provider) section below.

### Step 3: Submit a Pull Request

See [Development Workflow](#development-workflow) section below.

---

## Finding IMAP Configuration for Popular Providers

Here's how to find IMAP settings for common email providers:

### General Method
1. Search Google for: `[provider name] IMAP settings`
2. Look for official documentation
3. Common patterns:
   - IMAP server: `imap.provider.com` or `mail.provider.com`
   - Port: `993` (SSL/TLS) or `143` (STARTTLS)

### Quick Reference

| Provider Type | Typical IMAP Pattern | Port |
|--------------|----------------------|------|
| Google Workspace | `imap.gmail.com` | 993 |
| Microsoft 365 | `outlook.office365.com` | 993 |
| cPanel Hosting | `mail.yourdomain.com` | 993 |
| Plesk Hosting | `mail.yourdomain.com` | 993 |
| Yahoo | `imap.mail.yahoo.com` | 993 |

### Finding Custom Provider Settings

If you're adding a less common provider:

1. **Check their documentation**: Look for "email client settings" or "IMAP setup"
2. **Use their webmail**: Often has settings under "Help" or "Settings"
3. **Contact support**: They can provide IMAP server and port
4. **Use email client auto-discovery**: Thunderbird or Outlook can auto-detect settings

---

## Testing Your Provider

Before submitting a PR, thoroughly test your provider addition.

### Testing Checklist

- [ ] **Connection Test**
  - [ ] Successfully connects with correct credentials
  - [ ] Shows appropriate error with wrong password
  - [ ] Handles connection timeout gracefully

- [ ] **Folder Operations**
  - [ ] Lists all email folders correctly
  - [ ] Can open different folders (INBOX, Sent, etc.)
  - [ ] Handles empty folders without errors

- [ ] **Email Processing**
  - [ ] Successfully fetches emails from folder
  - [ ] Correctly identifies PDF attachments
  - [ ] Correctly identifies DOCX attachments
  - [ ] Handles emails without attachments
  - [ ] Processes multiple attachments per email

- [ ] **ZIP Download**
  - [ ] Successfully creates ZIP file
  - [ ] ZIP contains all expected PDFs/DOCX files
  - [ ] Excel summary is generated correctly
  - [ ] Filename uses sanitized folder name
  - [ ] Download works on both localhost and Vercel

- [ ] **Edge Cases**
  - [ ] Handles large attachments (>10MB)
  - [ ] Handles many emails (>100)
  - [ ] Works with non-ASCII characters in filenames
  - [ ] Handles special folder names

### Testing Procedure

1. **Local Testing**
   ```bash
   npm run dev
   ```
   - Navigate to http://localhost:3000/app
   - Select your new provider
   - Test with a real email account

2. **Vercel Preview Testing**
   - Push to a branch
   - Let Vercel create a preview deployment
   - Test on the preview URL

3. **Different Email Accounts**
   - Test with multiple accounts if possible
   - Different folder structures
   - Different attachment types

---

## Special Cases

### Providers Requiring App Passwords

Some providers require app-specific passwords instead of regular passwords:

**Gmail**
```typescript
gmail: {
  name: 'Gmail (Requires App Password)',
  imap: 'imap.gmail.com',
  port: 993,
  available: true,
},
```

**Documentation to include in PR:**
1. Enable 2FA on Google Account
2. Go to: Google Account → Security → App passwords
3. Generate password for "Mail"
4. Use generated password in Fetchr

**Yahoo Mail**
```typescript
yahoo: {
  name: 'Yahoo Mail (Requires App Password)',
  imap: 'imap.mail.yahoo.com',
  port: 993,
  available: true,
},
```

**Documentation to include in PR:**
1. Enable 2FA on Yahoo Account
2. Go to: Account Security → Generate app password
3. Use generated password in Fetchr

### Providers Requiring Bridge Software

Some privacy-focused providers require bridge software:

**ProtonMail**
```typescript
protonmail: {
  name: 'ProtonMail (Requires Bridge)',
  imap: '127.0.0.1',  // Localhost when Bridge is running
  port: 1143,         // Bridge default port
  available: true,
},
```

**Documentation to include in PR:**
1. Download and install ProtonMail Bridge
2. Configure Bridge with ProtonMail account
3. Use Bridge credentials in Fetchr
4. Note: Only works on local machine, not on Vercel

**Tutanota**

Currently does not support IMAP (even with bridge). Cannot be added until they provide IMAP support.

### Providers with OAuth 2.0

Providers using OAuth 2.0 (like Gmail with OAuth) require additional implementation:

**Current Status**: Not yet supported
**Future Implementation**: Would require:
- OAuth flow implementation
- Token storage and refresh
- Separate authentication route

Mark these as `available: false` with note:
```typescript
gmail_oauth: {
  name: 'Gmail (OAuth 2.0 - Coming Soon)',
  imap: 'imap.gmail.com',
  port: 993,
  available: false,  // Requires OAuth implementation
},
```

### Custom IMAP Servers

For users with custom domains or email hosting:

```typescript
custom: {
  name: 'Custom IMAP Server',
  imap: '',    // User provides
  port: 993,   // Default
  available: true,
},
```

**Note**: This requires UI changes to allow user input for IMAP server. Consider as a future enhancement.

---

## Development Workflow

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
git clone https://github.com/YOUR_USERNAME/mail-dl-app.git
cd mail-dl-app
```

### 2. Create a Branch

```bash
git checkout -b add-provider-[providername]
# Example: git checkout -b add-provider-fastmail
```

### 3. Make Your Changes

Edit `lib/providers.ts` to add your provider configuration.

### 4. Test Thoroughly

Follow the [Testing Checklist](#testing-checklist) above.

### 5. Document Your Provider

If the provider has special requirements:
- Add comments in the code
- Note in your PR description
- Consider adding to README.md troubleshooting section

### 6. Commit Your Changes

```bash
git add lib/providers.ts
git commit -m "feat: add support for [Provider Name]

- Add IMAP configuration for [Provider Name]
- Tested with [brief testing notes]
- [Any special notes about the provider]"
```

### 7. Push and Create Pull Request

```bash
git push origin add-provider-[providername]
```

Then create a Pull Request on GitHub with:

**PR Title**: `feat: add support for [Provider Name]`

**PR Description Template**:
```markdown
## Provider Added
[Provider Name]

## Configuration
- IMAP Server: `imap.example.com`
- Port: `993`
- Special Requirements: [App password / Bridge / None]

## Testing Completed
- [x] Connection test
- [x] Folder listing
- [x] Email fetching
- [x] PDF/DOCX download
- [x] ZIP creation
- [x] Tested on Vercel preview

## Additional Notes
[Any special considerations for users]
```

### 8. Address Review Comments

Maintainers may request changes or additional testing. Be responsive and collaborative!

---

## Code Style Guidelines

### TypeScript

- Use TypeScript types consistently
- Follow existing type definitions in `types/index.ts`
- No `any` types without good reason

### Provider Configuration

- **Alphabetical order** within categories (US providers, hosting providers, etc.)
- **Consistent naming**: Use lowercase keys, descriptive names
- **Comments**: Add helpful comments for unusual configurations

Example:
```typescript
// Hosting Providers
bluehost: {
  name: 'Bluehost Email',
  imap: 'mail.yourdomain.com',  // Use actual domain
  port: 993,
  available: true,
},

dreamhost: {
  name: 'Dreamhost Webmail',
  imap: 'imap.dreamhost.com',
  port: 993,
  available: true,
},
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New provider support
- `fix:` - Bug fixes for existing providers
- `docs:` - Documentation updates
- `test:` - Testing improvements
- `chore:` - Maintenance tasks

Examples:
- ✅ `feat: add support for Fastmail`
- ✅ `fix: update Gmail IMAP port`
- ✅ `docs: add Outlook app password instructions`
- ❌ `added new provider` (too vague)
- ❌ `Updated providers.ts` (not descriptive)

---

## Questions or Issues?

- **Questions about adding a provider?** Open a [Discussion](https://github.com/YOUR_USERNAME/mail-dl-app/discussions)
- **Found a bug?** Open an [Issue](https://github.com/YOUR_USERNAME/mail-dl-app/issues)
- **Need help testing?** Ask in your PR comments

---

## Recognition

All contributors will be:
- Listed in the README.md contributors section
- Credited in release notes for their provider additions
- Part of making email management easier for everyone!

Thank you for contributing to Fetchr! 🎉

