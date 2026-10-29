export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_url: string | null;
}

export interface Movie {
  id: number;
  title: string;
  synopsis?: string;
  release_date: string | null;
  genre?: string | null;
  runtime?: string | null;
  poster_url: string | null;
  user_rating: number | null;
}

export interface MovieDetail extends Movie {
  genres: string[];
  cast: CastMember[];
}

export interface PaginatedMoviesResponse {
  results: Movie[];
  page: number;
  total_pages: number;
  total_results: number;
}