import { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import { createImapClient } from '@/lib/imap';
import { SessionData } from '@/types';
import path from 'path';
import { tmpdir } from 'os';
import { promises as fs } from 'fs';
import ExcelJS from 'exceljs';
import archiver from 'archiver';
import { Readable } from 'stream';

export const maxDuration = 300; // 5 minutes

interface ProgressUpdate {
  type: 'email' | 'pdf' | 'docx' | 'excel' | 'zip' | 'complete' | 'error';
  message: string;
  current?: number;
  total?: number;
  filename?: string;
  totalEmails?: number;
  totalPDFs?: number;
  totalDOCX?: number;
  sessionId?: string;
  folderName?: string;
  zipData?: string; // Base64 encoded ZIP file data for Vercel compatibility
}

// Store temporary data
const tempStorage = new Map<string, { zipPath: string; outputDir: string; folderName: string }>();

// Sanitize folder name for use in filename
function sanitizeFolderName(folderName: string): string {
  return folderName
    .replace(/[<>:"/\\|?*\s.]/g, '_')  // Replace special chars and spaces with underscore
    .replace(/_+/g, '_')  // Replace multiple underscores with single
    .replace(/^_|_$/g, '');  // Remove leading/trailing underscores
}

function sendSSE(controller: ReadableStreamDefaultController, data: ProgressUpdate) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(new TextEncoder().encode(message));
}

export async function POST(request: NextRequest) {
  // Clone the request to prevent body consumption issues
  const requestClone = request.clone();
  
  // Parse request body BEFORE creating the stream
  let body;
  let folder;
  
  try {
    const text = await requestClone.text();
    if (!text || text.trim() === '') {
      console.error('Empty request body received');
      return new Response(
        JSON.stringify({ error: 'Empty request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    body = JSON.parse(text);
    folder = body.folder;
  } catch (parseError) {
    console.error('Failed to parse request body:', parseError);
    return new Response(
      JSON.stringify({ error: 'Invalid request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!folder) {
    return new Response(
      JSON.stringify({ error: 'Folder name is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      let outputDir: string | null = null;
      let sessionId: string | null = null;
      let sessionFolderName: string | null = null;
      
      try {

        // Get credentials from session
        const session = await getIronSession<SessionData>(cookies(), sessionOptions);

        if (!session.email || !session.password || !session.imapServer || !session.imapPort) {
          sendSSE(controller, { type: 'error', message: 'Session expired. Please login again.' });
          controller.close();
          return;
        }

        // Create unique output directory
        sessionId = `session-${Date.now()}`;
        sessionFolderName = `email-pdfs-${sessionId}`;
        outputDir = path.join(tmpdir(), sessionFolderName);
        await fs.mkdir(outputDir, { recursive: true });

        sendSSE(controller, { type: 'email', message: `Connecting to ${session.imapServer}...` });

        // Create IMAP client
        const imapClient = createImapClient({
          user: session.email,
          password: session.password,
          host: session.imapServer,
          port: session.imapPort,
          tls: true,
        });

        // Connect and fetch emails with detailed error handling
        try {
          await imapClient.connect();
          sendSSE(controller, { type: 'email', message: `Connected! Opening folder "${folder}"...` });
        } catch (connectError: any) {
          const errorMsg = connectError.message || 'Failed to connect to email server';
          sendSSE(controller, { 
            type: 'error', 
            message: `Connection failed: ${errorMsg}. Please check your credentials and try again.` 
          });
          controller.close();
          return;
        }

        try {
          await imapClient.openBox(folder);
        } catch (boxError: any) {
          imapClient.disconnect();
          sendSSE(controller, { 
            type: 'error', 
            message: `Failed to open folder "${folder}". Please check the folder name and try again.` 
          });
          controller.close();
          return;
        }

        const messageIds = await imapClient.searchAll();
        
        sendSSE(controller, { 
          type: 'email', 
          message: `Found ${messageIds.length} emails in folder`,
          total: messageIds.length,
          current: 0
        });

        if (messageIds.length === 0) {
          sendSSE(controller, { 
            type: 'complete', 
            message: 'No emails found',
            totalEmails: 0,
            totalPDFs: 0
          });
          controller.close();
          return;
        }

        // Fast check for attachments to skip emails without them
        sendSSE(controller, { 
          type: 'email', 
          message: 'Scanning for emails with attachments...',
        });

        const attachmentMap = await imapClient.checkForAttachments(messageIds);
        const emailsWithAttachments = messageIds.filter(id => attachmentMap.get(id));

        sendSSE(controller, { 
          type: 'email', 
          message: `Found ${emailsWithAttachments.length} emails with attachments out of ${messageIds.length} total`,
        });

        // Process emails in parallel batches for much faster performance
        const metadata: Array<{
          senderName: string;
          senderEmail: string;
          subject: string;
          date: string;
          filename: string;
          filePath: string;
          fileType: string;
        }> = [];

        let pdfCount = 0;
        let docxCount = 0;
        const BATCH_SIZE = 10; // Process 10 emails concurrently

        // Process in batches for optimal performance
        for (let batchStart = 0; batchStart < emailsWithAttachments.length; batchStart += BATCH_SIZE) {
          const batchEnd = Math.min(batchStart + BATCH_SIZE, emailsWithAttachments.length);
          const batch = emailsWithAttachments.slice(batchStart, batchEnd);
          
          sendSSE(controller, {
            type: 'email',
            message: `Processing batch ${Math.floor(batchStart / BATCH_SIZE) + 1}/${Math.ceil(emailsWithAttachments.length / BATCH_SIZE)} (${batchEnd}/${emailsWithAttachments.length} emails)...`,
            current: batchEnd,
            total: emailsWithAttachments.length
          });

          // Fetch all emails in batch in parallel
          const batchEmails = await Promise.all(
            batch.map(msgId => imapClient.fetchEmails([msgId]).catch(err => {
              console.error(`Error fetching email ${msgId}:`, err);
              return [];
            }))
          );

          // Process all emails in batch in parallel
          const batchResults = await Promise.all(
            batchEmails.map(async (emails, batchIndex) => {
              if (emails.length === 0) return { metadata: [], fileWrites: [] };

              const email = emails[0];
              const subject = email.subject || 'No Subject';
              const from = email.from?.text || 'Unknown';
              const senderEmail = from.match(/<(.+)>/)? from.match(/<(.+)>/)![1] : from;
              const senderName = from.includes('<') ? from.split('<')[0].trim().replace(/["']/g, '') : from;
              const date = email.date ? email.date.toISOString().replace('T', ' ').split('.')[0] : 'Unknown';

              const emailMetadata: typeof metadata = [];
              const fileWrites: Promise<void>[] = [];
              let fileFound = false;

              if (email.attachments && email.attachments.length > 0) {
                for (const attachment of email.attachments) {
                  const contentType = attachment.contentType.toLowerCase();
                  const fileName = attachment.filename?.toLowerCase() || '';
                  
                  // Check for PDF
                  if (contentType.includes('pdf') || fileName.endsWith('.pdf')) {
                    fileFound = true;

                    let filename = attachment.filename || `attachment_${Date.now()}_${batchStart + batchIndex}.pdf`;
                    filename = filename.replace(/[<>:"/\\|?*]/g, '_');
                    
                    if (!filename.toLowerCase().endsWith('.pdf')) {
                      filename += '.pdf';
                    }

                    // Write file concurrently (don't await yet)
                    const filepath = path.join(outputDir!, filename);
                    fileWrites.push(fs.writeFile(filepath, attachment.content));

                    emailMetadata.push({
                      senderName,
                      senderEmail,
                      subject,
                      date,
                      filename: filename,
                      filePath: `/${sessionFolderName!}/${filename}`,
                      fileType: 'PDF',
                    });
                  }
                  // Check for DOCX
                  else if (contentType.includes('wordprocessingml') || 
                           contentType.includes('msword') ||
                           fileName.endsWith('.docx') || 
                           fileName.endsWith('.doc')) {
                    fileFound = true;

                    let filename = attachment.filename || `attachment_${Date.now()}_${batchStart + batchIndex}.docx`;
                    filename = filename.replace(/[<>:"/\\|?*]/g, '_');
                    
                    if (!filename.toLowerCase().endsWith('.docx') && !filename.toLowerCase().endsWith('.doc')) {
                      filename += '.docx';
                    }

                    // Write file concurrently (don't await yet)
                    const filepath = path.join(outputDir!, filename);
                    fileWrites.push(fs.writeFile(filepath, attachment.content));

                    emailMetadata.push({
                      senderName,
                      senderEmail,
                      subject,
                      date,
                      filename: filename,
                      filePath: `/${sessionFolderName!}/${filename}`,
                      fileType: 'DOCX',
                    });
                  }
                }
              }

              if (!fileFound) {
                emailMetadata.push({
                  senderName,
                  senderEmail,
                  subject,
                  date,
                  filename: 'No document found',
                  filePath: 'N/A',
                  fileType: 'N/A',
                });
              }

              return { metadata: emailMetadata, fileWrites };
            })
          );

          // Wait for all file writes in batch to complete
          const allFileWrites = batchResults.flatMap(result => result.fileWrites);
          await Promise.all(allFileWrites);

          // Collect metadata and send SSE updates
          for (const result of batchResults) {
            for (const meta of result.metadata) {
              metadata.push(meta);
              
              if (meta.fileType === 'PDF') {
                pdfCount++;
                sendSSE(controller, {
                  type: 'pdf',
                  message: `Downloaded PDF: ${meta.filename}`,
                  filename: meta.filename,
                  current: batchEnd,
                  total: emailsWithAttachments.length
                });
              } else if (meta.fileType === 'DOCX') {
                docxCount++;
                sendSSE(controller, {
                  type: 'docx',
                  message: `Downloaded DOCX: ${meta.filename}`,
                  filename: meta.filename,
                  current: batchEnd,
                  total: emailsWithAttachments.length
                });
              }
            }
          }
        }

        imapClient.disconnect();

        // Generate Excel
        sendSSE(controller, { type: 'excel', message: 'Generating Excel summary...' });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Document Attachments');

        worksheet.columns = [
          { header: 'Sender Name', key: 'senderName', width: 30 },
          { header: 'Sender Email', key: 'senderEmail', width: 35 },
          { header: 'Subject', key: 'subject', width: 50 },
          { header: 'Date', key: 'date', width: 20 },
          { header: 'File Type', key: 'fileType', width: 12 },
          { header: 'Filename', key: 'filename', width: 40 },
          { header: 'File Path', key: 'filePath', width: 60 },
        ];

        metadata.forEach((item) => worksheet.addRow(item));

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD3D3D3' },
        };

        const excelPath = path.join(outputDir!, 'email_documents_summary.xlsx');
        await workbook.xlsx.writeFile(excelPath);

        sendSSE(controller, { type: 'excel', message: 'Excel summary created!' });

        // Create ZIP
        sendSSE(controller, { type: 'zip', message: 'Creating ZIP archive...' });

        const zipPath = path.join(tmpdir(), `email-pdfs-${sessionId}.zip`);
        const output = require('fs').createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        await new Promise<void>((resolve, reject) => {
          output.on('close', resolve);
          archive.on('error', reject);
          archive.pipe(output);
          archive.directory(outputDir!, false);
          archive.finalize();
        });

        sendSSE(controller, { type: 'zip', message: 'ZIP archive created!' });

        // Read ZIP file and encode as base64 for Vercel compatibility
        // This avoids filesystem isolation issues between serverless functions
        const sanitizedFolderName = sanitizeFolderName(folder);
        
        console.log('[process-stream] Reading ZIP file to send via SSE...');
        const zipBuffer = await fs.readFile(zipPath);
        const zipBase64 = zipBuffer.toString('base64');
        console.log('[process-stream] ZIP encoded, size:', zipBuffer.length, 'bytes');

        // Store for download with folder name (for localhost compatibility)
        tempStorage.set(sessionId!, { zipPath, outputDir: outputDir!, folderName: sanitizedFolderName });

        // Send ZIP data in the complete message to avoid cross-function file access
        sendSSE(controller, {
          type: 'complete',
          message: 'Processing complete!',
          totalEmails: messageIds.length,
          totalPDFs: pdfCount,
          totalDOCX: docxCount,
          sessionId: sessionId,
          folderName: sanitizedFolderName,
          zipData: zipBase64 // Send ZIP data directly to client
        });

        // Cleanup after 10 minutes
        setTimeout(async () => {
          const stored = tempStorage.get(sessionId!);
          if (stored) {
            try {
              await fs.rm(stored.outputDir, { recursive: true, force: true });
              await fs.unlink(stored.zipPath);
              tempStorage.delete(sessionId!);
            } catch (e) {
              console.error('Cleanup error:', e);
            }
          }
        }, 10 * 60 * 1000);

        controller.close();

      } catch (error: any) {
        console.error('Error processing emails:', error);
        
        sendSSE(controller, {
          type: 'error',
          message: error.message || 'Failed to process emails'
        });

        // Cleanup on error
        if (outputDir) {
          try {
            await fs.rm(outputDir, { recursive: true, force: true });
          } catch (e) {
            console.error('Cleanup error:', e);
          }
        }

        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}


