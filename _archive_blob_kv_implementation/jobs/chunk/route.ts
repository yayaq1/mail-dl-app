import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { createImapClient } from '@/lib/imap';
import { 
  getJob, 
  getChunk, 
  addFileMetadata, 
  addLog, 
  incrementPDFCount, 
  incrementDOCXCount,
  markChunkProcessed,
  JobMetadata
} from '@/lib/jobs';
import { uploadAttachment, isDocumentFile } from '@/lib/storage';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, index } = body;

    if (!jobId || index === undefined) {
      return NextResponse.json(
        { error: 'jobId and index are required' },
        { status: 400 }
      );
    }

    // Get job state
    const job = await getJob(jobId);
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Job was cancelled' },
        { status: 400 }
      );
    }

    // Get chunk data
    const chunk = await getChunk(jobId, index);
    if (!chunk) {
      return NextResponse.json(
        { error: 'Chunk not found' },
        { status: 404 }
      );
    }

    console.log(`[jobs/chunk] Processing chunk ${index} with ${chunk.uids.length} UIDs`);
    await addLog(jobId, 'progress', `Processing chunk ${index + 1}/${job.chunkCount}...`);

    // Get credentials from session
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);

    if (!session.email || !session.password || !session.imapServer || !session.imapPort) {
      return NextResponse.json(
        { error: 'Session expired. Please login again.' },
        { status: 401 }
      );
    }

    // Create IMAP client
    const imapClient = createImapClient({
      user: session.email,
      password: session.password,
      host: session.imapServer,
      port: session.imapPort,
      tls: true,
    });

    await imapClient.connect();
    await imapClient.openBox(job.folder);

    // Fetch emails by UIDs
    console.log(`[jobs/chunk] Fetching ${chunk.uids.length} emails...`);
    const emails = await imapClient.fetchEmails(chunk.uids);
    
    imapClient.disconnect();

    console.log(`[jobs/chunk] Processing ${emails.length} emails...`);

    let processedCount = 0;
    let pdfCount = 0;
    let docxCount = 0;

    // Process each email
    for (const email of emails) {
      const subject = email.subject || 'No Subject';
      const from = email.from?.text || 'Unknown';
      const senderEmail = from.match(/<(.+)>/)? from.match(/<(.+)>/)![1] : from;
      const senderName = from.includes('<') ? from.split('<')[0].trim().replace(/["']/g, '') : from;
      const date = email.date ? email.date.toISOString().replace('T', ' ').split('.')[0] : 'Unknown';
      const emailBody = email.text || '';
      const uid = email.uid || 0;

      let hasDocuments = false;

      if (email.attachments && email.attachments.length > 0) {
        for (const attachment of email.attachments) {
          const contentType = attachment.contentType.toLowerCase();
          const fileName = attachment.filename?.toLowerCase() || '';
          
          const { fileType } = isDocumentFile(fileName, contentType);
          
          if (fileType) {
            hasDocuments = true;
            
            let filename = attachment.filename || `attachment_${uid}_${Date.now()}.${fileType === 'PDF' ? 'pdf' : 'docx'}`;
            
            // Upload to Blob
            const blobUrl = await uploadAttachment(jobId, uid, filename, attachment.content);
            
            // Store metadata
            const metadata: JobMetadata = {
              senderName,
              senderEmail,
              subject,
              date,
              filename,
              blobUrl,
              fileType,
              emailBody,
              uid,
            };
            
            await addFileMetadata(jobId, metadata);
            
            if (fileType === 'PDF') {
              pdfCount++;
              await incrementPDFCount(jobId);
            } else if (fileType === 'DOCX') {
              docxCount++;
              await incrementDOCXCount(jobId);
            }
            
            console.log(`[jobs/chunk] Uploaded ${fileType}: ${filename}`);
          }
        }
      }

      if (!hasDocuments) {
        // Store metadata for emails without documents
        const metadata: JobMetadata = {
          senderName,
          senderEmail,
          subject,
          date,
          filename: 'No document found',
          blobUrl: '',
          fileType: 'N/A',
          emailBody,
          uid,
        };
        await addFileMetadata(jobId, metadata);
      }

      processedCount++;
    }

    // Mark chunk as processed
    await markChunkProcessed(jobId);
    await addLog(jobId, 'info', `Chunk ${index + 1} complete: ${pdfCount} PDFs, ${docxCount} DOCX`);

    console.log(`[jobs/chunk] Chunk ${index} complete: ${processedCount} emails, ${pdfCount} PDFs, ${docxCount} DOCX`);

    return NextResponse.json({
      success: true,
      processed: processedCount,
      pdfCount,
      docxCount,
    });

  } catch (error: any) {
    console.error('[jobs/chunk] Error:', error);
    
    // Try to log error to job
    try {
      const { jobId, index } = await request.json();
      if (jobId) {
        await addLog(jobId, 'error', `Chunk ${index} failed: ${error.message}`);
      }
    } catch (e) {
      // Ignore logging errors
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to process chunk' },
      { status: 500 }
    );
  }
}


