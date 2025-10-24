import { NextRequest, NextResponse } from 'next/server';
import { getJob, getLogs } from '@/lib/jobs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('id');

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

    const logs = await getLogs(jobId, 50);

    return NextResponse.json({
      job,
      logs,
    });

  } catch (error: any) {
    console.error('[jobs/status] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get job status' },
      { status: 500 }
    );
  }
}


