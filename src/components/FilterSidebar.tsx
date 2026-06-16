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
      <div className="bg-white/80 dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-5 flex items-center justify-between border-b border-neutral-200 dark:border-white/5">
          <h3 className="font-black uppercase tracking-widest text-xs italic text-neutral-950 dark:text-white">
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
                className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${
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
      <div className="bg-white/80 dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/5 rounded-2xl overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-neutral-200 dark:border-white/5">
          <h3 className="font-black uppercase tracking-widest text-xs italic">
            Release Dates
          </h3>
          <Calendar size={16} className="text-red-600" />
        </div>

        <div className="p-5 space-y-4">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full bg-white dark:bg-black/40 border rounded-lg px-3 py-2 text-[10px] font-bold"
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full bg-white dark:bg-black/40 border rounded-lg px-3 py-2 text-[10px] font-bold"
          />
        </div>
      </div>

      {/* GENRES */}
      <div className="bg-white/80 dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/5 rounded-2xl overflow-hidden">
        <div className="p-5 border-b">
          <h3 className="font-black uppercase text-xs italic">Genres</h3>
        </div>

        <div className="p-5 flex flex-wrap gap-2">
          {GENRES.map((genre) => (
            <button
              key={genre.id}
              onClick={() => toggleGenre(genre.id)}
              className={`px-3 py-1.5 rounded-full border text-[10px] font-black uppercase ${
                selectedGenres.includes(genre.id)
                  ? 'bg-red-600 text-white border-red-600'
                  : 'text-neutral-500 border-neutral-200 dark:border-white/5'
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>

      {/* 🌍 COUNTRY */}
      <div className="bg-white/80 dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/5 rounded-2xl overflow-hidden">
        <div className="p-5 border-b">
          <h3 className="font-black uppercase text-xs italic">
            Country
          </h3>
        </div>

        <div className="p-5">
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full bg-white dark:bg-black/40 border rounded-lg px-3 py-2 text-[10px] font-bold"
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
      <div className="bg-white/80 dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/5 rounded-2xl overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b">
          <h3 className="font-black uppercase text-xs italic">
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
        className="w-full bg-red-600 py-4 rounded-2xl font-black uppercase tracking-[0.3em] text-xs"
      >
        Apply Filters
      </button>
    </div>
  );
}