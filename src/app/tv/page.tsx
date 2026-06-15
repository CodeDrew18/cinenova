import { tmdbService } from '@/lib/tmdb';
import MediaRow from '@/components/MediaRow';

export default async function TVShowsPage() {
  const [popular, drama, sciFi, reality] = await Promise.all([
    tmdbService.getTVShows('popular'),
    tmdbService.getByGenre('tv', '18'),    // Drama
    tmdbService.getByGenre('tv', '10765'), // Sci-Fi & Fantasy
    tmdbService.getByGenre('tv', '10764'), // Reality
  ]);

  return (
    <div className="pt-32 pb-20 bg-neutral-950 min-h-screen">
      <div className="px-4 md:px-12 mb-10 border-l-8 border-red-600 ml-4 md:ml-12">
        <h1 className="text-6xl font-black tracking-tighter text-white uppercase italic">TV <span className="text-red-600">SHOWS</span></h1>
      </div>
      
      <MediaRow title="Trending Series" items={popular.results} />
      <MediaRow title="Gripping Dramas" items={drama.results} />
      <MediaRow title="Other Worlds" items={sciFi.results} />
      <MediaRow title="Unscripted" items={reality.results} />
    </div>
  );
}