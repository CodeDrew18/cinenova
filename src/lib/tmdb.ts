import {
  EpisodeDetails,
  MediaDetails,
  MediaItem,
  MediaType,
  SeasonDetails,
  TMDBDiscoverFilters,
  TMDBResponse,
  TVShow,
  VideoResponse,
  Movie,
} from '@/types/tmdb';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;

type QueryValue = string | number | boolean | null | undefined;

function buildQueryString(params: Record<string, QueryValue> = {}) {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    queryParams.set(key, String(value));
  });
  return queryParams.toString();
}

async function fetchTMDB<T>(endpoint: string, params: Record<string, QueryValue> = {}): Promise<T> {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY is not set.');
  }

  const queryString = buildQueryString({
    api_key: TMDB_API_KEY,
    language: 'en-US',
    ...params,
  });

  const url = queryString ? `${TMDB_BASE_URL}${endpoint}?${queryString}` : `${TMDB_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    next: { revalidate: 1800 },
  });

  const responseText = await response.text();

  if (!response.ok) {
    console.error(`[fetchTMDB] API error for ${endpoint}: Status ${response.status}, Response: ${responseText}`);
    throw new Error(`TMDB API error for ${endpoint}: ${response.statusText} - ${responseText.substring(0, 200)}...`);
  }

  try {
    return JSON.parse(responseText) as T;
  } catch (jsonError) {
    console.error(`[fetchTMDB] JSON parsing error for ${endpoint}:`, jsonError);
    console.error(`[fetchTMDB] Raw response text (failed to parse as JSON): ${responseText.substring(0, 500)}...`);
    throw new Error(`TMDB API: Invalid JSON response for ${endpoint}. Raw response starts with: ${responseText.substring(0, 100)}...`);
  }
}

// export const tmdbService = {
//   getTrending: (type: 'all' | MediaType = 'all') =>
//     fetchTMDB<TMDBResponse<MediaItem>>(`/trending/${type === 'all' ? 'all' : type}/day`),

//   getMovies: (category: 'popular' | 'top_rated' | 'now_playing' = 'popular') =>
//     fetchTMDB<TMDBResponse<Movie>>(`/movie/${category}`),

//   getTVShows: (category: 'popular' | 'top_rated' | 'on_the_air' = 'popular') =>
//     fetchTMDB<TMDBResponse<TVShow>>(`/tv/${category}`),

//   getAnime: () =>
//     fetchTMDB<TMDBResponse<TVShow>>('/discover/tv', {
//       with_genres: '16',
//       with_original_language: 'ja',
//       sort_by: 'popularity.desc',
//     }),

//   search: (query: string) =>
//     fetchTMDB<TMDBResponse<MediaItem>>('/search/multi', { query }),

//   discover: (type: MediaType, filters: TMDBDiscoverFilters = {}) =>
//     fetchTMDB<TMDBResponse<MediaItem>>(`/discover/${type}`, filters),

//   getByGenre: (type: MediaType, genreId: string) =>
//     fetchTMDB<TMDBResponse<MediaItem>>(`/discover/${type}`, {
//       with_genres: genreId,
//       sort_by: 'popularity.desc',
//     }),

//   getDetails: (type: MediaType, id: string) =>
//     fetchTMDB<MediaDetails>(`/${type}/${id}`, {
//       append_to_response: 'videos,recommendations',
//     }),

//   getVideos: (id: number, type: MediaType) =>
//     fetchTMDB<VideoResponse>(`/${type}/${id}/videos`),

//   getSeasonDetails: (id: string, season: number) =>
//     fetchTMDB<SeasonDetails>(`/tv/${id}/season/${season}`),

//   getEpisodeDetails: (id: string, season: number, episode: number) =>
//     fetchTMDB<EpisodeDetails>(`/tv/${id}/season/${season}/episode/${episode}`),
// };


export const tmdbService = {
  getTrending: (
    type: 'all' | MediaType = 'all',
    page = 1
  ) =>
    fetchTMDB<TMDBResponse<MediaItem>>(
      `/trending/${type === 'all' ? 'all' : type}/day`,
      { page }
    ),

  getMovies: (
    category: 'popular' | 'top_rated' | 'now_playing' = 'popular',
    page = 1
  ) =>
    fetchTMDB<TMDBResponse<Movie>>(
      `/movie/${category}`,
      { page }
    ),

  getTVShows: (
    category: 'popular' | 'top_rated' | 'on_the_air' = 'popular',
    page = 1
  ) =>
    fetchTMDB<TMDBResponse<TVShow>>(
      `/tv/${category}`,
      { page }
    ),

  getAnime: (page = 1) =>
    fetchTMDB<TMDBResponse<TVShow>>('/discover/tv', {
      with_genres: '16',
      with_original_language: 'ja',
      sort_by: 'popularity.desc',
      page,
    }),

  search: (query: string, page = 1) =>
    fetchTMDB<TMDBResponse<MediaItem>>('/search/multi', {
      query,
      page,
    }),

  discover: (
    type: MediaType,
    filters: TMDBDiscoverFilters = {},
    page = 1
  ) =>
    fetchTMDB<TMDBResponse<MediaItem>>(
      `/discover/${type}`,
      {
        ...filters,
        page,
      }
    ),

  getByGenre: (
    type: MediaType,
    genreId: string,
    page = 1
  ) =>
    fetchTMDB<TMDBResponse<MediaItem>>(
      `/discover/${type}`,
      {
        with_genres: genreId,
        sort_by: 'popularity.desc',
        page,
      }
    ),

  getDetails: (type: MediaType, id: string) =>
    fetchTMDB<MediaDetails>(`/${type}/${id}`, {
      append_to_response: 'videos,recommendations',
    }),

  getVideos: (id: number, type: MediaType) =>
    fetchTMDB<VideoResponse>(`/${type}/${id}/videos`),

  getSeasonDetails: (id: string, season: number) =>
    fetchTMDB<SeasonDetails>(`/tv/${id}/season/${season}`),

  getEpisodeDetails: (
    id: string,
    season: number,
    episode: number
  ) =>
    fetchTMDB<EpisodeDetails>(
      `/tv/${id}/season/${season}/episode/${episode}`
    ),
};