import { tmdbService } from '@/lib/tmdb';
import MediaCard from '@/components/MediaCard';
import { MediaItem } from '@/types/tmdb';

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SearchResultsPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const queryParam = Array.isArray(params.q) ? params.q[0] : params.q;
  const q = (queryParam || '').trim();

  let results: MediaItem[] = [];
  try {
    if (q) {
      const data = await tmdbService.search(q);
      results = (data?.results || []).filter((result): result is MediaItem => {
        return result.media_type === 'movie' || result.media_type === 'tv';
      });
    }
  } catch (error) {
    console.error('[SearchResults] TMDB search error:', error);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-black mb-6">Search Results</h1>

        <form method="get" action="/search_results" className="flex gap-2 mb-8">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search movies, TV shows, anime..."
            className="flex-1 px-4 py-3 border rounded-md bg-white/50 dark:bg-neutral-900"
          />
          <button type="submit" className="bg-red-600 text-white px-4 py-3 rounded-md font-bold">
            Search
          </button>
        </form>

        {!q ? (
          <p className="text-neutral-500">Enter a search term to find movies and TV shows.</p>
        ) : results.length === 0 ? (
          <p className="text-neutral-500">No results for &quot;{q}&quot;.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {results.map((item) => (
              <MediaCard
                key={`${item.media_type}-${item.id}`}
                item={item}
                type={item.media_type === 'tv' ? 'tv' : 'movie'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
