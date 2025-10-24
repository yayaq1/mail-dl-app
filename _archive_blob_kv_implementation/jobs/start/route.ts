import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { createImapClient } from '@/lib/imap';
import { createJob, setChunk, addLog } from '@/lib/jobs';
import crypto from 'crypto';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { folder, chunkSize = 150 } = body;

    if (!folder) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      );
    }

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

    console.log('[jobs/start] Connecting to IMAP...');
    await imapClient.connect();
    
    console.log('[jobs/start] Opening folder:', folder);
    await imapClient.openBox(folder);

    // Search for all messages with attachments
    console.log('[jobs/start] Searching for emails with attachments...');
    const allMessageIds = await imapClient.searchAll();
    
    if (allMessageIds.length === 0) {
      imapClient.disconnect();
      return NextResponse.json({
        success: true,
        totalEmails: 0,
        chunkCount: 0,
        message: 'No emails found in folder',
      });
    }

    console.log(`[jobs/start] Found ${allMessageIds.length} total emails, checking for attachments...`);
    
    // Check which messages have PDF/DOCX attachments
    const emailsWithAttachments = await imapClient.checkForAttachments(allMessageIds);
    
    imapClient.disconnect();

    if (emailsWithAttachments.length === 0) {
      return NextResponse.json({
        success: true,
        totalEmails: 0,
        chunkCount: 0,
        message: 'No emails with PDF/DOCX attachments found',
      });
    }

    console.log(`[jobs/start] ${emailsWithAttachments.length} emails have attachments`);

    // Generate job ID
    const jobId = crypto.randomBytes(16).toString('hex');

    // Split UIDs into chunks
    const chunks: number[][] = [];
    for (let i = 0; i < emailsWithAttachments.length; i += chunkSize) {
      chunks.push(emailsWithAttachments.slice(i, i + chunkSize));
    }

    console.log(`[jobs/start] Created ${chunks.length} chunks of ~${chunkSize} emails`);

    // Create job in KV
    const job = await createJob(
      jobId,
      folder,
      emailsWithAttachments.length,
      chunks.length,
      chunkSize
    );

    // Store chunks
    for (let i = 0; i < chunks.length; i++) {
      await setChunk(jobId, i, chunks[i]);
    }

    await addLog(jobId, 'info', `Job created: ${chunks.length} chunks, ${emailsWithAttachments.length} emails`);

    return NextResponse.json({
      success: true,
      jobId,
      totalEmails: emailsWithAttachments.length,
      chunkCount: chunks.length,
      chunkSize,
      folder,
    });

  } catch (error: any) {
    console.error('[jobs/start] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start job' },
      { status: 500 }
    );
  }
}


