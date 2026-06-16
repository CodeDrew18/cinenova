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

export default async function TVShowsPage() {
  let popular = emptyResponse();
  let drama = emptyResponse();
  let sciFi = emptyResponse();
  let reality = emptyResponse();

  try {
    const [
      pop1, pop2, pop3,
      dr1, dr2, dr3,
      sf1, sf2, sf3,
      re1, re2, re3,
    ] = await Promise.all([
      tmdbService.getTVShows('popular', 1),
      tmdbService.getTVShows('popular', 2),
      tmdbService.getTVShows('popular', 3),

      tmdbService.getByGenre('tv', '18', 1),
      tmdbService.getByGenre('tv', '18', 2),
      tmdbService.getByGenre('tv', '18', 3),

      tmdbService.getByGenre('tv', '10765', 1),
      tmdbService.getByGenre('tv', '10765', 2),
      tmdbService.getByGenre('tv', '10765', 3),

      tmdbService.getByGenre('tv', '10764', 1),
      tmdbService.getByGenre('tv', '10764', 2),
      tmdbService.getByGenre('tv', '10764', 3),
    ]);

    popular = {
      ...pop1,
      results: mergeUnique(pop1.results, pop2.results, pop3.results),
    };

    drama = {
      ...dr1,
      results: mergeUnique(dr1.results, dr2.results, dr3.results),
    };

    sciFi = {
      ...sf1,
      results: mergeUnique(sf1.results, sf2.results, sf3.results),
    };

    reality = {
      ...re1,
      results: mergeUnique(re1.results, re2.results, re3.results),
    };

  } catch (error) {
    console.error('[TVShowsPage] Fetch error:', error);
  }

  return (
    <div className="pt-32 pb-20 bg-white dark:bg-neutral-950 min-h-screen transition-colors duration-300">
      <div className="px-4 md:px-12 mb-12 border-l-[10px] border-red-600 ml-4 md:ml-12">
        <h1 className="text-7xl font-black tracking-tighter text-neutral-950 dark:text-white uppercase italic leading-none">
          TV <span className="text-red-600">SHOWS</span>
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-3 font-bold tracking-[0.4em] uppercase text-xs">
          Premium Global Series
        </p>
      </div>

      <MediaRow title="Trending Series" items={popular.results} type="tv" />
      <MediaRow title="Gripping Dramas" items={drama.results} type="tv" />
      <MediaRow title="Other Worlds" items={sciFi.results} type="tv" />
      <MediaRow title="Unscripted" items={reality.results} type="tv" />
    </div>
  );
}