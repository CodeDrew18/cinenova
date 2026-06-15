import { tmdbService, getImageUrl } from '@/lib/tmdb';
import Image from 'next/image';
import MediaRow from '@/components/MediaRow';
import { Play, Info } from 'lucide-react';

export default async function HomePage() {
  // Fetch a mix of content for the landing page
  const [trending, popularMovies, popularTV, anime] = await Promise.all([
    tmdbService.getTrending('all'),
    tmdbService.getMovies('popular'),
    tmdbService.getTVShows('popular'),
    tmdbService.getAnime()
  ]);

  const heroItem = trending.results[0];

  return (
    <div className="flex flex-col gap-6 pb-20 bg-neutral-950">
      {/* Hero Section - Cinematic Hushua Design */}
      <section className="relative h-[80vh] w-full">
        <Image 
          src={getImageUrl(heroItem.backdrop_path)}
          alt={heroItem.title || heroItem.name}
          fill
          className="object-cover opacity-40 grayscale-[20%]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-transparent to-transparent" />
        
        <div className="absolute bottom-24 left-4 md:left-16 max-w-4xl space-y-6">
          <div className="flex items-center gap-3">
            <span className="bg-red-600 text-white font-black px-3 py-1 text-[10px] uppercase tracking-widest rounded-sm">Trending</span>
            <span className="text-neutral-400 font-bold text-xs uppercase tracking-[0.2em]">Featured Today</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase italic drop-shadow-2xl">
            {heroItem.title || heroItem.name}
          </h1>
          <p className="text-neutral-300 text-sm md:text-lg line-clamp-3 max-w-2xl font-medium leading-relaxed">
            {heroItem.overview}
          </p>
          <div className="flex items-center gap-4 pt-4">
            <button className="bg-white text-black px-10 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:bg-red-600 hover:text-white transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2">
              <Play size={16} fill="currentColor" /> Watch Now
            </button>
            <button className="bg-neutral-800/80 backdrop-blur-md text-white px-10 py-4 rounded-full font-black uppercase tracking-widest text-xs border border-white/10 hover:bg-neutral-700 transition-all flex items-center gap-2">
              <Info size={16} /> Details
            </button>
          </div>
        </div>
      </section>

      <div className="space-y-12 -mt-10 relative z-10">
        <MediaRow title="Trending Hits" items={trending.results} />
        <MediaRow title="Popular Movies" items={popularMovies.results} />
        <MediaRow title="Must-Watch Series" items={popularTV.results} />
        <MediaRow title="Anime Spotlight" items={anime.results} />
      </div>
    </div>
  );
}