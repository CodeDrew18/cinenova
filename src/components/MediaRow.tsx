import Image from 'next/image';
import { getImageUrl } from '@/lib/tmdb';

interface MediaRowProps {
  title: string;
  items: any[];
}

export default function MediaRow({ title, items }: MediaRowProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-neutral-200 uppercase tracking-widest px-4 md:px-12 border-l-4 border-red-600 ml-4 md:ml-0 pl-3">
        {title}
      </h2>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 px-4 md:px-12">
        {items.map((item) => (
          <div key={item.id} className="min-w-[160px] md:min-w-[240px] relative aspect-[2/3] rounded-xl overflow-hidden group bg-neutral-900 shadow-2xl transition-all duration-300 hover:ring-2 hover:ring-red-600/50">
            <Image 
              src={getImageUrl(item.poster_path)}
              alt={item.title || item.name || 'Media Poster'}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <span className="text-sm font-bold text-white line-clamp-2 leading-tight">{item.title || item.name}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}