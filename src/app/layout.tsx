import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'CINENOVA',
  description: 'Premium Streaming Experience',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-neutral-950 text-neutral-950 dark:text-white min-h-screen selection:bg-red-600 selection:text-white transition-colors duration-500`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Navbar />
          <main className="min-h-screen pt-20">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
