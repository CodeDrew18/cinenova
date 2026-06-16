import { tmdbService } from '@/lib/tmdb';
import MediaRow from '@/components/MediaRow';
import { MediaItem, TMDBResponse } from '@/types/tmdb';

const emptyResponse = (): TMDBResponse<MediaItem> => ({
  page: 1,
  results: [],
  total_pages: 1,
  total_results: 0,
});

function mergeUnique(...lists: MediaItem[][]) {
  const merged = lists.flat();

  return Array.from(
    new Map(merged.map((item) => [item.id, item])).values()
  );
}

export default async function MoviesPage() {
  let popular = emptyResponse();
  let action = emptyResponse();
  let comedy = emptyResponse();
  let horror = emptyResponse();

  try {
    const [
      pop1, pop2, pop3,
      act1, act2, act3,
      com1, com2, com3,
      hor1, hor2, hor3,
    ] = await Promise.all([
      tmdbService.getMovies('popular', 1),
      tmdbService.getMovies('popular', 2),
      tmdbService.getMovies('popular', 3),

      tmdbService.getByGenre('movie', '28', 1),
      tmdbService.getByGenre('movie', '28', 2),
      tmdbService.getByGenre('movie', '28', 3),

      tmdbService.getByGenre('movie', '35', 1),
      tmdbService.getByGenre('movie', '35', 2),
      tmdbService.getByGenre('movie', '35', 3),

      tmdbService.getByGenre('movie', '27', 1),
      tmdbService.getByGenre('movie', '27', 2),
      tmdbService.getByGenre('movie', '27', 3),
    ]);

    popular = { ...pop1, results: mergeUnique(pop1.results, pop2.results, pop3.results) };
    action  = { ...act1, results: mergeUnique(act1.results, act2.results, act3.results) };
    comedy  = { ...com1, results: mergeUnique(com1.results, com2.results, com3.results) };
    horror  = { ...hor1, results: mergeUnique(hor1.results, hor2.results, hor3.results) };

  } catch (error) {
    console.error('[MoviesPage] Fetch error:', error);
  }

  return (
    <div className="pt-32 pb-20 bg-white dark:bg-neutral-950 min-h-screen transition-colors duration-300">
      <div className="px-4 md:px-12 mb-10 border-l-8 border-red-600 ml-4 md:ml-12">
        <h1 className="text-6xl font-black tracking-tighter text-neutral-950 dark:text-white uppercase italic">
          MOVIES
        </h1>
      </div>

      <MediaRow title="Popular Now" items={popular.results} type="movie" />
      <MediaRow title="Adrenaline Rush" items={action.results} type="movie" />
      <MediaRow title="Laugh Out Loud" items={comedy.results} type="movie" />
      <MediaRow title="Midnight Screams" items={horror.results} type="movie" />
    </div>
  );
}