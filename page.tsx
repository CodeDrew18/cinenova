import { tmdbService } from '@/lib/tmdb';
import MediaRow from '@/components/MediaRow';

interface SearchPageProps {
  searchParams: Promise<{ q?: string; type?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, type } = await searchParams;
  
  if (!q) {
    return (
      <div className="pt-32 px-12 text-center">
        <h1 className="text-4xl font-black uppercase italic">No query provided</h1>
      </div>
    );
  }

  // We use search multi or specific based on type
  const results = await tmdbService.search(q);
  
  // Filter results if a specific type (movie/tv) was selected
  const filteredResults = type && type !== 'multi' 
    ? results.results.filter((item: any) => item.media_type === type)
    : results.results;

  return (
    <div className="pt-32 pb-20 bg-neutral-950 min-h-screen">
      <div className="px-4 md:px-12 mb-10 border-l-8 border-red-600 ml-4 md:ml-12">
        <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">RESULTS FOR: {q}</h1>
      </div>
      <MediaRow title={`Top Matches (${type || 'All'})`} items={filteredResults} />
    </div>
  );
}