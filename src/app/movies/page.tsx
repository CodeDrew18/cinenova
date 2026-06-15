import { tmdbService } from '@/lib/tmdb';
import MediaRow from '@/components/MediaRow';

export default async function MoviesPage() {
  const [popular, action, comedy, horror] = await Promise.all([
    tmdbService.getMovies('popular'),
    tmdbService.getByGenre('movie', '28'), // Action
    tmdbService.getByGenre('movie', '35'), // Comedy
    tmdbService.getByGenre('movie', '27'), // Horror
  ]);

  return (
    <div className="pt-32 pb-20 bg-neutral-950 min-h-screen">
      <div className="px-4 md:px-12 mb-10 border-l-8 border-red-600 ml-4 md:ml-12">
        <h1 className="text-6xl font-black tracking-tighter text-white uppercase italic">MOVIES</h1>
      </div>
      
      <MediaRow title="Popular Now" items={popular.results} type="movie" />
      <MediaRow title="Adrenaline Rush" items={action.results} type="movie" />
      <MediaRow title="Laugh Out Loud" items={comedy.results} type="movie" />
      <MediaRow title="Midnight Screams" items={horror.results} type="movie" />
    </div>
  );
}