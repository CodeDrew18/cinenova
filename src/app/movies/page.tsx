import { tmdbService } from '@/lib/tmdb';
import MediaRow from '@/components/MediaRow';
import { MediaItem, TMDBResponse } from '@/types/tmdb';

const emptyResponse = (): TMDBResponse<MediaItem> => ({
  page: 1,
  results: [],
  total_pages: 1,
  total_results: 0,
});

export default async function MoviesPage() {
  const [popular, action, comedy, horror] = await Promise.all([
    tmdbService.getMovies('popular').catch((error: unknown) => {
      console.error('[MoviesPage] Popular fetch error:', error);
      return emptyResponse();
    }),
    tmdbService.getByGenre('movie', '28').catch((error: unknown) => {
      console.error('[MoviesPage] Action fetch error:', error);
      return emptyResponse();
    }),
    tmdbService.getByGenre('movie', '35').catch((error: unknown) => {
      console.error('[MoviesPage] Comedy fetch error:', error);
      return emptyResponse();
    }),
    tmdbService.getByGenre('movie', '27').catch((error: unknown) => {
      console.error('[MoviesPage] Horror fetch error:', error);
      return emptyResponse();
    }),
  ]);

  return (
    <div className="pt-32 pb-20 bg-white dark:bg-neutral-950 min-h-screen transition-colors duration-300">
      <div className="px-4 md:px-12 mb-10 border-l-8 border-red-600 ml-4 md:ml-12">
        <h1 className="text-6xl font-black tracking-tighter text-neutral-950 dark:text-white uppercase italic">MOVIES</h1>
      </div>

      <MediaRow title="Popular Now" items={popular.results} type="movie" />
      <MediaRow title="Adrenaline Rush" items={action.results} type="movie" />
      <MediaRow title="Laugh Out Loud" items={comedy.results} type="movie" />
      <MediaRow title="Midnight Screams" items={horror.results} type="movie" />
    </div>
  );
}
