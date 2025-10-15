import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import { createImapClient } from '@/lib/imap';
import { SessionData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, imapServer, imapPort } = body;

    if (!email || !password || !imapServer || !imapPort) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create IMAP client
    const imapClient = createImapClient({
      user: email,
      password: password,
      host: imapServer,
      port: parseInt(imapPort),
      tls: true,
    });

    // Test connection and get folders
    await imapClient.connect();
    const folders = await imapClient.listFolders();
    imapClient.disconnect();

    // Store credentials in session
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    session.email = email;
    session.password = password;
    session.imapServer = imapServer;
    session.imapPort = parseInt(imapPort);
    await session.save();

    return NextResponse.json({
      success: true,
      folders: folders.map((f) => f.name),
    });
  } catch (error: any) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to connect to email server',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}


