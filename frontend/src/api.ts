import type { Movie, MovieDetail, PaginatedMoviesResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export async function fetchMovies(
  query: string = '',
  page: number = 1,
  genre: string = '',
  year: string = ''
): Promise<PaginatedMoviesResponse> {
  const params = new URLSearchParams();
  if (query.trim()) params.append('query', query.trim());
  if (page > 1) params.append('page', String(page));
  if (genre) params.append('genre', genre);
  if (year) params.append('year', year);

  const response = await fetch(`${API_BASE_URL}/search/?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Erro ao buscar filmes.');
  }
  return response.json();
}

export async function getMovieDetail(tmdbId: number): Promise<MovieDetail> {
const response = await fetch(`${API_BASE_URL}/movies/${tmdbId}/`, { cache: 'no-store' });  if (!response.ok) {
    throw new Error('Erro ao carregar os detalhes do filme.');
  }
  return response.json();
}

export async function getRatedMovies(): Promise<Movie[]> {
const response = await fetch(`${API_BASE_URL}/ratings/`, { cache: 'no-store' });  if (!response.ok) {
    throw new Error('Erro ao carregar os filmes avaliados.');
  }
  const data = await response.json();
  return data.results;
}

export async function saveMovieRating(movie: Movie, score: number): Promise<Movie> {
  const response = await fetch(`${API_BASE_URL}/ratings/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tmdb_id: movie.id,
      title: movie.title,
      poster_url: movie.poster_url,
      release_date: movie.release_date,
      genre: movie.genre,
      runtime: movie.runtime,
      score: score,
    }),
  });
  if (!response.ok) {
    throw new Error('Erro ao salvar a avaliação.');
  }
  const data = await response.json();
  return data.movie;
}

export async function updateMovieRating(tmdbId: number, score: number): Promise<Movie> {
  const response = await fetch(`${API_BASE_URL}/ratings/${tmdbId}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ score }),
  });
  if (!response.ok) {
    throw new Error('Erro ao atualizar a nota.');
  }
  const data = await response.json();
  return data.movie;
}

export async function deleteMovieRating(tmdbId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/ratings/${tmdbId}/`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Erro ao remover a avaliação.');
  }
}