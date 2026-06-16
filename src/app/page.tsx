import { tmdbService } from '@/lib/tmdb';
import Link from 'next/link';
import MediaRow from '@/components/MediaRow';
import HeroSection from '@/components/HeroSection';
import { MediaDetails, MediaItem, TMDBResponse } from '@/types/tmdb';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [trending, movies, tvShows, anime] = await Promise.all([
    tmdbService.getTrending('all').catch((error: unknown) => {
      console.error('Trending fetch error:', error);
      return null;
    }),
    tmdbService.getMovies('popular').catch((error: unknown) => {
      console.error('Movies fetch error:', error);
      return null;
    }),
    tmdbService.getTVShows('popular').catch((error: unknown) => {
      console.error('TV fetch error:', error);
      return null;
    }),
    tmdbService.getAnime().catch((error: unknown) => {
      console.error('Anime fetch error:', error);
      return null;
    }),
  ]) as [
    TMDBResponse<MediaItem> | null,
    TMDBResponse<MediaItem> | null,
    TMDBResponse<MediaItem> | null,
    TMDBResponse<MediaItem> | null,
  ];

  const trendingItems = (trending?.results ?? []).filter((item) => item.media_type !== 'person');
  const movieList = movies?.results ?? [];
  const tvShowItems = tvShows?.results ?? [];
  const animeItems = anime?.results ?? [];
  const featured = movieList[0] ?? trendingItems[0] ?? tvShowItems[0] ?? animeItems[0];
  const featuredType = featured?.media_type === 'tv' ? 'tv' : 'movie';

  if (!featured) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-500 overflow-x-hidden">
        <section className="relative min-h-[85vh] flex items-center px-4 md:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(229,9,20,0.18),_transparent_40%),linear-gradient(135deg,_#fafafa_0%,_#f4f4f5_45%,_#09090b_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(229,9,20,0.22),_transparent_40%),linear-gradient(135deg,_#0a0a0a_0%,_#18181b_45%,_#030303_100%)]" />
          <div className="relative z-10 max-w-4xl space-y-6">
            <span className="inline-flex bg-red-600 text-white px-3 py-1 rounded-sm italic font-black uppercase tracking-[0.2em] text-[10px]">
              CineNova Library
            </span>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic text-neutral-950 dark:text-white leading-[0.9]">
              Explore Movies, TV, Anime
            </h1>
            <p className="max-w-2xl text-neutral-700 dark:text-neutral-300 text-sm md:text-lg font-medium leading-relaxed">
              TMDB did not return a featured title yet, but the VidKing embed player is wired in and ready for any
              movie or episode page you open.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link href="/discovers" className="bg-red-600 text-white px-8 py-4 rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:bg-red-700 transition-all">
                Browse Catalog
              </Link>
              <Link href="/movies" className="bg-white/10 dark:bg-neutral-800/40 backdrop-blur-xl text-neutral-900 dark:text-white px-8 py-4 rounded-full border border-black/5 dark:border-white/10 hover:bg-white/20 dark:hover:bg-neutral-700 transition-all">
                Browse Movies
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }
  let details: MediaDetails | null = null;

  try {
    details = await tmdbService.getDetails(featuredType, String(featured.id));
  } catch (error) {
    console.error('[HomePage] TMDB fetch error:', error);
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-500 overflow-x-hidden">
        <section className="relative min-h-[85vh] flex items-center px-4 md:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(229,9,20,0.18),_transparent_40%),linear-gradient(135deg,_#fafafa_0%,_#f4f4f5_45%,_#09090b_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(229,9,20,0.22),_transparent_40%),linear-gradient(135deg,_#0a0a0a_0%,_#18181b_45%,_#030303_100%)]" />
          <div className="relative z-10 max-w-4xl space-y-6">
            <span className="inline-flex bg-red-600 text-white px-3 py-1 rounded-sm italic font-black uppercase tracking-[0.2em] text-[10px]">
              CineNova Originals
            </span>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic text-neutral-950 dark:text-white leading-[0.9]">
              {featured.title ?? featured.name ?? 'Featured Title'}
            </h1>
            <p className="max-w-2xl text-neutral-700 dark:text-neutral-300 text-sm md:text-lg font-medium leading-relaxed">
              We could not load the full metadata for this title right now, but you can still open the watch page and
              let VidKing handle playback.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link href="/discovers" className="bg-red-600 text-white px-8 py-4 rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:bg-red-700 transition-all">
                Browse Catalog
              </Link>
              <Link
                href={`/content?id=${featured.id}&type=${featuredType}`}
                className="bg-white/10 dark:bg-neutral-800/40 backdrop-blur-xl text-neutral-900 dark:text-white px-8 py-4 rounded-full border border-black/5 dark:border-white/10 hover:bg-white/20 dark:hover:bg-neutral-700 transition-all"
              >
                Open Watch Page
              </Link>
            </div>
          </div>
        </section>
        <div className="px-4 md:px-12 py-12 relative z-10 space-y-16 pb-40">
          {trendingItems.length > 0 && <MediaRow title="Trending Now" items={trendingItems} />}
          {movieList.length > 0 && <MediaRow title="Blockbuster Movies" items={movieList} type="movie" />}
          {tvShowItems.length > 0 && <MediaRow title="Top Rated TV Series" items={tvShowItems} type="tv" />}
          {animeItems.length > 0 && <MediaRow title="Anime Collection" items={animeItems} type="tv" />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-500 overflow-x-hidden">
      <HeroSection details={details} contentType={featuredType} />

      <div className="px-4 md:px-12 py-12 relative z-10 -mt-32 space-y-16 pb-40">
        {trendingItems.length > 0 && <MediaRow title="Trending Now" items={trendingItems} />}
        {movieList.length > 0 && <MediaRow title="Blockbuster Movies" items={movieList} type="movie" />}
        {tvShowItems.length > 0 && <MediaRow title="Top Rated TV Series" items={tvShowItems} type="tv" />}
        {animeItems.length > 0 && <MediaRow title="Anime Collection" items={animeItems} type="tv" />}
      </div>
    </div>
  );
}
