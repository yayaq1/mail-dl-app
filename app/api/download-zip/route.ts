import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { tmpdir } from 'os';

// This would ideally use a more robust storage solution in production
const tempStorage = new Map<string, { zipPath: string; outputDir: string; folderName: string }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, folderName } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    console.log('[download-zip] Request received:', { sessionId, folderName });

    // Try to get data from tempStorage first (for localhost compatibility)
    const storedData = tempStorage.get(sessionId);
    const zipPath = storedData?.zipPath || path.join(tmpdir(), `email-pdfs-${sessionId}.zip`);
    // Use folderName from request body (passed from client), fallback to stored or default
    const finalFolderName = folderName || storedData?.folderName || 'email-documents';

    console.log('[download-zip] Looking for ZIP at:', zipPath);

    try {
      const zipBuffer = await fs.readFile(zipPath);

      console.log(`[download-zip] Sending ZIP file: ${finalFolderName}.zip (${zipBuffer.length} bytes)`);

      return new NextResponse(new Uint8Array(zipBuffer), {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${finalFolderName}.zip"`,
          'Content-Length': zipBuffer.length.toString(),
        },
      });
    } catch (error) {
      console.error('[download-zip] ZIP file not found at:', zipPath, error);
      return NextResponse.json(
        { error: 'ZIP file not found or expired' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('[download-zip] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to download ZIP' },
      { status: 500 }
    );
  }
}


