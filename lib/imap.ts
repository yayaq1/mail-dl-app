import Imap from 'imap';
import { simpleParser, ParsedMail } from 'mailparser';
import { FolderInfo } from '@/types';

export interface ImapConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
  tlsOptions?: { rejectUnauthorized: boolean };
}

export class ImapClient {
  private imap: Imap;
  private config: ImapConfig;

  constructor(config: ImapConfig) {
    this.config = config;
    this.imap = new Imap({
      ...config,
      tlsOptions: { rejectUnauthorized: false },
      authTimeout: 30000, // 30 seconds for authentication
      connTimeout: 30000, // 30 seconds for connection
      keepalive: {
        interval: 10000,
        idleInterval: 300000,
        forceNoop: true,
      },
    });
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.imap.end();
        reject(new Error('Connection timeout - please check your credentials and try again'));
      }, 35000); // 35 seconds total timeout

      this.imap.once('ready', () => {
        clearTimeout(timeout);
        resolve();
      });
      
      this.imap.once('error', (err: Error) => {
        clearTimeout(timeout);
        reject(err);
      });
      
      try {
        this.imap.connect();
      } catch (err) {
        clearTimeout(timeout);
        reject(err);
      }
    });
  }

  disconnect(): void {
    this.imap.end();
  }

  listFolders(): Promise<FolderInfo[]> {
    return new Promise((resolve, reject) => {
      this.imap.getBoxes((err, boxes) => {
        if (err) {
          reject(err);
          return;
        }

        const folders: FolderInfo[] = [];
        const extractFolders = (boxObj: any, prefix = '') => {
          for (const [name, box] of Object.entries(boxObj)) {
            const fullPath = prefix ? `${prefix}.${name}` : name;
            folders.push({
              name: fullPath,
              displayName: fullPath,
            });
            if (box && typeof box === 'object' && box.children) {
              extractFolders(box.children, fullPath);
            }
          }
        };

        extractFolders(boxes);
        resolve(folders);
      });
    });
  }

  openBox(folderName: string): Promise<Imap.Box> {
    return new Promise((resolve, reject) => {
      this.imap.openBox(folderName, false, (err, box) => {
        if (err) reject(err);
        else resolve(box);
      });
    });
  }

  searchAll(): Promise<number[]> {
    return new Promise((resolve, reject) => {
      this.imap.search(['ALL'], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  // Fast check if emails have attachments without full parsing
  // Process in large batches for optimal performance
  async checkForAttachments(messageIds: number[]): Promise<Map<number, boolean>> {
    if (messageIds.length === 0) {
      return new Map();
    }

    const hasAttachments = new Map<number, boolean>();
    const SCAN_BATCH_SIZE = 100; // Process 100 emails at a time for fast scanning
    
    for (let i = 0; i < messageIds.length; i += SCAN_BATCH_SIZE) {
      const batch = messageIds.slice(i, i + SCAN_BATCH_SIZE);
      
      const batchResults = await new Promise<Map<number, boolean>>((resolve, reject) => {
        const batchMap = new Map<number, boolean>();
        
        const fetch = this.imap.fetch(batch, {
          bodies: 'HEADER.FIELDS (CONTENT-TYPE)',
          struct: true,
        });

        fetch.on('message', (msg, seqno) => {
          msg.once('attributes', (attrs: any) => {
            const structure = attrs.struct;
            // Check if structure has any application/* or attachment parts
            const checkStruct = (part: any): boolean => {
              if (Array.isArray(part)) {
                return part.some(checkStruct);
              }
              if (part.type === 'application' || part.disposition?.type === 'attachment') {
                return true;
              }
              if (part.parts) {
                return checkStruct(part.parts);
              }
              return false;
            };
            
            batchMap.set(seqno, checkStruct(structure));
          });
        });

        fetch.once('error', (err) => {
          reject(err);
        });

        fetch.once('end', () => {
          resolve(batchMap);
        });
      });

      // Merge batch results into main map
      batchResults.forEach((value, key) => {
        hasAttachments.set(key, value);
      });
    }

    return hasAttachments;
  }

  fetchEmails(messageIds: number[]): Promise<ParsedMail[]> {
    return new Promise((resolve, reject) => {
      if (messageIds.length === 0) {
        resolve([]);
        return;
      }

      const emails: ParsedMail[] = [];
      let pendingMessages = 0;
      let fetchEnded = false;
      
      const fetch = this.imap.fetch(messageIds, {
        bodies: '',
        struct: true,
      });

      const checkComplete = () => {
        // Only resolve when fetch has ended AND all messages are parsed
        if (fetchEnded && pendingMessages === 0) {
          resolve(emails);
        }
      };

      fetch.on('message', (msg) => {
        pendingMessages++;
        
        msg.on('body', (stream) => {
          simpleParser(stream, (err, parsed) => {
            if (err) {
              console.error('Error parsing email:', err);
            } else {
              emails.push(parsed);
            }
            pendingMessages--;
            checkComplete();
          });
        });
      });

      fetch.once('error', (err) => {
        reject(err);
      });

      fetch.once('end', () => {
        fetchEnded = true;
        checkComplete();
      });
    });
  }

  async fetchEmailsWithPDFs(
    folderName: string,
    onProgress?: (current: number, total: number) => void
  ): Promise<ParsedMail[]> {
    await this.openBox(folderName);
    const messageIds = await this.searchAll();

    if (messageIds.length === 0) {
      return [];
    }

    const emails: ParsedMail[] = [];
    const batchSize = 100; // Increased batch size for better performance

    for (let i = 0; i < messageIds.length; i += batchSize) {
      const batch = messageIds.slice(i, i + batchSize);
      const batchEmails = await this.fetchEmails(batch);
      emails.push(...batchEmails);
      
      if (onProgress) {
        onProgress(Math.min(i + batchSize, messageIds.length), messageIds.length);
      }
    }

    return emails;
  }
}

export const createImapClient = (config: ImapConfig): ImapClient => {
  return new ImapClient(config);
};

