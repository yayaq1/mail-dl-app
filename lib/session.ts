import { SessionOptions } from 'iron-session';
import { SessionData } from '@/types';

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_security',
  cookieName: 'email_pdf_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 60, // 30 minutes
    sameSite: 'lax',
  },
};

declare module 'iron-session' {
  interface IronSessionData extends SessionData {}
}


