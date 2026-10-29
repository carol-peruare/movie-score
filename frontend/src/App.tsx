import { useEffect, useState } from 'react';
import { fetchMovies, getRatedMovies } from './api';
import { MovieModal } from './MovieModal';
import type { Movie } from './types';

const GENRE_OPTIONS = [
  { id: '', label: 'Todos os gêneros' },
  { id: '28', label: 'Ação' },
  { id: '12', label: 'Aventura' },
  { id: '16', label: 'Animação' },
  { id: '35', label: 'Comédia' },
  { id: '80', label: 'Crime' },
  { id: '99', label: 'Documentário' },
  { id: '18', label: 'Drama' },
  { id: '10751', label: 'Família' },
  { id: '14', label: 'Fantasia' },
  { id: '37', label: 'Faroeste' },
  { id: '878', label: 'Ficção científica' },
  { id: '10752', label: 'Guerra' },
  { id: '36', label: 'História' },
  { id: '9648', label: 'Mistério' },
  { id: '10402', label: 'Música' },
  { id: '10749', label: 'Romance' },
  { id: '53', label: 'Suspense' },
  { id: '27', label: 'Terror' },
];

// Gera automaticamente a lista de anos de 2026 até 1970 sem precisarmos digitar um por um!
const YEAR_OPTIONS = Array.from({ length: 57 }, (_, index) =>
  String(2026 - index)
);

