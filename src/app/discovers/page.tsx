import { tmdbService } from '@/lib/tmdb';
import FilterSidebar from '@/components/FilterSidebar';
import MediaCard from '@/components/MediaCard';
import { MediaItem, TMDBResponse } from '@/types/tmdb';

const emptyResponse = (): TMDBResponse<MediaItem> => ({
  page: 1,
  results: [],
  total_pages: 1,
  total_results: 0,
});

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DiscoverPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedType = typeof params.type === 'string' ? params.type : undefined;

  const filters: Record<string, string> = {
    with_genres: typeof params.with_genres === 'string' ? params.with_genres : '',
    'primary_release_date.gte': typeof params.from === 'string' ? params.from : '',
    'primary_release_date.lte': typeof params.to === 'string' ? params.to : '',
    'vote_average.gte': typeof params.score === 'string' ? params.score : '',
    sort_by: typeof params.sort === 'string' ? params.sort : 'popularity.desc',
  };

  const isFiltering = Object.entries(filters).some(([key, value]) => key !== 'sort_by' && value !== '');

  let data: TMDBResponse<MediaItem> = emptyResponse();
  try {
    if (!isFiltering && (!selectedType || selectedType === 'multi')) {
      data = await tmdbService.getTrending('all');
    } else {
      const discoverType = selectedType === 'tv' ? 'tv' : 'movie';
      const cleanFilters = Object.entries(filters).reduce<Record<string, string>>((accumulator, [key, value]) => {
        if (value !== '') {
          accumulator[key] = value;
        }
        return accumulator;
      }, {});
      data = await tmdbService.discover(discoverType, cleanFilters);
    }
  } catch (error) {
    console.error('[DiscoverPage] Discovery fetch error:', error);
  }

  const items = (data.results || []).filter((item): item is MediaItem => item.media_type !== 'person');

  return (
    <div className="pt-32 px-4 md:px-12 min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-300">
      <header className="mb-12">
        <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none text-neutral-950 dark:text-white">
          EXPLORE <span className="text-red-600">CINENOVA</span>
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-[0.4em] text-xs mt-4">
          Refine your search for premium entertainment
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="lg:sticky lg:top-32 h-fit">
          <FilterSidebar />
        </aside>

        <main className="flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
            {items.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                type={item.media_type === 'tv' ? 'tv' : selectedType === 'tv' ? 'tv' : 'movie'}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
