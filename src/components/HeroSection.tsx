'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Star, Plus, Volume2, VolumeX } from 'lucide-react';
import { getImageUrl } from '@/lib/media';
import { MediaDetails, MediaType, VideoResponse, VideoItem } from '@/types/tmdb';

interface HeroSectionProps {
  details: MediaDetails;
  videoData?: VideoResponse | null;
  contentType: MediaType;
}

export default function HeroSection({ details, videoData, contentType }: HeroSectionProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const trailer = (details.videos?.results ?? videoData?.results ?? []).find(
    (video: VideoItem) => (video.type === 'Trailer' || video.type === 'Teaser') && video.site === 'YouTube'
  );

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
    setIsMuted((current) => !current);
  };

  return (
    <section className="relative h-[85vh] w-full overflow-hidden">
      <Image
        src={getImageUrl(details.backdrop_path)}
        alt={title}
        fill
        className={`object-cover transition-opacity duration-1000 grayscale-[10%] ${isVideoLoaded ? 'opacity-0' : 'opacity-100'}`}
        priority
      />

      {trailer && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailer.key}&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&playsinline=1&enablejsapi=1`}
            className="absolute inset-0 w-full h-full min-w-full min-h-full scale-110 opacity-60 grayscale-[10%]"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            title={`${title} Trailer`}
            onLoad={() => setIsVideoLoaded(true)}
          />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-neutral-950 via-white/40 dark:via-neutral-950/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-neutral-950 via-transparent to-transparent" />

      <div className="absolute bottom-20 left-4 md:left-16 max-w-4xl space-y-6 z-20">
        <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em]">
          <span className="bg-red-600 text-white px-3 py-1 rounded-sm italic shadow-lg shadow-red-600/20">
            CineNova Exclusive
          </span>
          <span className="flex items-center gap-1 text-yellow-500">
            <Star size={14} fill="currentColor" /> {rating}
          </span>
          <span className="text-neutral-600 dark:text-neutral-400">{year}</span>
          {runtime && <span className="text-neutral-600 dark:text-neutral-400">{runtime} MIN</span>}
          <span className="text-neutral-400 dark:text-neutral-500 border border-neutral-300 dark:border-white/10 px-2 py-0.5 rounded uppercase">
            {contentType === 'movie' ? 'Feature Film' : 'TV Series'}
          </span>
        </div>

        <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-neutral-950 dark:text-white uppercase italic drop-shadow-2xl leading-[0.85]">
          {title}
        </h1>

        <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-lg max-w-2xl font-medium leading-relaxed line-clamp-4 md:line-clamp-none">
          {details.overview}
        </p>

        <div className="flex items-center gap-4 pt-4">
          <Link
            href={`/content?id=${details.id}&type=${contentType}`}
            className="bg-red-600 text-white px-12 py-5 rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:bg-red-700 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 shadow-2xl shadow-red-600/40"
          >
            <Play size={18} fill="white" className="ml-1" /> Start Watching
          </Link>
          <button className="bg-white/10 dark:bg-neutral-800/40 backdrop-blur-xl text-neutral-900 dark:text-white px-6 py-5 rounded-full border border-black/5 dark:border-white/10 hover:bg-red-600 hover:text-white transition-all transform hover:rotate-90">
            <Plus size={20} />
          </button>
          <button
            onClick={toggleMute}
            className="hidden md:flex bg-white/10 dark:bg-neutral-800/40 backdrop-blur-xl text-neutral-900 dark:text-white p-5 rounded-full border border-black/5 dark:border-white/10 hover:bg-neutral-700 transition-all"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>
    </section>
  );
}
