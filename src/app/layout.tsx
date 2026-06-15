import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'CINENOVA',
  description: 'Premium Streaming Experience',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-neutral-950 text-white min-h-screen selection:bg-red-600 selection:text-white`}>
        <Navbar />
        <main className="min-h-screen bg-neutral-950">
          {children}
        </main>
      </body>
    </html>
  );
}