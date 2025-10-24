import { put } from '@vercel/blob';
import crypto from 'crypto';

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 200); // Limit length
}

/**
 * Generate a short hash for uniqueness
 */
export function generateHash(input: string): string {
  return crypto.createHash('md5').update(input).digest('hex').substring(0, 8);
}

/**
 * Build Blob storage path for attachment
 */
export function buildBlobPath(jobId: string, uid: number, filename: string): string {
  const sanitized = sanitizeFilename(filename);
  const hash = generateHash(`${uid}-${filename}-${Date.now()}`);
  const ext = sanitized.split('.').pop() || 'bin';
  const name = sanitized.substring(0, sanitized.length - ext.length - 1) || 'file';
  return `jobs/${jobId}/${uid}-${name}-${hash}.${ext}`;
}

/**
 * Upload attachment to Vercel Blob
 */
export async function uploadAttachment(
  jobId: string,
  uid: number,
  filename: string,
  content: Buffer
): Promise<string> {
  const path = buildBlobPath(jobId, uid, filename);
  
  const blob = await put(path, content, {
    access: 'public',
    addRandomSuffix: false,
  });
  
  return blob.url;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Check if file is a document type we process
 */
export function isDocumentFile(filename: string, contentType: string): {
  isPDF: boolean;
  isDOCX: boolean;
  fileType: 'PDF' | 'DOCX' | null;
} {
  const lowerFilename = filename.toLowerCase();
  const lowerContentType = contentType.toLowerCase();
  
  const isPDF = lowerContentType.includes('pdf') || lowerFilename.endsWith('.pdf');
  const isDOCX = 
    lowerContentType.includes('wordprocessingml') || 
    lowerContentType.includes('msword') ||
    lowerFilename.endsWith('.docx') || 
    lowerFilename.endsWith('.doc');
  
  let fileType: 'PDF' | 'DOCX' | null = null;
  if (isPDF) fileType = 'PDF';
  else if (isDOCX) fileType = 'DOCX';
  
  return { isPDF, isDOCX, fileType };
}


