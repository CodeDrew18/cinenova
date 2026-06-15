import { tmdbService } from '@/lib/tmdb';
import FilterSidebar from '@/components/FilterSidebar';
import MediaCard from '@/components/MediaCard';

// Next.js 16 requires searchParams to be handled as a Promise
interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DiscoverPage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  // Get the selected type from params
  const selectedType = params.type as string | undefined;
  
  // Map URL parameters to TMDB Discover API arguments
  const filters: Record<string, string> = {
    with_genres: (params.with_genres as string) || '',
    'primary_release_date.gte': (params.from as string) || '',
    'primary_release_date.lte': (params.to as string) || '',
    'vote_average.gte': (params.score as string) || '',
    sort_by: (params.sort as string) || 'popularity.desc',
  };

  // Check if any filters are actually applied (besides the default sort)
  const isFiltering = Object.entries(filters).some(([key, val]) => key !== 'sort_by' && val !== '');

  let data;
  if (!isFiltering && (!selectedType || selectedType === 'multi')) {
    // Show trending if no filters are applied and type is 'multi' or not set
    data = await tmdbService.getTrending('all');
  } else {
    // Determine discover type: default to 'movie' if 'multi' or not set when filtering
    const discoverType = selectedType === 'tv' ? 'tv' : 'movie';
    
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '')
    );
    data = await tmdbService.discover(discoverType, cleanFilters);
  }

  return (
    <div className="pt-32 px-4 md:px-12 min-h-screen bg-neutral-950">
      <header className="mb-12">
        <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
          EXPLORE <span className="text-red-600">CINENOVA</span>
        </h1>
        <p className="text-neutral-500 font-bold uppercase tracking-[0.4em] text-xs mt-4">
          Refine your search for premium entertainment
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="lg:sticky lg:top-32 h-fit">
          <FilterSidebar />
        </aside>
        
        <main className="flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
            {data.results?.map((item: any) => (
              <MediaCard key={item.id} item={item} type={(item.media_type as 'movie' | 'tv') || (selectedType === 'tv' ? 'tv' : 'movie')} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}