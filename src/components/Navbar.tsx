'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, User, Menu, X, LogOut, Film, Tv, Play } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('multi');
  const pathname = usePathname(); // Get the current path
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`);
      setIsOpen(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const navLinks = [
    { name: 'Home', href: '/', icon: <Film size={18} /> },
    { name: 'Discover', href: '/discovers', icon: <Search size={18} /> },
    { name: 'Movies', href: '/movies', icon: <Film size={18} /> },
    { name: 'TV Shows', href: '/tv', icon: <Tv size={18} /> },
    { name: 'Anime', href: '/anime', icon: <Play size={18} /> },
  ];

  return (
    <nav className="fixed top-0 w-full z-[100] bg-neutral-950/60 backdrop-blur-2xl border-b border-white/5 h-20 transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="text-3xl font-black tracking-[-0.05em] text-red-600 italic hover:scale-105 transition-transform group">
            CINE<span className="text-white">NOVA</span>
            <div className="h-0.5 w-0 group-hover:w-full bg-red-600 transition-all duration-300" />
          </Link>

          <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`hover:text-white transition-colors relative group ${pathname === link.href ? 'text-white' : 'text-neutral-400'}`}
              >
                {link.name}
                {/* Highlight indicator */}
                <span className={`absolute -bottom-1 left-0 h-[1px] bg-red-600 transition-all ${pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <form onSubmit={handleSearch} className="hidden lg:flex items-center bg-neutral-950/80 rounded-full px-5 py-2 border border-white/10 focus-within:border-red-600 transition-all shadow-inner">
            <select 
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase text-neutral-500 outline-none border-r border-white/10 pr-2 mr-2 cursor-pointer hover:text-white"
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
              className="bg-transparent border-none text-[10px] font-bold focus:ring-0 w-48 placeholder:text-neutral-600 uppercase"
            />
            <button type="submit" className="text-neutral-500 hover:text-red-600 transition-colors">
              <Search size={16} strokeWidth={3} />
            </button>
          </form>

          {user ? (
            <button onClick={handleLogout} className="text-neutral-400 hover:text-white transition-colors">
              <LogOut size={20} />
            </button>
          ) : (
            <Link href="/login" className="text-[11px] font-black uppercase tracking-widest bg-red-600 px-6 py-2 rounded-sm hover:bg-red-700 transition-all shadow-lg shadow-red-600/30">
              LOGIN
            </Link>
          )}

          <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden fixed inset-0 bg-neutral-950 z-[90] flex flex-col items-center justify-center gap-8 transition-transform duration-500 ${isOpen ? 'translate-y-0' : '-translate-y-full'}`}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-2xl font-black italic uppercase tracking-tighter ${pathname === link.href ? 'text-red-600' : 'text-white'}`}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          {!user && (
            <Link href="/login" className="w-full text-center text-[11px] font-black uppercase tracking-widest bg-red-600 px-6 py-4 rounded-sm hover:bg-red-700 transition-all shadow-lg shadow-red-600/30" onClick={() => setIsOpen(false)}>
              Login
            </Link>
          )}
      </div>
    </nav>
  );
};

export default Navbar;
