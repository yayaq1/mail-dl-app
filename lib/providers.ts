import { EmailProvider } from '@/types';

export const EMAIL_PROVIDERS: Record<string, EmailProvider> = {
  dreamhost: {
    name: 'Dreamhost Webmail',
    imap: 'imap.dreamhost.com',
    port: 993,
    available: true,
  },
  gmail: {
    name: 'Gmail (Coming Soon)',
    imap: 'imap.gmail.com',
    port: 993,
    available: false,
  },
  outlook: {
    name: 'Outlook / Office 365 (Coming Soon)',
    imap: 'outlook.office365.com',
    port: 993,
    available: false,
  },
  yahoo: {
    name: 'Yahoo Mail (Coming Soon)',
    imap: 'imap.mail.yahoo.com',
    port: 993,
    available: false,
  },
  aol: {
    name: 'AOL Mail (Coming Soon)',
    imap: 'imap.aol.com',
    port: 993,
    available: false,
  },
  icloud: {
    name: 'iCloud Mail (Coming Soon)',
    imap: 'imap.mail.me.com',
    port: 993,
    available: false,
  },
  // Additional popular providers
  zoho: {
    name: 'Zoho Mail (Coming Soon)',
    imap: 'imap.zoho.com',
    port: 993,
    available: false,
  },
  fastmail: {
    name: 'FastMail (Coming Soon)',
    imap: 'imap.fastmail.com',
    port: 993,
    available: false,
  },
  mailcom: {
    name: 'Mail.com (Coming Soon)',
    imap: 'imap.mail.com',
    port: 993,
    available: false,
  },
  gmx: {
    name: 'GMX Mail (Coming Soon)',
    imap: 'imap.gmx.com',
    port: 993,
    available: false,
  },
  webde: {
    name: 'Web.de (Coming Soon)',
    imap: 'imap.web.de',
    port: 993,
    available: false,
  },
  // US ISP providers
  att: {
    name: 'AT&T Mail (Coming Soon)',
    imap: 'imap.mail.att.net',
    port: 993,
    available: false,
  },
  verizon: {
    name: 'Verizon Mail (Coming Soon)',
    imap: 'imap.verizon.net',
    port: 993,
    available: false,
  },
  // Hosting providers
  godaddy: {
    name: 'GoDaddy Email (Coming Soon)',
    imap: 'imap.secureserver.net',
    port: 993,
    available: false,
  },
  namecheap: {
    name: 'Namecheap Private Email (Coming Soon)',
    imap: 'mail.privateemail.com',
    port: 993,
    available: false,
  },
  // Business email services
  amazon: {
    name: 'Amazon WorkMail (Coming Soon)',
    imap: 'imap.mail.us-west-2.awsapps.com',
    port: 993,
    available: false,
  },
  // Alternative providers
  protonmail: {
    name: 'ProtonMail (Coming Soon)',
    imap: '127.0.0.1',
    port: 1143,
    available: false,
  },
  tutanota: {
    name: 'Tutanota (Coming Soon)',
    imap: '127.0.0.1',
    port: 1143,
    available: false,
  },
  custom: {
    name: 'Custom IMAP Server (Coming Soon)',
    imap: '',
    port: 993,
    available: false,
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


