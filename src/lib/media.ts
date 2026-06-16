import type { MediaType } from '@/types/tmdb';

const TMDB_IMAGE_BASE = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL ?? 'https://image.tmdb.org/t/p/w1280';
const VIDKING_EMBED_BASE = 'https://www.vidking.net/embed';

export interface VidKingEmbedOptions {
  season?: number;
  episode?: number;
  color?: string;
  autoPlay?: boolean;
  nextEpisode?: boolean;
  episodeSelector?: boolean;
  progress?: boolean;
}

function buildQueryString(params: Record<string, string | number | boolean | undefined | null>) {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    queryParams.set(key, String(value));
  });

  return queryParams.toString();
}

export function getImageUrl(path?: string | null) {
  if (!path) {
    return '/window.svg';
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${TMDB_IMAGE_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

export function buildVidKingEmbedUrl(type: MediaType, id: string | number, options: VidKingEmbedOptions = {}) {
  const defaults: VidKingEmbedOptions =
    type === 'tv'
      ? {
          color: 'e50914',
          autoPlay: true,
          nextEpisode: true,
          episodeSelector: true,
          progress: true,
        }
      : {
          color: 'e50914',
          autoPlay: true,
          progress: true,
        };

  const resolvedOptions = { ...defaults, ...options };

  if (type === 'tv') {
    const season = resolvedOptions.season ?? 1;
    const episode = resolvedOptions.episode ?? 1;
    const queryString = buildQueryString({
      color: resolvedOptions.color,
      autoPlay: resolvedOptions.autoPlay,
      nextEpisode: resolvedOptions.nextEpisode,
      episodeSelector: resolvedOptions.episodeSelector,
      progress: resolvedOptions.progress,
    });

    return queryString
      ? `${VIDKING_EMBED_BASE}/tv/${id}/${season}/${episode}?${queryString}`
      : `${VIDKING_EMBED_BASE}/tv/${id}/${season}/${episode}`;
  }

  const queryString = buildQueryString({
    color: resolvedOptions.color,
    autoPlay: resolvedOptions.autoPlay,
    progress: resolvedOptions.progress,
  });

  return queryString ? `${VIDKING_EMBED_BASE}/movie/${id}?${queryString}` : `${VIDKING_EMBED_BASE}/movie/${id}`;
}
