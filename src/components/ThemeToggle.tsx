'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { Sun, Moon } from 'lucide-react';

type ThemePreference = 'light' | 'dark';

const THEME_EVENT = 'cinenova-theme-change';

function getThemeSnapshot(): ThemePreference {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const saved = window.localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function subscribe(callback: () => void) {
  const handleStorage = () => callback();
  const handleThemeChange = () => callback();

  window.addEventListener('storage', handleStorage);
  window.addEventListener(THEME_EVENT, handleThemeChange);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(THEME_EVENT, handleThemeChange);
  };
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, () => 'dark');
  const darkMode = theme === 'dark';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const toggleTheme = () => {
    const nextTheme: ThemePreference = darkMode ? 'light' : 'dark';
    window.localStorage.setItem('theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return (
    <button
      onClick={toggleTheme}
      className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-neutral-100/40 dark:bg-neutral-800/40 backdrop-blur-xl border border-black/5 dark:border-white/10 hover:border-red-600/50 transition-all duration-500 overflow-hidden"
      aria-label="Toggle Theme"
    >
      <div className="relative w-6 h-6">
        <Sun
          className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${darkMode ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100 text-yellow-500'}`}
          size={24}
        />
        <Moon
          className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${!darkMode ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100 text-red-600'}`}
          size={24}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-tr from-red-600/0 via-red-600/0 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </button>
  );
}
