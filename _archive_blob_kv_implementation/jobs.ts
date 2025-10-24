import { kv } from '@vercel/kv';

export interface JobMetadata {
  senderName: string;
  senderEmail: string;
  subject: string;
  date: string;
  filename: string;
  blobUrl: string;
  fileType: 'PDF' | 'DOCX' | 'N/A';
  emailBody: string;
  uid: number;
}

export interface JobState {
  jobId: string;
  folder: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  totalEmails: number;
  chunkCount: number;
  chunkSize: number;
  processedChunks: number;
  totalPDFs: number;
  totalDOCX: number;
  createdAt: number;
  updatedAt: number;
  expiresAt: number; // TTL timestamp
}

export interface ChunkData {
  index: number;
  uids: number[];
}

export interface JobLog {
  timestamp: number;
  type: 'info' | 'error' | 'progress';
  message: string;
}

const JOB_TTL = 3600; // 1 hour in seconds

/**
 * Create a new job
 */
export async function createJob(
  jobId: string,
  folder: string,
  totalEmails: number,
  chunkCount: number,
  chunkSize: number
): Promise<JobState> {
  const now = Date.now();
  const job: JobState = {
    jobId,
    folder,
    status: 'pending',
    totalEmails,
    chunkCount,
    chunkSize,
    processedChunks: 0,
    totalPDFs: 0,
    totalDOCX: 0,
    createdAt: now,
    updatedAt: now,
    expiresAt: now + JOB_TTL * 1000,
  };
  
  await kv.set(`job:${jobId}`, job, { ex: JOB_TTL });
  return job;
}

/**
 * Get job state
 */
export async function getJob(jobId: string): Promise<JobState | null> {
  return await kv.get<JobState>(`job:${jobId}`);
}

/**
 * Update job state
 */
export async function updateJob(jobId: string, updates: Partial<JobState>): Promise<void> {
  const job = await getJob(jobId);
  if (!job) throw new Error(`Job ${jobId} not found`);
  
  const updatedJob = {
    ...job,
    ...updates,
    updatedAt: Date.now(),
  };
  
  await kv.set(`job:${jobId}`, updatedJob, { ex: JOB_TTL });
}

/**
 * Store chunk data
 */
export async function setChunk(jobId: string, index: number, uids: number[]): Promise<void> {
  const chunk: ChunkData = { index, uids };
  await kv.set(`job:${jobId}:chunk:${index}`, chunk, { ex: JOB_TTL });
}

/**
 * Get chunk data
 */
export async function getChunk(jobId: string, index: number): Promise<ChunkData | null> {
  return await kv.get<ChunkData>(`job:${jobId}:chunk:${index}`);
}

/**
 * Add metadata for processed file
 */
export async function addFileMetadata(jobId: string, metadata: JobMetadata): Promise<void> {
  const key = `job:${jobId}:files`;
  await kv.lpush(key, metadata);
  await kv.expire(key, JOB_TTL);
}

/**
 * Get all file metadata for job
 */
export async function getFileMetadata(jobId: string): Promise<JobMetadata[]> {
  const key = `job:${jobId}:files`;
  const files = await kv.lrange<JobMetadata>(key, 0, -1);
  return files || [];
}

/**
 * Add log entry
 */
export async function addLog(jobId: string, type: JobLog['type'], message: string): Promise<void> {
  const log: JobLog = {
    timestamp: Date.now(),
    type,
    message,
  };
  const key = `job:${jobId}:logs`;
  await kv.lpush(key, log);
  await kv.expire(key, JOB_TTL);
}

/**
 * Get logs
 */
export async function getLogs(jobId: string, limit = 100): Promise<JobLog[]> {
  const key = `job:${jobId}:logs`;
  const logs = await kv.lrange<JobLog>(key, 0, limit - 1);
  return logs || [];
}

/**
 * Cancel job
 */
export async function cancelJob(jobId: string): Promise<void> {
  await updateJob(jobId, { status: 'cancelled' });
  await addLog(jobId, 'info', 'Job cancelled by user');
}

/**
 * Increment PDF count
 */
export async function incrementPDFCount(jobId: string): Promise<void> {
  const job = await getJob(jobId);
  if (job) {
    await updateJob(jobId, { totalPDFs: job.totalPDFs + 1 });
  }
}

/**
 * Increment DOCX count
 */
export async function incrementDOCXCount(jobId: string): Promise<void> {
  const job = await getJob(jobId);
  if (job) {
    await updateJob(jobId, { totalDOCX: job.totalDOCX + 1 });
  }
}

/**
 * Mark chunk as processed
 */
export async function markChunkProcessed(jobId: string): Promise<void> {
  const job = await getJob(jobId);
  if (job) {
    const processedChunks = job.processedChunks + 1;
    const status = processedChunks >= job.chunkCount ? 'completed' : 'processing';
    await updateJob(jobId, { processedChunks, status });
  }
}


