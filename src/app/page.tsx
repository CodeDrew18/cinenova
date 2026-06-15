import { tmdbService, getImageUrl } from '@/lib/tmdb';
import Image from 'next/image';
import MediaRow from '@/components/MediaRow';

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
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />
        <div className="absolute bottom-20 left-4 md:left-12 max-w-3xl space-y-4">
          <span className="text-red-600 font-bold tracking-[0.3em] text-sm uppercase">Featured Today</span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase italic">
            {heroItem.title || heroItem.name}
          </h1>
          <p className="text-neutral-400 text-sm md:text-lg line-clamp-3 max-w-xl font-medium">
            {heroItem.overview}
          </p>
          <button className="bg-white text-black px-10 py-4 rounded-full font-black hover:bg-red-600 hover:text-white transition-all transform hover:scale-105">
            WATCH NOW
          </button>
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