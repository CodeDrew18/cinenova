'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
  Home,
  Film,
  Tv,
  Play,
  Search,
  LogOut,
  User as UserIcon,
  Filter,
} from 'lucide-react';

import { navLinks } from '@/lib/navLinks';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import ThemeToggle from './ThemeToggle';

interface MobileMenuProps {
  user: SupabaseUser | null;
  onLogout: () => void;
}

type SearchType = 'multi' | 'movie' | 'tv';

export default function MobileMenu({ user, onLogout }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('multi');

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
  }, [isOpen]);

  const getIcon = (href: string) => {
    switch (href) {
      case '/':
        return <Home size={20} />;
      case '/discovers':
        return <Filter size={20} />;
      case '/movies':
        return <Film size={20} />;
      case '/tv':
        return <Tv size={20} />;
      case '/anime':
        return <Play size={20} />;
      default:
        return <Home size={20} />;
    }
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/search_results?q=${encodeURIComponent(searchQuery)}&type=${searchType}`
      );
      setIsOpen(false);
    }
  };

  return (
    <div className="lg:hidden">
      {/* Hamburger */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 transition-transform active:scale-90"
        style={{ color: 'var(--hamburger-icon-color, #0f172a)' }}
        aria-label="Open Menu"
      >
        <Menu size={28} />
      </button>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar FULL HEIGHT FIX */}
      <div
        className={`fixed top-0 right-0 z-[9999]
        h-screen w-[85%] max-w-[320px]
        bg-gradient-to-b from-black via-zinc-950 to-black
        border-l border-red-600/20
        shadow-[0_0_80px_rgba(255,0,0,0.15)]
        transform transition-transform duration-500 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* FULL HEIGHT WRAPPER */}
        <div className="flex flex-col h-full p-6 text-white">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <span className="text-2xl font-black italic tracking-tighter text-red-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.6)]">
              CINENOVA
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-white/70 hover:text-red-500"
            >
              <X size={24} />
            </button>
          </div>

          {/* Search */}
          <form className="mb-8" onSubmit={handleSearch}>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
              
              <select
                value={searchType}
                onChange={(e) =>
                  setSearchType(e.target.value as SearchType)
                }
                className="bg-transparent text-[10px] font-black uppercase text-white/60 outline-none border-r border-white/10 pr-2 mr-2"
              >
                <option value="multi">All</option>
                <option value="movie">Movies</option>
                <option value="tv">TV</option>
              </select>

              <input
                type="text"
                placeholder="SEARCH..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent flex-1 text-[10px] font-bold uppercase text-white placeholder:text-white/40 outline-none"
              />

              <button className="text-white/60 hover:text-red-500">
                <Search size={18} strokeWidth={3} />
              </button>
            </div>
          </form>

          {/* NAVIGATION (fills remaining space properly) */}
          <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl
                text-xs font-black uppercase tracking-widest text-white
                bg-white/5 border border-white/10
                hover:bg-red-600/20 hover:border-red-500/40
                transition-all"
              >
                {getIcon(link.href)}
                <span>{link.name}</span>
              </Link>
            ))}
          </div>

          {/* FOOTER (sticks at bottom properly now) */}
          <div className="pt-6 mt-6 border-t border-white/10 space-y-4">
            
            {user ? (
              <div className="space-y-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-4 px-5 py-3 rounded-2xl
                  text-xs font-black uppercase tracking-widest text-white
                  bg-white/5 border border-white/10
                  hover:bg-red-600/20 transition-all"
                >
                  <UserIcon size={20} />
                  {user.user_metadata?.username ||
                    user.email?.split('@')[0]}
                </Link>

                <button
                  onClick={() => {
                    onLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-4 w-full px-5 py-3 rounded-2xl
                  text-xs font-black uppercase tracking-widest text-white
                  bg-white/5 border border-white/10
                  hover:bg-red-600/20 transition-all"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center justify-center w-full bg-red-600 text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-[10px]"
              >
                Login to CineNova
              </Link>
            )}

            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
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