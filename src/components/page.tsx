import { tmdbService } from '@/lib/tmdb';
import FilterSidebar from '@/components/FilterSidebar';
import MediaCard from '@/components/MediaCard';

export default async function DiscoverPage() {
  // Default view: Trending movies and shows in a grid
  const data = await tmdbService.getTrending('all');

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
            {data.results.map((item: any) => (
              <MediaCard key={item.id} item={item} type={item.media_type || 'movie'} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}