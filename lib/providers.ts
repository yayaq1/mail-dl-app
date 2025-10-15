import { EmailProvider } from '@/types';

export const EMAIL_PROVIDERS: Record<string, EmailProvider> = {
  gmail: {
    name: 'Gmail',
    imap: 'imap.gmail.com',
    port: 993,
  },
  outlook: {
    name: 'Outlook / Office 365',
    imap: 'outlook.office365.com',
    port: 993,
  },
  yahoo: {
    name: 'Yahoo Mail',
    imap: 'imap.mail.yahoo.com',
    port: 993,
  },
  dreamhost: {
    name: 'Dreamhost',
    imap: 'imap.dreamhost.com',
    port: 993,
  },
  aol: {
    name: 'AOL Mail',
    imap: 'imap.aol.com',
    port: 993,
  },
  icloud: {
    name: 'iCloud Mail',
    imap: 'imap.mail.me.com',
    port: 993,
  },
  // Additional popular providers
  zoho: {
    name: 'Zoho Mail',
    imap: 'imap.zoho.com',
    port: 993,
  },
  fastmail: {
    name: 'FastMail',
    imap: 'imap.fastmail.com',
    port: 993,
  },
  mailcom: {
    name: 'Mail.com',
    imap: 'imap.mail.com',
    port: 993,
  },
  gmx: {
    name: 'GMX Mail',
    imap: 'imap.gmx.com',
    port: 993,
  },
  webde: {
    name: 'Web.de',
    imap: 'imap.web.de',
    port: 993,
  },
  // US ISP providers
  att: {
    name: 'AT&T Mail',
    imap: 'imap.mail.att.net',
    port: 993,
  },
  verizon: {
    name: 'Verizon Mail',
    imap: 'imap.verizon.net',
    port: 993,
  },
  // Hosting providers
  godaddy: {
    name: 'GoDaddy Email',
    imap: 'imap.secureserver.net',
    port: 993,
  },
  namecheap: {
    name: 'Namecheap Private Email',
    imap: 'mail.privateemail.com',
    port: 993,
  },
  // Business email services
  amazon: {
    name: 'Amazon WorkMail',
    imap: 'imap.mail.us-west-2.awsapps.com',
    port: 993,
  },
  // Alternative providers
  protonmail: {
    name: 'ProtonMail (Bridge Required)',
    imap: '127.0.0.1',
    port: 1143,
  },
  tutanota: {
    name: 'Tutanota (Bridge Required)',
    imap: '127.0.0.1',
    port: 1143,
  },
  custom: {
    name: 'Custom IMAP Server',
    imap: '',
    port: 993,
  },
};

export const getProviderConfig = (providerId: string): EmailProvider | null => {
  return EMAIL_PROVIDERS[providerId] || null;
};

export const getProviderList = (): Array<{ id: string; provider: EmailProvider }> => {
  return Object.entries(EMAIL_PROVIDERS).map(([id, provider]) => ({
    id,
    provider,
  }));
};


