'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-2.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 w-10 h-10 opacity-50" />
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2.5 rounded-full bg-white/10 dark:bg-neutral-800/40 backdrop-blur-xl text-neutral-900 dark:text-white border border-black/5 dark:border-white/10 hover:bg-white/20 dark:hover:bg-neutral-700 transition-all flex items-center justify-center shadow-sm"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun size={20} className="text-yellow-500 fill-yellow-500/20" />
      ) : (
        <Moon size={20} className="text-indigo-400 fill-indigo-400/20" />
      )}
    </button>
  );
}