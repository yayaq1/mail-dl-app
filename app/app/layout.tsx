import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fetchr - Email Attachment Downloader',
  description: 'Bulk download PDF and DOCX attachments from your email inbox. Secure, open-source, and effortless.',
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

