import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mail DL App - Download Email Attachments',
  description: 'Access your email inbox and bulk download attachments',
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

