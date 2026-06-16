import { tmdbService } from '@/lib/tmdb';
import MediaRow from '@/components/MediaRow';
import { MediaItem, TMDBResponse } from '@/types/tmdb';

const emptyResponse = (): TMDBResponse<MediaItem> => ({
  page: 1,
  results: [],
  total_pages: 1,
  total_results: 0,
});

export default async function TVShowsPage() {
  const [popular, drama, sciFi, reality] = await Promise.all([
    tmdbService.getTVShows('popular').catch((error: unknown) => {
      console.error('[TVShowsPage] Popular fetch error:', error);
      return emptyResponse();
    }),
    tmdbService.getByGenre('tv', '18').catch((error: unknown) => {
      console.error('[TVShowsPage] Drama fetch error:', error);
      return emptyResponse();
    }),
    tmdbService.getByGenre('tv', '10765').catch((error: unknown) => {
      console.error('[TVShowsPage] Sci-Fi fetch error:', error);
      return emptyResponse();
    }),
    tmdbService.getByGenre('tv', '10764').catch((error: unknown) => {
      console.error('[TVShowsPage] Reality fetch error:', error);
      return emptyResponse();
    }),
  ]);

  return (
    <div className="pt-32 pb-20 bg-white dark:bg-neutral-950 min-h-screen transition-colors duration-300">
      <div className="px-4 md:px-12 mb-12 border-l-[10px] border-red-600 ml-4 md:ml-12">
        <h1 className="text-7xl font-black tracking-tighter text-neutral-950 dark:text-white uppercase italic leading-none">
          TV <span className="text-red-600">SHOWS</span>
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-3 font-bold tracking-[0.4em] uppercase text-xs">Premium Global Series</p>
      </div>

      <MediaRow title="Trending Series" items={popular.results} type="tv" />
      <MediaRow title="Gripping Dramas" items={drama.results} type="tv" />
      <MediaRow title="Other Worlds" items={sciFi.results} type="tv" />
      <MediaRow title="Unscripted" items={reality.results} type="tv" />
    </div>
  );
}
