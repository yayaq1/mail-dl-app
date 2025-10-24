import { NextRequest, NextResponse } from 'next/server';
import { cancelJob, getJob } from '@/lib/jobs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId } = body;

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

    await cancelJob(jobId);

    return NextResponse.json({
      success: true,
      message: 'Job cancelled',
    });

  } catch (error: any) {
    console.error('[jobs/cancel] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel job' },
      { status: 500 }
    );
  }
}