export function App() {
  const [activeTab, setActiveTab] = useState<'discover' | 'rated'>('discover');

  // Estados da busca, filtro de gênero, filtro de ano e paginação
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);

  const [movies, setMovies] = useState<Movie[]>([]);
  const [ratedMovies, setRatedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  // Função acionada ao clicar na logo CineScore: volta para a tela inicial limpa
  const handleResetHome = () => {
    setActiveTab('discover');
    setSearchQuery('');
    setSelectedGenre('');
    setSelectedYear('');
    setPage(1);
    setSelectedMovieId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadRatedMovies = async () => {
    try {
      const data = await getRatedMovies();
      setRatedMovies(data);
    } catch (err) {
      console.error('Erro ao buscar avaliações:', err);
    }
  };

  useEffect(() => {
    loadRatedMovies();
  }, []);

  // Busca filmes sempre que mudar a busca, a página, o gênero OU o ano
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);

      fetchMovies(searchQuery, page, selectedGenre, selectedYear)
        .then((data) => {
          if (!active) return;
          setMovies(data.results);
          setTotalPages(data.total_pages);
          setTotalResults(data.total_results);
        })
        .catch((err) => {
          if (!active) return;
          setError(
            err instanceof Error ? err.message : 'Erro ao buscar filmes no servidor.'
          );
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery, page, selectedGenre, selectedYear]);

  const handleRatingChanged = () => {
    loadRatedMovies();
    fetchMovies(searchQuery, page, selectedGenre, selectedYear)
      .then((data) => setMovies(data.results))
      .catch(() => {});
  };

  const getYear = (dateStr: string | null) =>
    dateStr ? dateStr.slice(0, 4) : '—';

  return (
    <div className="app-wrapper">
      {/* Barra de Navegação Superior */}
      <header className="navbar">
        <div className="container navbar-content">
          <div
            className="brand"
            onClick={handleResetHome}
            title="Voltar para a página inicial"
          >
            <div className="brand-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                <line x1="7" y1="2" x2="7" y2="22" />
                <line x1="17" y1="2" x2="17" y2="22" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <line x1="2" y1="7" x2="7" y2="7" />
                <line x1="2" y1="17" x2="7" y2="17" />
                <line x1="17" y1="17" x2="22" y2="17" />
                <line x1="17" y1="7" x2="22" y2="7" />
              </svg>
            </div>
            <span>
              Cine<span className="brand-highlight">Score</span>
            </span>
          </div>

          <nav className="nav-links">
            <button
              type="button"
              className={`nav-btn ${activeTab === 'discover' ? 'active' : ''}`}
              onClick={() => setActiveTab('discover')}
            >
              Descobrir
            </button>

            <button
              type="button"
              className={`nav-btn ${activeTab === 'rated' ? 'active' : ''}`}
              onClick={() => setActiveTab('rated')}
            >
              Minhas avaliações
              <span className="badge-count">{ratedMovies.length}</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container" style={{ paddingBottom: '60px' }}>
        {activeTab === 'discover' ? (
          <>
            <div className="page-header">
              <div>
                <h1 className="page-title">
                  {searchQuery.trim() ? 'Resultados da busca' : 'Filmes em alta'}
                </h1>
                <p className="page-subtitle">{totalResults} títulos</p>
              </div>

              <div className="filters-bar">
                <div className="search-box">
                  <span className="search-icon" style={{ display: 'flex' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Buscar filmes"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>

                <select
                  className="genre-select"
                  value={selectedGenre}
                  onChange={(e) => {
                    setSelectedGenre(e.target.value);
                    setPage(1);
                  }}
                >
                  {GENRE_OPTIONS.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.label}
                    </option>
                  ))}
                </select>

                <select
                  className="genre-select"
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Todos os anos</option>
                  {YEAR_OPTIONS.map((yearStr) => (
                    <option key={yearStr} value={yearStr}>
                      {yearStr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {loading ? (
              <div className="status-box">Carregando filmes...</div>
            ) : movies.length === 0 ? (
              <div className="status-box">
                Nenhum filme encontrado para estes filtros.
              </div>
            ) : (
              <>
                <div className="movies-grid">
                  {movies.map((movie) => (
                    <div
                      key={movie.id}
                      className="movie-card"
                      onClick={() => setSelectedMovieId(movie.id)}
                    >
                      <div className="poster-wrapper">
                        {movie.poster_url ? (
                          <img
                            src={movie.poster_url}
                            alt={movie.title}
                            className="poster-img"
                            loading="lazy"
                          />
                        ) : (
                          <div className="poster-placeholder">{movie.title}</div>
                        )}
                      </div>
                      <h3 className="movie-card-title" title={movie.title}>
                        {movie.title}
                      </h3>
                      <p className="movie-card-meta">
                        {getYear(movie.release_date)} • {movie.genre || 'Filme'}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Paginação */}
                <div className="pagination-bar">
                  <span>
                    Página {page} de {totalPages}
                  </span>

                  <div className="pagination-controls">
                    <button
                      type="button"
                      className="page-btn"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      ←
                    </button>

                    <button
                      type="button"
                      className={`page-btn ${page === 1 ? 'active' : ''}`}
                      onClick={() => setPage(1)}
                    >
                      1
                    </button>

                    {totalPages >= 2 && (
                      <button
                        type="button"
                        className={`page-btn ${page === 2 ? 'active' : ''}`}
                        onClick={() => setPage(2)}
                      >
                        2
                      </button>
                    )}

                    {page > 2 && (
                      <button type="button" className="page-btn active">
                        {page}
                      </button>
                    )}

                    <button
                      type="button"
                      className="page-btn"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      →
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          /* Aba Minhas Avaliações */
          <>
            <div className="page-header">
              <h1 className="page-title">Minhas avaliações</h1>

              <div className="rated-counter-box">
                <span className="rated-counter-number">
                  {ratedMovies.length}
                </span>
                <span>filmes avaliados</span>
              </div>
            </div>

            {ratedMovies.length === 0 ? (
              <div className="status-box">
                Você ainda não avaliou nenhum filme. Clique em um título na aba
                "Descobrir" para dar sua nota!
              </div>
            ) : (
              <div className="rated-grid">
                {ratedMovies.map((movie) => {
                  const score = movie.user_rating || 0;
                  return (
                    <div
                      key={movie.id}
                      className="rated-card"
                      onClick={() => setSelectedMovieId(movie.id)}
                    >
                      {movie.poster_url ? (
                        <img
                          src={movie.poster_url}
                          alt={movie.title}
                          className="rated-poster"
                        />
                      ) : (
                        <div className="rated-poster poster-placeholder">
                          Sem capa
                        </div>
                      )}

                      <div className="rated-info">
                        <div className="rated-genre">
                          {movie.genre || 'FILME'}
                        </div>
                        <h3 className="rated-title">{movie.title}</h3>
                        <p className="rated-meta">
                          {getYear(movie.release_date)}
                          {movie.runtime ? ` • ${movie.runtime}` : ''}
                        </p>

                        <div className="rated-stars-row">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`star-char ${
                                star <= score ? '' : 'empty'
                              }`}
                            >
                              {star <= score ? '★' : '☆'}
                            </span>
                          ))}
                          <span className="rated-score-num">
                            {score.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      <div className="rated-chevron">›</div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Rodapé */}
      <footer className="footer">
        <div className="container footer-content">
          <div
            className="brand"
            style={{ fontSize: '1rem' }}
            onClick={handleResetHome}
            title="Voltar para a página inicial"
          >
            <div
              className="brand-icon"
              style={{ width: '26px', height: '26px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                <line x1="7" y1="2" x2="7" y2="22" />
                <line x1="17" y1="2" x2="17" y2="22" />
                <line x1="2" y1="12" x2="22" y2="12" />
              </svg>
            </div>
            <span>
              Cine<span className="brand-highlight">Score</span>
            </span>
          </div>
          <span>CineScore</span>
        </div>
      </footer>

      {selectedMovieId !== null && (
        <MovieModal
          movieId={selectedMovieId}
          onClose={() => setSelectedMovieId(null)}
          onRatingChanged={handleRatingChanged}
        />
      )}
    </div>
  );
}

export default App;