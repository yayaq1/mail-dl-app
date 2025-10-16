export interface EmailProvider {
  name: string;
  imap: string;
  port: number;
  available?: boolean;
}

export interface SessionData {
  email?: string;
  password?: string;
  imapServer?: string;
  imapPort?: number;
  selectedFolder?: string;
}

export interface FolderInfo {
  name: string;
  displayName: string;
}

export interface EmailMetadata {
  senderName: string;
  senderEmail: string;
  subject: string;
  date: string;
  pdfFilename: string;
  pdfPath: string;
}

export interface ProcessResult {
  success: boolean;
  totalEmails: number;
  totalPDFs: number;
  error?: string;
}


