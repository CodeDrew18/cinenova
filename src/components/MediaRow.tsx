'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl } from '@/lib/media';
import { MediaItem, MediaType } from '@/types/tmdb';
import { Play, Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaRowProps {
  title: string;
  items: MediaItem[];
  type?: MediaType;
  showRank?: boolean;
}

export default function MediaRow({ title, items, type, showRank }: MediaRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!items || items.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="mt-8 group/row relative overflow-x-hidden">
      <h2 className="text-xl font-black mb-6 text-neutral-950 dark:text-white uppercase tracking-[0.3em] px-4 md:px-12 border-l-[6px] border-red-600 ml-4 md:ml-0 pl-4 italic leading-none">
        {title}
      </h2>

      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-[55%] -translate-y-1/2 z-40 bg-black/80 p-4 rounded-full opacity-0 group-hover/row:opacity-100 transition-all hover:bg-red-600 text-white hidden md:flex ml-4 shadow-2xl border border-white/10"
      >
        <ChevronLeft size={32} strokeWidth={3} />
      </button>

      <div 
        ref={scrollRef} 
        className="flex gap-4 md:gap-5 overflow-x-auto pb-10 px-4 md:px-12 scroll-smooth whitespace-nowrap hide-scrollbar touch-pan-x"
      >
        {items.map((item, index) => {
          const resolvedType = item.media_type === 'movie' || item.media_type === 'tv' ? item.media_type : type ?? 'movie';
          const titleText = item.title ?? item.name ?? 'Untitled';

          return (
            <Link
              key={item.id}
              href={`/content?id=${item.id}&type=${resolvedType}`}
              className="min-w-[180px] md:min-w-[260px] relative aspect-[2/3] rounded-2xl overflow-hidden group bg-neutral-100 dark:bg-neutral-900 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-500 hover:scale-[1.03] hover:shadow-red-600/20 hover:ring-2 hover:ring-red-600 ring-offset-4 ring-offset-white dark:ring-offset-neutral-950 block"
            >
              {showRank && (
                <div className="absolute top-4 left-4 z-30 bg-red-600 text-white px-3 py-1 rounded-sm font-black italic text-[10px] shadow-xl shadow-red-600/40 flex items-center gap-1 transform -skew-x-12">
                  TOP <span className="text-lg leading-none">{index + 1}</span>
                </div>
              )}
              <Image
                src={getImageUrl(item.poster_path)}
                alt={titleText}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100 grayscale-[20%] group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-5 transform translate-y-4 group-hover:translate-y-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-red-600 p-2 rounded-full shadow-lg shadow-red-600/40">
                    <Play size={12} fill="white" className="text-white ml-0.5" />
                  </div>
                  <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-yellow-500">
                    <Star size={10} fill="currentColor" /> {(item.vote_average ?? 0).toFixed(1)}
                  </div>
                </div>
                <span className="text-sm font-black text-white uppercase italic tracking-tighter line-clamp-2 leading-tight">
                  {titleText}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-[55%] -translate-y-1/2 z-40 bg-black/80 p-4 rounded-full opacity-0 group-hover/row:opacity-100 transition-all hover:bg-red-600 text-white hidden md:flex mr-4 shadow-2xl border border-white/10"
      >
        <ChevronRight size={32} strokeWidth={3} />
      </button>
    </section>
  );
}
