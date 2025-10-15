import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { tmpdir } from 'os';

// This would ideally use a more robust storage solution in production
const tempStorage = new Map<string, { zipPath: string; outputDir: string }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // For now, construct the path (in production, use the tempStorage from process-stream)
    const zipPath = path.join(tmpdir(), `email-pdfs-${sessionId}.zip`);

    try {
      const zipBuffer = await fs.readFile(zipPath);

      return new NextResponse(zipBuffer, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="email-pdfs-${Date.now()}.zip"`,
        },
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'ZIP file not found or expired' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('Error downloading ZIP:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to download ZIP' },
      { status: 500 }
    );
  }
}


