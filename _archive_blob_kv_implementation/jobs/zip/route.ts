import { NextRequest, NextResponse } from 'next/server';
import { getJob, getFileMetadata } from '@/lib/jobs';
import archiver from 'archiver';
import ExcelJS from 'exceljs';
import { Readable } from 'stream';

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, part, maxPerZip = 300 } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const job = await getJob(jobId);
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.status !== 'completed') {
      return NextResponse.json(
        { error: 'Job is not completed yet' },
        { status: 400 }
      );
    }

    console.log('[jobs/zip] Fetching file metadata...');
    const allFiles = await getFileMetadata(jobId);
    
    // Filter out entries without blob URLs (N/A files)
    const filesWithBlobs = allFiles.filter(f => f.blobUrl && f.fileType !== 'N/A');
    
    if (filesWithBlobs.length === 0) {
      return NextResponse.json(
        { error: 'No files to download' },
        { status: 404 }
      );
    }

    // Determine which files to include based on part
    let filesToInclude = filesWithBlobs;
    let partLabel = '';
    
    if (part !== undefined) {
      const startIndex = (part - 1) * maxPerZip;
      const endIndex = startIndex + maxPerZip;
      
      filesToInclude = filesWithBlobs.slice(startIndex, endIndex);
      
      if (filesToInclude.length === 0) {
        return NextResponse.json(
          { error: 'Part not found' },
          { status: 404 }
        );
      }
      
      partLabel = `-part-${part}`;
    }

    console.log(`[jobs/zip] Creating ZIP${partLabel} with ${filesToInclude.length} files`);

    // Create archiver
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    // Handle errors
    archive.on('error', (err) => {
      console.error('[jobs/zip] Archive error:', err);
      throw err;
    });

    // Stream files from Blob
    for (const file of filesToInclude) {
      try {
        console.log(`[jobs/zip] Fetching: ${file.filename}`);
        const response = await fetch(file.blobUrl);
        
        if (!response.ok) {
          console.error(`[jobs/zip] Failed to fetch ${file.filename}: ${response.statusText}`);
          continue;
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        archive.append(buffer, { name: file.filename });
      } catch (error) {
        console.error(`[jobs/zip] Error fetching ${file.filename}:`, error);
        // Continue with other files
      }
    }

    // Generate Excel summary (only for first part or single ZIP)
    if (!part || part === 1) {
      console.log('[jobs/zip] Generating Excel summary...');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Document Attachments');

      worksheet.columns = [
        { header: 'Sender Name', key: 'senderName', width: 30 },
        { header: 'Sender Email', key: 'senderEmail', width: 35 },
        { header: 'Subject', key: 'subject', width: 50 },
        { header: 'Date', key: 'date', width: 20 },
        { header: 'Filename', key: 'filename', width: 40 },
        { header: 'File Type', key: 'fileType', width: 12 },
        { header: 'Email Body', key: 'emailBody', width: 60 },
      ];

      // Add all files (including N/A) to Excel
      allFiles.forEach((item) => {
        worksheet.addRow({
          senderName: item.senderName,
          senderEmail: item.senderEmail,
          subject: item.subject,
          date: item.date,
          filename: item.filename,
          fileType: item.fileType,
          emailBody: item.emailBody,
        });
      });

      const excelBufferAny = await workbook.xlsx.writeBuffer();
      const excelNodeBuffer = (excelBufferAny instanceof ArrayBuffer)
        ? Buffer.from(new Uint8Array(excelBufferAny))
        : Buffer.from(excelBufferAny as any);
      const excelReadable = Readable.from(excelNodeBuffer);
      
      archive.append(excelReadable, { name: 'email_documents_summary.xlsx' });
    }

    // Finalize archive
    await archive.finalize();

    // Convert to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of archive) {
      chunks.push(Buffer.from(chunk));
    }
    const zipBuffer = Buffer.concat(chunks);

    // Sanitize folder name for filename
    const sanitizedFolder = job.folder.replace(/[<>:"/\\|?*]/g, '_');
    const filename = `${sanitizedFolder}${partLabel}.zip`;

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    });

  } catch (error: any) {
    console.error('[jobs/zip] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate ZIP' },
      { status: 500 }
    );
  }
}


