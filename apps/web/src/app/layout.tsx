import type { Metadata } from 'next';
//import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';

//const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PDF Dashboard - Invoice Management',
  description: 'AI-powered PDF invoice processing and management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className="font-sans antialiased" // Use system font instead
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
