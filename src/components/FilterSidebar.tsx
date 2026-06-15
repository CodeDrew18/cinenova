'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronDown, Calendar, Star, Clock, Globe } from 'lucide-react';

const GENRES = [
  { id: '28', name: 'Action' }, { id: '12', name: 'Adventure' }, { id: '16', name: 'Animation' },
  { id: '35', name: 'Comedy' }, { id: '80', name: 'Crime' }, { id: '99', name: 'Documentary' },
  { id: '18', name: 'Drama' }, { id: '10751', name: 'Family' }, { id: '14', name: 'Fantasy' }
];

export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Local state for filters
  const [type, setType] = useState(searchParams.get('type') || 'movie');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    searchParams.get('with_genres')?.split(',').filter(Boolean) || []
  );
  const [fromDate, setFromDate] = useState(searchParams.get('from') || '');
  const [toDate, setToDate] = useState(searchParams.get('to') || '');
  const [score, setScore] = useState(searchParams.get('score') || '0');

  // Update URL when "Apply Filters" is clicked
  const handleApply = () => {
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (selectedGenres.length > 0) params.set('with_genres', selectedGenres.join(','));
    if (fromDate) params.set('from', fromDate);
    if (toDate) params.set('to', toDate);
    if (score !== '0') params.set('score', score);

    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleGenre = (genreId: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const showMeOptions = [
    { label: 'Everything', value: 'multi' },
    { label: 'Movies', value: 'movie' },
    { label: 'TV Shows', value: 'tv' },
  ];

  return (
    <div className="w-full lg:w-80 space-y-4">
      {/* Show Me Section */}
      <div className="bg-neutral-900/50 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-5 flex items-center justify-between border-b border-white/5 cursor-pointer group">
          <h3 className="font-black uppercase tracking-widest text-xs italic">Show Me</h3>
          <ChevronDown size={16} className="text-neutral-500 group-hover:text-white transition-colors" />
        </div>
        <div className="p-5 space-y-3">
          {showMeOptions.map((opt) => (
            <label 
              key={opt.value} 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setType(opt.value)}
            >
              <div className={`w-4 h-4 rounded-full border-2 border-red-600 flex items-center justify-center ${type === opt.value ? 'bg-red-600' : ''}`}>
                {type === opt.value && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
              <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${type === opt.value ? 'text-white' : 'text-neutral-400 group-hover:text-white'}`}>
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Release Dates */}
      <div className="bg-neutral-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-white/5">
          <h3 className="font-black uppercase tracking-widest text-xs italic">Release Dates</h3>
          <Calendar size={16} className="text-red-600" />
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase text-neutral-500 tracking-tighter">From</p>
            <input 
              type="date" 
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-bold text-white outline-none focus:border-red-600 color-scheme-dark" 
              style={{ colorScheme: 'dark' }}
            />
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase text-neutral-500 tracking-tighter">To</p>
            <input 
              type="date" 
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-bold text-white outline-none focus:border-red-600 color-scheme-dark" 
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>
      </div>

      {/* Genres */}
      <div className="bg-neutral-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-white/5">
          <h3 className="font-black uppercase tracking-widest text-xs italic">Genres</h3>
        </div>
        <div className="p-5 flex flex-wrap gap-2">
          {GENRES.map(genre => (
            <button 
              key={genre.id} 
              onClick={() => toggleGenre(genre.id)}
              className={`px-3 py-1.5 rounded-full border transition-all text-[10px] font-black uppercase tracking-tighter ${
                selectedGenres.includes(genre.id) 
                ? 'bg-red-600 border-red-600 text-white' 
                : 'border-white/5 bg-white/5 text-neutral-400 hover:border-red-600 hover:text-white'}`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>

      {/* User Score Slider */}
      <div className="bg-neutral-900/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-white/5">
          <h3 className="font-black uppercase tracking-widest text-xs italic">User Score</h3>
          <Star size={16} className="text-yellow-500" />
        </div>
        <div className="p-5 space-y-2">
          <input 
            type="range" 
            min="0" 
            max="10" 
            step="1"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="w-full accent-red-600" 
          />
          <div className="flex justify-between text-[10px] font-bold text-neutral-500">
            <span>0</span>
            <span className="text-white font-black">{score}+</span>
            <span>10</span>
          </div>
        </div>
      </div>

      <button 
        onClick={handleApply}
        className="w-full bg-red-600 py-4 rounded-2xl font-black uppercase tracking-[0.3em] italic text-xs shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all"
      >
        Apply Filters
      </button>
    </div>
  );
}