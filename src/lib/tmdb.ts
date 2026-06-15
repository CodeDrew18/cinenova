import { Movie, TVShow, TMDBResponse, Genre } from '@/types/tmdb';

const API_KEY = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';

async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const queryParams = new URLSearchParams({
    api_key: API_KEY || '',
    ...params,
  });

  const response = await fetch(`${BASE_URL}${endpoint}?${queryParams}`, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`);
  }

  return response.json();
}

export const tmdbService = {
  getTrending: (type: 'all' | 'movie' | 'tv' = 'all') => 
    fetchTMDB<TMDBResponse<any>>(`/trending/${type}/day`),
  
  getMovies: (category: 'popular' | 'top_rated' | 'now_playing' = 'popular') => 
    fetchTMDB<TMDBResponse<Movie>>(`/movie/${category}`),
  
  getTVShows: (category: 'popular' | 'top_rated' | 'on_the_air' = 'popular') => 
    fetchTMDB<TMDBResponse<TVShow>>(`/tv/${category}`),

  getByGenre: (type: 'movie' | 'tv', genreId: string) =>
    fetchTMDB<TMDBResponse<any>>(`/discover/${type}`, { 
      with_genres: genreId,
      sort_by: 'popularity.desc'
    }),

  getAnime: () => 
    fetchTMDB<TMDBResponse<TVShow>>('/discover/tv', {
      with_genres: '16', // Animation
      with_original_language: 'ja',
      sort_by: 'popularity.desc'
    }),

  search: (query: string) => 
    fetchTMDB<TMDBResponse<any>>('/search/multi', { query }),

  getDetails: (type: 'movie' | 'tv', id: string) => 
    fetchTMDB<any>(`/${type}/${id}`, { append_to_response: 'videos,credits,recommendations' }),

  getGenres: (type: 'movie' | 'tv') => 
    fetchTMDB<{ genres: Genre[] }>(`/genre/${type}/list`),
};

export const getImageUrl = (path: string) => path ? `${IMAGE_BASE_URL}${path}` : '/placeholder.jpg';
