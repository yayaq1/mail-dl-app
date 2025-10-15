import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import { createImapClient } from '@/lib/imap';
import { PDFProcessor } from '@/lib/pdf-processor';
import { SessionData } from '@/types';
import path from 'path';
import { tmpdir } from 'os';

export const maxDuration = 300; // 5 minutes for Vercel Pro (60s for Hobby)

export async function POST(request: NextRequest) {
  let outputDir: string | null = null;
  
  try {
    const body = await request.json();
    const { folder } = body;

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

    // Create unique output directory
    outputDir = path.join(tmpdir(), `email-pdfs-${Date.now()}`);

    // Create IMAP client
    const imapClient = createImapClient({
      user: session.email,
      password: session.password,
      host: session.imapServer,
      port: session.imapPort,
      tls: true,
    });

    // Connect and fetch emails
    await imapClient.connect();
    const emails = await imapClient.fetchEmailsWithPDFs(folder);
    imapClient.disconnect();

    if (emails.length === 0) {
      return NextResponse.json({
        success: true,
        totalEmails: 0,
        totalPDFs: 0,
        message: 'No emails found in the selected folder',
      });
    }

    // Process emails and extract PDFs
    const processor = new PDFProcessor({
      outputDir,
    });

    const metadata = await processor.processEmails(emails);
    await processor.createExcelSummary(metadata);

    // Create ZIP archive
    const zipStream = await processor.createZipArchive();

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of zipStream) {
      chunks.push(Buffer.from(chunk));
    }
    const zipBuffer = Buffer.concat(chunks);

    // Cleanup
    await processor.cleanup();

    // Count PDFs
    const totalPDFs = metadata.filter((m) => m.pdfFilename !== 'No PDF found').length;

    // Return ZIP file
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="email-pdfs-${Date.now()}.zip"`,
        'X-Total-Emails': emails.length.toString(),
        'X-Total-PDFs': totalPDFs.toString(),
      },
    });
  } catch (error: any) {
    console.error('Error processing emails:', error);
    
    // Cleanup on error
    if (outputDir) {
      try {
        const processor = new PDFProcessor({ outputDir });
        await processor.cleanup();
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }

    return NextResponse.json(
      {
        error: error.message || 'Failed to process emails',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}


