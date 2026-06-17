'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronDown, Calendar, Star } from 'lucide-react';

const GENRES = [
  { id: '28', name: 'Action' },
  { id: '12', name: 'Adventure' },
  { id: '16', name: 'Animation' },
  { id: '35', name: 'Comedy' },
  { id: '80', name: 'Crime' },
  { id: '99', name: 'Documentary' },
  { id: '18', name: 'Drama' },
  { id: '10751', name: 'Family' },
  { id: '14', name: 'Fantasy' },
] as const;

const COUNTRIES = [
  { code: 'PH', name: 'Philippines' },
  { code: 'US', name: 'United States' },
  { code: 'KR', name: 'South Korea' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IN', name: 'India' },
  { code: 'FR', name: 'France' },
  { code: 'CA', name: 'Canada' },
] as const;

type ShowMeType = 'multi' | 'movie' | 'tv';

export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [type, setType] = useState<ShowMeType>(
    (searchParams.get('type') as ShowMeType) || 'movie'
  );

  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    searchParams.get('with_genres')?.split(',').filter(Boolean) || []
  );

  const [fromDate, setFromDate] = useState(searchParams.get('from') || '');
  const [toDate, setToDate] = useState(searchParams.get('to') || '');
  const [score, setScore] = useState(searchParams.get('score') || '0');

  // 🌍 NEW: Country state
  const [country, setCountry] = useState(
    searchParams.get('with_origin_country') || ''
  );

  const handleApply = () => {
    const params = new URLSearchParams();

    if (type) params.set('type', type);
    if (selectedGenres.length > 0)
      params.set('with_genres', selectedGenres.join(','));
    if (fromDate) params.set('from', fromDate);
    if (toDate) params.set('to', toDate);
    if (score !== '0') params.set('score', score);

    // 🌍 Country filter
    if (country) params.set('with_origin_country', country);

    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleGenre = (genreId: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const showMeOptions: Array<{ label: string; value: ShowMeType }> = [
    { label: 'Everything', value: 'multi' },
    { label: 'Movies', value: 'movie' },
    { label: 'TV Shows', value: 'tv' },
  ];

  return (
    <div className="w-full lg:w-80 space-y-4">

      {/* SHOW ME */}
      <div className="bg-neutral-100/50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="font-black uppercase tracking-widest text-[10px] italic text-neutral-950 dark:text-white">
            Show Me
          </h3>
          <ChevronDown size={16} className="text-neutral-500" />
        </div>

        <div className="p-5 space-y-3">
          {showMeOptions.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setType(opt.value)}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 border-red-600 flex items-center justify-center ${
                  type === opt.value ? 'bg-red-600' : ''
                }`}
              >
                {type === opt.value && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </div>

              <span
                className={`text-[10px] font-black uppercase tracking-widest italic transition-colors ${
                  type === opt.value
                    ? 'text-neutral-950 dark:text-white'
                    : 'text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-950 dark:group-hover:text-white'
                }`}
              >
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* RELEASE DATE */}
      <div className="bg-neutral-100/50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="font-black uppercase tracking-widest text-[10px] italic">
            Release Dates
          </h3>
          <Calendar size={16} className="text-red-600" />
        </div>

        <div className="p-5 space-y-4">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full bg-white dark:bg-neutral-950/40 border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest italic focus:ring-1 focus:ring-red-600 outline-none"
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full bg-white dark:bg-neutral-950/40 border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest italic focus:ring-1 focus:ring-red-600 outline-none"
          />
        </div>
      </div>

      {/* GENRES */}
      <div className="bg-neutral-100/50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="font-black uppercase text-[10px] italic">Genres</h3>
        </div>

        <div className="p-5 flex flex-wrap gap-2">
          {GENRES.map((genre) => (
            <button
              key={genre.id}
              onClick={() => toggleGenre(genre.id)}
              className={`px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest italic transition-all active:scale-95 ${
                selectedGenres.includes(genre.id)
                  ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/20'
                  : 'text-neutral-500 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/40 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>

      {/* 🌍 COUNTRY */}
      <div className="bg-neutral-100/50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="font-black uppercase text-[10px] italic">
            Country
          </h3>
        </div>

        <div className="p-5">
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full bg-white dark:bg-neutral-950/40 border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest italic focus:ring-1 focus:ring-red-600 outline-none cursor-pointer"
          >
            <option value="">All Countries</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SCORE */}
      <div className="bg-neutral-100/50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="font-black uppercase text-[10px] italic">
            User Score
          </h3>
          <Star size={16} className="text-yellow-500" />
        </div>

        <div className="p-5">
          <input
            type="range"
            min="0"
            max="10"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="w-full accent-red-600"
          />
        </div>
      </div>

      {/* APPLY */}
      <button
        onClick={handleApply}
        className="w-full bg-red-600 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] italic text-white shadow-xl shadow-red-600/30 active:scale-95 transition-all"
      >
        Apply Filters
      </button>
    </div>
  );
}