'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, Film, Tv, Play, Search, Info, LogOut, User as UserIcon } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import ThemeToggle from './ThemeToggle';

interface MobileMenuProps {
  user: SupabaseUser | null;
  onLogout: () => void;
}

export default function MobileMenu({ user, onLogout }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const navLinks = [
    { name: 'Home', href: '/', icon: <Home size={20} /> },
    { name: 'Movies', href: '/movies', icon: <Film size={20} /> },
    { name: 'TV Shows', href: '/tv', icon: <Tv size={20} /> },
    { name: 'Anime', href: '/anime', icon: <Play size={20} /> },
    { name: 'Discover', href: '/discovers', icon: <Search size={20} /> },
  ];

  return (
    <div className="md:hidden">
      {/* Hamburger Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-neutral-950 dark:text-white transition-transform active:scale-90"
        aria-label="Open Menu"
      >
        <Menu size={28} />
      </button>

      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sliding Sidebar */}
      <div
        className={`fixed top-0 right-0 z-[101] h-full w-[80%] max-w-[300px] bg-white dark:bg-neutral-950 shadow-2xl transform transition-transform duration-500 ease-in-out border-l border-neutral-200 dark:border-neutral-800 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-10">
            <span className="text-2xl font-black italic tracking-tighter text-red-600">
              CINENOVA
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-neutral-500 hover:text-red-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto hide-scrollbar">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] italic transition-all active:scale-95 ${
                    isActive
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="pt-6 mt-6 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
            {user ? (
              <div className="space-y-1">
                <Link
                  href="/profile"
                  className="flex items-center gap-4 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                >
                  <UserIcon size={20} />
                  {user.user_metadata?.username || user.email?.split('@')[0]}
                </Link>
                <button
                  onClick={() => { onLogout(); setIsOpen(false); }}
                  className="flex items-center gap-4 w-full px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 hover:bg-red-600/10 hover:text-red-600 transition-colors"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center justify-center w-full bg-red-600 text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-600/30 active:scale-95 transition-all"
              >
                Login to CineNova
              </Link>
            )}

            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                Appearance
              </span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}