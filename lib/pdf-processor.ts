import { ParsedMail, Attachment } from 'mailparser';
import { promises as fs } from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';
import archiver from 'archiver';
import { EmailMetadata } from '@/types';
import { Readable } from 'stream';

export interface ProcessOptions {
  outputDir: string;
  onProgress?: (current: number, total: number, message: string) => void;
}

export class PDFProcessor {
  private outputDir: string;
  private onProgress?: (current: number, total: number, message: string) => void;

  constructor(options: ProcessOptions) {
    this.outputDir = options.outputDir;
    this.onProgress = options.onProgress;
  }

  private cleanFilename(filename: string): string {
    return filename.replace(/[<>:"/\\|?*]/g, '_');
  }

  private extractEmailAddress(from: string): string {
    const match = from.match(/<(.+)>/);
    return match ? match[1] : from;
  }

  private extractSenderName(from: string): string {
    if (from.includes('<')) {
      const name = from.split('<')[0].trim();
      return name.replace(/["']/g, '') || this.extractEmailAddress(from);
    }
    return from;
  }

  private formatDate(date: Date | undefined): string {
    if (!date) return 'Unknown';
    return date.toISOString().replace('T', ' ').split('.')[0];
  }

  private async ensureDir(dir: string): Promise<void> {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  private async saveAttachment(
    attachment: Attachment,
    subject: string
  ): Promise<string | null> {
    try {
      let filename = attachment.filename || `attachment_${Date.now()}.pdf`;
      filename = this.cleanFilename(filename);

      if (!filename.toLowerCase().endsWith('.pdf')) {
        filename += '.pdf';
      }

      // Generate unique filename
      let filepath = path.join(this.outputDir, filename);
      let counter = 1;
      const baseName = path.parse(filename).name;
      const ext = path.parse(filename).ext;

      while (true) {
        try {
          await fs.access(filepath);
          filepath = path.join(this.outputDir, `${baseName}_${counter}${ext}`);
          counter++;
        } catch {
          break;
        }
      }

      await fs.writeFile(filepath, attachment.content);
      return path.basename(filepath);
    } catch (error) {
      console.error('Error saving attachment:', error);
      return null;
    }
  }

  async processEmails(emails: ParsedMail[]): Promise<EmailMetadata[]> {
    await this.ensureDir(this.outputDir);

    const metadata: EmailMetadata[] = [];
    let processed = 0;

    for (const email of emails) {
      const subject = email.subject || 'No Subject';
      const from = email.from?.text || 'Unknown';
      const senderEmail = this.extractEmailAddress(from);
      const senderName = this.extractSenderName(from);
      const date = this.formatDate(email.date);

      let pdfFound = false;

      if (email.attachments && email.attachments.length > 0) {
        for (const attachment of email.attachments) {
          const contentType = attachment.contentType.toLowerCase();
          
          if (
            contentType.includes('pdf') ||
            (attachment.filename && attachment.filename.toLowerCase().endsWith('.pdf'))
          ) {
            pdfFound = true;
            const filename = await this.saveAttachment(attachment, subject);

            if (filename) {
              metadata.push({
                senderName,
                senderEmail,
                subject,
                date,
                pdfFilename: filename,
                pdfPath: path.join(this.outputDir, filename),
              });
            }
          }
        }
      }

      if (!pdfFound) {
        metadata.push({
          senderName,
          senderEmail,
          subject,
          date,
          pdfFilename: 'No PDF found',
          pdfPath: 'N/A',
        });
      }

      processed++;
      if (this.onProgress) {
        this.onProgress(processed, emails.length, `Processed ${processed}/${emails.length} emails`);
      }
    }

    return metadata;
  }

  async createExcelSummary(metadata: EmailMetadata[]): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('PDF Attachments');

    worksheet.columns = [
      { header: 'Sender Name', key: 'senderName', width: 30 },
      { header: 'Sender Email', key: 'senderEmail', width: 35 },
      { header: 'Subject', key: 'subject', width: 50 },
      { header: 'Date', key: 'date', width: 20 },
      { header: 'PDF Filename', key: 'pdfFilename', width: 40 },
      { header: 'PDF Path', key: 'pdfPath', width: 60 },
    ];

    metadata.forEach((item) => {
      worksheet.addRow(item);
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' },
    };

    const excelPath = path.join(this.outputDir, 'email_pdf_summary.xlsx');
    await workbook.xlsx.writeFile(excelPath);
    return excelPath;
  }

  async createZipArchive(): Promise<Readable> {
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    archive.directory(this.outputDir, false);
    archive.finalize();

    return archive;
  }

  async cleanup(): Promise<void> {
    try {
      const files = await fs.readdir(this.outputDir);
      for (const file of files) {
        await fs.unlink(path.join(this.outputDir, file));
      }
      await fs.rmdir(this.outputDir);
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}


