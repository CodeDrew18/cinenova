export type MediaType = 'movie' | 'tv';

export type MediaKind = MediaType | 'person' | string;

export interface MediaItem {
  id: number;
  media_type?: MediaKind;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number | null;
}

export interface Movie extends MediaItem {
  media_type: 'movie';
  title: string;
  release_date: string;
}

export interface TVShow extends MediaItem {
  media_type: 'tv';
  name: string;
  first_air_date: string;
}

export type Media = Movie | TVShow;

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface VideoItem {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface VideoResponse {
  id?: number | string;
  results: VideoItem[];
}

export interface SeasonSummary {
  season_number: number;
  name: string;
  episode_count: number;
  poster_path?: string | null;
}

export interface EpisodeDetails {
  id?: number;
  episode_number: number;
  name: string;
  overview: string;
  air_date?: string;
  runtime?: number | null;
  still_path?: string | null;
}

export interface SeasonDetails extends SeasonSummary {
  id?: number;
  overview?: string;
  air_date?: string;
  episodes?: EpisodeDetails[];
}

export interface MediaDetails extends MediaItem {
  imdb_id?: string;
  runtime?: number | null;
  episode_run_time?: number[];
  genres?: Genre[];
  number_of_seasons?: number;
  seasons?: SeasonSummary[];
  recommendations?: TMDBResponse<MediaItem>;
  videos?: VideoResponse;
  homepage?: string;
  status?: string;
  tagline?: string;
}

export interface TMDBDiscoverFilters {
  with_genres?: string;
  with_original_language?: string;
  sort_by?: string;
  page?: string | number;
  'primary_release_date.gte'?: string;
  'primary_release_date.lte'?: string;
  'first_air_date.gte'?: string;
  'first_air_date.lte'?: string;
  'vote_average.gte'?: string;
  'vote_average.lte'?: string;
  [key: string]: string | number | boolean | undefined;
}
