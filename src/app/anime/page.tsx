import { tmdbService } from '@/lib/tmdb';
import MediaRow from '@/components/MediaRow';
import { MediaItem, TMDBResponse } from '@/types/tmdb';

const emptyResponse = (): TMDBResponse<MediaItem> => ({
  page: 1,
  results: [],
  total_pages: 1,
  total_results: 0,
});

export default async function AnimePage() {
  let anime = emptyResponse();

  try {
    anime = await tmdbService.getAnime();
  } catch (error) {
    console.error('[AnimePage] Anime fetch error:', error);
  }

  return (
    <div className="pt-32 pb-20 bg-white dark:bg-neutral-950 min-h-screen transition-colors duration-300">
      <div className="px-4 md:px-12 mb-10 border-l-8 border-red-600 ml-4 md:ml-12">
        <h1 className="text-6xl font-black tracking-tighter text-neutral-950 dark:text-white uppercase italic">ANIME</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2 font-bold tracking-widest uppercase text-xs pl-1">Japanese Animation Excellence</p>
      </div>

      <MediaRow title="Recently Added" items={anime.results} type="tv" />
      <MediaRow title="All-Time Classics" items={anime.results.slice().reverse()} type="tv" />
    </div>
  );
}
