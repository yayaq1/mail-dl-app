import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fetchr - Email Attachment Downloader',
  description: 'Bulk download PDF and DOCX attachments from your email inbox - Perfect for recruiters managing CVs and applications. Secure, open-source, and effortless.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}


