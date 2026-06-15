import { tmdbService, getImageUrl } from '@/lib/tmdb';
import Image from 'next/image';
import { Star, Clock, Calendar, Play, Plus, Info } from 'lucide-react';
import MediaRow from '@/components/MediaRow';

interface DetailPageProps {
  params: Promise<{ type: 'movie' | 'tv'; id: string }>;
}

export default async function DetailPage({ params }: DetailPageProps) {
  const { type, id } = await params;
  const data = await tmdbService.getDetails(type, id);
  
  const trailer = data.videos?.results?.find(
    (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
  );

  const title = data.title || data.name;
  const releaseDate = data.release_date || data.first_air_date;
  const runtime = data.runtime || (data.episode_run_time ? data.episode_run_time[0] : null);

  return (
    <div className="min-h-screen bg-neutral-950 text-white pb-20">
      {/* Hero Header */}
      <div className="relative h-[80vh] w-full overflow-hidden">
        <Image
          src={getImageUrl(data.backdrop_path)}
          alt={title}
          fill
          className="object-cover opacity-20 grayscale-[40%]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-transparent to-transparent" />

        <div className="absolute bottom-16 left-4 md:left-16 max-w-5xl z-10 space-y-8">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 bg-red-600 px-4 py-1.5 rounded-sm text-sm font-black italic tracking-tighter shadow-lg shadow-red-600/40">
              <Star size={18} fill="white" /> {data.vote_average.toFixed(1)}
            </div>
            {releaseDate && (
              <div className="flex items-center gap-2 text-neutral-400 font-bold text-sm uppercase tracking-widest">
                <Calendar size={18} /> {new Date(releaseDate).getFullYear()}
              </div>
            )}
            {runtime && (
              <div className="flex items-center gap-2 text-neutral-400 font-bold text-sm uppercase tracking-widest">
                <Clock size={18} /> {runtime} MIN
              </div>
            )}
            <div className="flex gap-3">
              {data.genres?.slice(0, 3).map((genre: any) => (
                <span key={genre.id} className="text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 bg-white/5 px-3 py-1 rounded-full text-neutral-400">
                  {genre.name}
                </span>
              ))}
            </div>
          </div>

          <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.85] text-white drop-shadow-2xl">
            {title}
          </h1>
          
          <p className="text-neutral-400 text-lg md:text-xl font-medium max-w-3xl leading-relaxed line-clamp-3">
            {data.overview}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-6">
            <a 
              href={`https://vidsrc.to/embed/${type}/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-black px-12 py-5 rounded-full font-black uppercase tracking-widest text-xs hover:bg-red-600 hover:text-white transition-all transform hover:scale-105 flex items-center gap-3 shadow-2xl"
            >
              <Play size={20} fill="currentColor" /> Play Full Movie
            </a>
            <button className="bg-neutral-900/80 backdrop-blur-md text-white px-10 py-5 rounded-full font-black uppercase tracking-widest text-xs border border-white/10 hover:bg-neutral-800 transition-all flex items-center gap-3">
              <Plus size={20} /> My List
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-16 mt-20 grid grid-cols-1 lg:grid-cols-3 gap-20">
        <div className="lg:col-span-2 space-y-10">
          <h2 className="text-3xl font-black uppercase tracking-[0.3em] italic border-l-[10px] border-red-600 pl-6 leading-none">
            The <span className="text-red-600">Preview</span>
          </h2>
          <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-neutral-900 ring-1 ring-white/10">
            {trailer ? (
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=0&rel=0&modestbranding=1`}
                className="w-full h-full"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600 gap-4">
                <Info size={64} />
                <p className="font-black tracking-[0.4em] uppercase text-sm italic">Video Unavailable</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-10">
           <h2 className="text-3xl font-black uppercase tracking-[0.3em] italic border-l-[10px] border-red-600 pl-6 leading-none text-white">
            Top <span className="text-red-600">Cast</span>
          </h2>
          <div className="grid grid-cols-2 gap-6">
            {data.credits?.cast?.slice(0, 4).map((person: any) => (
              <div key={person.id} className="group cursor-pointer">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-900 border border-white/5 mb-3">
                  <Image
                    src={getImageUrl(person.profile_path)}
                    alt={person.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0"
                  />
                </div>
                <p className="text-xs font-black uppercase italic text-white truncate">{person.name}</p>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-tighter truncate">{person.character}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-32">
        <MediaRow title="Recommended for you" items={data.recommendations?.results || []} type={type} />
      </div>
    </div>
  );
}