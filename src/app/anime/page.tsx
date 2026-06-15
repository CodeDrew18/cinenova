import { tmdbService } from '@/lib/tmdb';
import MediaRow from '@/components/MediaRow';

export default async function AnimePage() {
  const anime = await tmdbService.getAnime();

  return (
    <div className="pt-32 pb-20 bg-neutral-950 min-h-screen">
      <div className="px-4 md:px-12 mb-10 border-l-8 border-red-600 ml-4 md:ml-12">
        <h1 className="text-6xl font-black tracking-tighter text-white uppercase italic">ANIME</h1>
        <p className="text-neutral-500 mt-2 font-bold tracking-widest uppercase text-xs pl-1">Japanese Animation Excellence</p>
      </div>
      
      <MediaRow title="Recently Added" items={anime.results} type="tv" />
      <MediaRow title="All-Time Classics" items={anime.results.slice().reverse()} type="tv" />
    </div>
  );
}