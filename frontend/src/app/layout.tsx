import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import ClientAuthGuard from '@/components/layout/ClientAuthGuard';
import { LoadingBar } from '@/components/ui/LoadingBar';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'AMOHA Mobiles – Premium Smartphones Store',
    template: '%s | AMOHA Mobiles',
  },
  description:
    'Discover the latest smartphones at unbeatable prices. Shop flagship & budget mobiles from Samsung, Apple, OnePlus, Xiaomi & more with fast delivery.',
  keywords: [
    'buy mobiles online',
    'smartphones',
    'AMOHA Mobiles',
    'mobile phones',
    'best price phones',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'AMOHA Mobiles',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)] antialiased">
        <ThemeProvider>
          <LoadingBar />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              className: '!bg-white !text-gray-900 !border-gray-200 dark:!bg-[#1a1a2e] dark:!text-[#e2e8f0] dark:!border-gray-200 dark:border-white/10',
            }}
          />
          <ClientAuthGuard>
            {children}
          </ClientAuthGuard>
        </ThemeProvider>
      </body>
    </html>
  );
}
