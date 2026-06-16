'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, LogOut } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import ThemeToggle from './ThemeToggle';
import MobileMenu from './MobileMenu';

type SearchType = 'multi' | 'movie' | 'tv';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Discover', href: '/discovers' },
  { name: 'Movies', href: '/movies' },
  { name: 'TV Shows', href: '/tv' },
  { name: 'Anime', href: '/anime' },
];

const Navbar = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('multi');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search_results?q=${encodeURIComponent(searchQuery)}&type=${searchType}`);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error', error);
    }
    setUser(null);
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="fixed top-0 w-full z-[100] bg-white/80 dark:bg-neutral-950/60 backdrop-blur-2xl border-b border-black/5 dark:border-white/5 h-20 transition-all duration-500">
      <div className="max-w-[1400px] mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="text-3xl font-black tracking-[-0.05em] text-red-600 italic hover:scale-105 transition-transform group">
            CINE<span className="text-neutral-950 dark:text-white">NOVA</span>
            <div className="h-0.5 w-0 group-hover:w-full bg-red-600 transition-all duration-300" />
          </Link>

          <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`hover:text-neutral-950 dark:hover:text-white transition-colors relative group ${pathname === link.href ? 'text-neutral-950 dark:text-white' : ''}`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 h-[1px] bg-red-600 transition-all ${pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <form onSubmit={handleSearch} className="hidden lg:flex items-center bg-neutral-100 dark:bg-neutral-900/80 rounded-full px-5 py-2 border border-black/5 dark:border-white/10 focus-within:border-red-600 transition-all shadow-inner">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as SearchType)}
              className="bg-transparent text-[10px] font-black uppercase text-neutral-500 outline-none border-r border-black/10 dark:border-white/10 pr-2 mr-2 cursor-pointer hover:text-neutral-950 dark:hover:text-white"
            >
              <option value="multi">All</option>
              <option value="movie">Movies</option>
              <option value="tv">TV</option>
            </select>
            <input
              type="text"
              placeholder="SEARCH TITLES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-[10px] font-bold focus:ring-0 w-48 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 uppercase text-neutral-950 dark:text-white"
            />
            <button type="submit" className="text-neutral-500 hover:text-red-600 transition-colors">
              <Search size={16} strokeWidth={3} />
            </button>
          </form>

          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/profile" className="text-sm font-bold uppercase tracking-wide text-neutral-700 dark:text-neutral-200">
                {user.user_metadata?.username || user.email?.split('@')[0]}
              </Link>
              <button onClick={handleLogout} className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-[11px] font-black uppercase tracking-widest bg-red-600 px-6 py-2 rounded-sm hover:bg-red-700 transition-all shadow-lg shadow-red-600/30">
              LOGIN
            </Link>
          )}

          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          <MobileMenu user={user} onLogout={handleLogout} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
