import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { getImageUrl } from '@/lib/media';
import { MediaItem, MediaType } from '@/types/tmdb';
import styles from './MediaCard.module.css';

interface MediaCardProps {
  item: MediaItem;
  type: MediaType;
}

const MediaCard: React.FC<MediaCardProps> = ({ item, type }) => {
  const title = item.title ?? item.name ?? 'Untitled';
  const date = item.release_date ?? item.first_air_date;
  const year = date ? new Date(date).getFullYear() : 'N/A';
  const resolvedType = item.media_type === 'movie' || item.media_type === 'tv' ? item.media_type : type;
  const href = `/content?id=${item.id}&type=${resolvedType}`;

  return (
    <Link href={href} className={styles.card}>
      <div className={styles.posterWrapper}>
        {item.poster_path ? (
          <Image src={getImageUrl(item.poster_path)} alt={title} fill sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw" className={styles.poster} />
        ) : (
          <div className={styles.placeholder}>
            <span>{title}</span>
          </div>
        )}
        <div className={styles.overlay}>
          <div className={styles.rating}>
            <Star size={14} fill="currentColor" />
            <span>{(item.vote_average ?? 0).toFixed(1)}</span>
          </div>
        </div>
      </div>
      <div className={styles.info}>
        <h3 className={`${styles.title} font-black uppercase italic tracking-tighter text-[11px] leading-tight mb-1`}>
          {title}
        </h3>
        <p className={`${styles.meta} text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500 italic`}>
          {year} • {resolvedType === 'movie' ? 'Movie' : 'TV'}
        </p>
      </div>
    </Link>
  );
};

export default MediaCard;
