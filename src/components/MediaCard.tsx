import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { Movie, TVShow } from '@/types/tmdb';
import styles from './MediaCard.module.css';

interface MediaCardProps {
  item: Movie | TVShow;
  type: 'movie' | 'tv';
}

const MediaCard: React.FC<MediaCardProps> = ({ item, type }) => {
  const title = 'title' in item ? item.title : item.name;
  const date = 'release_date' in item ? item.release_date : item.first_air_date;
  const year = date ? new Date(date).getFullYear() : 'N/A';

  return (
    <Link href={`/${type}/${item.id}`} className={styles.card}>
      <div className={styles.posterWrapper}>
        {item.poster_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            className={styles.poster}
          />
        ) : (
          <div className={styles.placeholder}>
            <span>{title}</span>
          </div>
        )}
        <div className={styles.overlay}>
          <div className={styles.rating}>
            <Star size={14} fill="currentColor" />
            <span>{item.vote_average.toFixed(1)}</span>
          </div>
        </div>
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.meta}>{year} • {type === 'movie' ? 'Movie' : 'TV'}</p>
      </div>
    </Link>
  );
};

export default MediaCard;
