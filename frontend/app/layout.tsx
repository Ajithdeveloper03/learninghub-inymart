import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { AppShell } from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Inymart Digital Marketing Academy | The Branding Fox (ISO 9001:2015 Certified)',
  description:
    'Premier professional Digital Marketing Academy with structured practical curriculum, anti-skip video lessons, real-client campaigns, and instructor-approved certifications.',
  icons: {
    icon: '/inymart-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased selection:bg-orange-500 selection:text-white">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
