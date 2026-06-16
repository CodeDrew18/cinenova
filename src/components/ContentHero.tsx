'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Plus, Star, Volume2, VolumeX } from 'lucide-react';
import { getImageUrl } from '@/lib/media';
import VideoPlayer from '@/components/VideoPlayer';
import { MediaDetails, VideoItem, MediaType } from '@/types/tmdb';

interface ContentHeroProps {
  details: MediaDetails;
  trailer?: VideoItem;
  contentType: MediaType;
  heroVideoUrl: string;
}

export default function ContentHero({ details, trailer, contentType, heroVideoUrl }: ContentHeroProps) {
  const [isMuted, setIsMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const title = details.title ?? details.name ?? 'Untitled';
  const releaseDate = details.release_date ?? details.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
  const rating = details.vote_average ? details.vote_average.toFixed(1) : '0.0';
  const runtime = details.runtime ?? (details.episode_run_time ? details.episode_run_time[0] : null);

  const toggleMute = () => {
    if (!iframeRef.current) return;
    const command = isMuted ? 'unMute' : 'mute';
    iframeRef.current.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: command, args: [] }),
      '*'
    );
    setIsMuted((prev) => !prev);
  };

  return (
    <section className="relative h-[75vh] w-full overflow-hidden">
      <Image
        src={getImageUrl(details.backdrop_path)}
        alt={title}
        fill
        className={`object-cover transition-opacity duration-1000 grayscale-[20%] ${trailer ? 'opacity-0' : 'opacity-40'}`}
        priority
      />

      {trailer && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailer.key}&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&playsinline=1&enablejsapi=1`}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] h-full md:w-full md:h-auto aspect-video min-w-full min-h-full opacity-60 grayscale-[10%]"
            allow="autoplay; encrypted-media"
            title={`${title} Trailer`}
          />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-neutral-50/60 dark:from-neutral-950 via-neutral-50/30 dark:via-neutral-950/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-50/60 dark:from-neutral-950 via-transparent to-transparent" />

      <div className="absolute bottom-16 left-4 md:left-16 max-w-4xl space-y-6 z-20">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] font-black uppercase tracking-[0.2em]">
          <span className="bg-red-600 text-white px-3 py-1 rounded-sm italic">CineNova Originals</span>
          <span className="flex items-center gap-1 text-yellow-500">
            <Star size={14} fill="currentColor" /> {rating}
          </span>
          <span className="text-neutral-600 dark:text-neutral-400">{year}</span>
          {runtime && <span className="text-neutral-600 dark:text-neutral-400">{runtime} MIN</span>}
          <span className="text-neutral-400 dark:text-neutral-500 border border-neutral-300 dark:border-neutral-800 px-2 py-0.5 rounded uppercase">{contentType}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter text-neutral-950 dark:text-white uppercase italic drop-shadow-2xl leading-[0.9]">{title}</h1>
        <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-lg max-w-2xl font-medium leading-relaxed line-clamp-4">{details.overview}</p>
        <div className="flex items-center gap-4 pt-4">
          <VideoPlayer videoUrl={heroVideoUrl} />
          <button className="bg-white/10 dark:bg-neutral-800/40 backdrop-blur-xl text-neutral-900 dark:text-white p-3.5 rounded-full border border-black/5 dark:border-white/10 hover:bg-white/20 dark:hover:bg-neutral-700 transition-all flex items-center justify-center">
            <Plus size={20} />
          </button>
          {trailer && (
            <button onClick={toggleMute} className="bg-white/10 dark:bg-neutral-800/40 backdrop-blur-xl text-neutral-900 dark:text-white p-3.5 rounded-full border border-black/5 dark:border-white/10 hover:bg-white/20 dark:hover:bg-neutral-700 transition-all flex items-center justify-center">
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}