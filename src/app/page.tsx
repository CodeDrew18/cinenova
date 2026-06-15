import { tmdbService, getImageUrl } from '@/lib/tmdb';
import Image from 'next/image';
import MediaRow from '@/components/MediaRow';
import { Play, Info } from 'lucide-react';

// Force dynamic rendering so the random featured item changes on every reload
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch a mix of content for the landing page
  const [trendingData, popularMovies, popularTV, anime, topRated, action, scifi, horror] = await Promise.all([
    tmdbService.getTrending('all'),
    tmdbService.getMovies('popular'),
    tmdbService.getTVShows('popular'),
    tmdbService.getAnime(),
    tmdbService.getMovies('top_rated'),
    tmdbService.getByGenre('movie', '28'), // Action
    tmdbService.getByGenre('movie', '878'), // Sci-Fi
    tmdbService.getByGenre('movie', '27'), // Horror
  ]);

  const trending = trendingData.results;
  // Randomly pick a hero item from the trending list
  const heroItem = trending[Math.floor(Math.random() * trending.length)];

  // Fetch video data for the "preview state"
  let trailer = null;
  try {
    const videoData = await tmdbService.getVideos(heroItem.id, heroItem.media_type || 'movie');
    trailer = videoData.results?.find(
      (v: any) => (v.type === 'Trailer' || v.type === 'Teaser') && v.site === 'YouTube'
    );
  } catch (error) {
    console.error("Failed to fetch preview video:", error);
  }

  return (
    <div className="flex flex-col gap-6 pb-20 bg-neutral-950 overflow-x-hidden">
      {/* Hero Section - Cinematic Hushua Design */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        {/* Background Image (Fallback/Initial state) */}
        <Image 
          src={getImageUrl(heroItem.backdrop_path)}
          alt={heroItem.title || heroItem.name}
          fill
          className={`object-cover transition-opacity duration-1000 grayscale-[20%] ${trailer ? 'opacity-0' : 'opacity-40'}`}
          priority
        />

        {/* Preview State - Autoplaying Background Video */}
        {trailer && (
          <div className="absolute inset-0 pointer-events-none scale-110">
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailer.key}&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1`}
              className="w-full h-full aspect-video object-cover opacity-50 grayscale-[10%]"
              allow="autoplay; encrypted-media"
            />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-transparent to-transparent" />
        
        <div className="absolute bottom-24 left-4 md:left-16 max-w-4xl space-y-6 z-20">
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
        <MediaRow title="Trending Hits" items={trending} />
        <MediaRow title="Popular Movies" items={popularMovies.results} />
        <MediaRow title="Must-Watch Series" items={popularTV.results} />
        <MediaRow title="Anime Spotlight" items={anime.results} />
        <MediaRow title="All-Time Classics" items={topRated.results} />
        <MediaRow title="Adrenaline Rush" items={action.results} />
        <MediaRow title="Beyond Reality" items={scifi.results} />
        <MediaRow title="Midnight Horrors" items={horror.results} />
      </div>
    </div>
  );
}