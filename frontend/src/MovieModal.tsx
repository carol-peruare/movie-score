import { useEffect, useState } from 'react';
import {
  deleteMovieRating,
  getMovieDetail,
  saveMovieRating,
  updateMovieRating,
} from './api';
import type { Movie, MovieDetail } from './types';

interface MovieModalProps {
  movieId: number;
  onClose: () => void;
  onRatingChanged: () => void;
}

export function MovieModal({ movieId, onClose, onRatingChanged }: MovieModalProps) {
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para controlar as estrelas de 1 a 5 e o modo de edição (lápis)
  const [selectedScore, setSelectedScore] = useState<number>(0);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    getMovieDetail(movieId)
      .then((data) => {
        if (!active) return;
        setMovie(data);
        if (data.user_rating) {
          setSelectedScore(data.user_rating);
          setIsEditing(false); // Já tem nota: mostra o lápis e a lixeira 
        } else {
          setSelectedScore(0);
          setIsEditing(true); // Não tem nota: libera as estrelas para avaliar
        }
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Erro ao carregar detalhes.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [movieId]);

  const handleConclude = async () => {
    if (!movie) return;

    // Se o usuário selecionou uma nota e estava criando/editando, salva no Backend
    if (isEditing && selectedScore >= 1 && selectedScore <= 5) {
      try {
        setSaving(true);
        setError(null);
        const moviePayload: Movie = {
          id: movie.id,
          title: movie.title,
          poster_url: movie.poster_url,
          release_date: movie.release_date,
          genre: movie.genre,
          runtime: movie.runtime,
          user_rating: selectedScore,
        };

        if (movie.user_rating) {
          await updateMovieRating(movie.id, selectedScore);
        } else {
          await saveMovieRating(moviePayload, selectedScore);
        }
        onRatingChanged();
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar avaliação.');
      } finally {
        setSaving(false);
      }
    } else {
      // Se não alterou nada ou apenas visualizou, o botão Concluir fecha o modal
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!movie || !movie.user_rating) return;
    try {
      setSaving(true);
      setError(null);
      await deleteMovieRating(movie.id);
      setMovie({ ...movie, user_rating: null });
      setSelectedScore(0);
      setIsEditing(true);
      onRatingChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover avaliação.');
    } finally {
      setSaving(false);
    }
  };

  const releaseYear = movie?.release_date ? movie.release_date.slice(0, 4) : '—';
  const hasExistingRating = Boolean(movie?.user_rating);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        {loading ? (
          <div className="status-box" style={{ gridColumn: '1 / -1' }}>
            Carregando detalhes do filme...
          </div>
        ) : error && !movie ? (
          <div className="status-box" style={{ gridColumn: '1 / -1' }}>
            <div className="error-banner">{error}</div>
            <button className="modal-submit-btn" onClick={onClose}>
              Fechar
            </button>
          </div>
        ) : movie ? (
          <>
            <div className="modal-poster-col">
              {movie.poster_url ? (
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="modal-poster-img"
                />
              ) : (
                <div className="poster-placeholder">Sem pôster disponível</div>
              )}
            </div>

            <div className="modal-body-col">
              <button
                className="modal-close-btn"
                onClick={onClose}
                title="Fechar"
              >
                ✕
              </button>

              <div>
                <div className="modal-badges">
                  <span className="badge-pill badge-genre">
                    {movie.genre || 'Filme'}
                  </span>
                  {movie.runtime && (
                    <span className="badge-pill badge-runtime">
                      {movie.runtime}
                    </span>
                  )}
                </div>

                <h2 className="modal-title">{movie.title}</h2>
                <p className="modal-release" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Lançamento em {releaseYear}
                </p>
                <div className="modal-section-label">SINOPSE</div>
                <p className="modal-synopsis">
                  {movie.synopsis || 'Sinopse não disponível para este título.'}
                </p>

                <div className="modal-section-label">ELENCO</div>
                <div className="cast-pills">
                  {movie.cast && movie.cast.length > 0 ? (
                    movie.cast.slice(0, 5).map((actor) => (
                      <span key={actor.id} className="cast-pill">
                        {actor.name}
                      </span>
                    ))
                  ) : (
                    <span className="cast-pill">Elenco não informado</span>
                  )}
                </div>
              </div>

              <div>
                {error && <div className="error-banner">{error}</div>}

                <div className="rating-box">
                  <div className="rating-box-header">
                    <div>
                      <div className="rating-box-title">
                        {hasExistingRating && !isEditing
                          ? 'Sua avaliação'
                          : 'O que achou do filme?'}
                      </div>
                      <div className="rating-box-sub">
                        {hasExistingRating && !isEditing
                          ? 'Use o lápis para editar'
                          : 'Selecione de 1 a 5 estrelas'}
                      </div>
                    </div>

                    {hasExistingRating && (
                     <div className="rating-actions">
                        <button
                          type="button"
                          className="icon-btn edit-btn"
                          onClick={() => setIsEditing(true)}
                          title="Editar nota"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="icon-btn delete-btn"
                          onClick={handleDelete}
                          disabled={saving}
                          title="Excluir avaliação"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="rating-stars-footer">
                    <div className="interactive-stars">
                      {[1, 2, 3, 4, 5].map((starValue) => (
                        <button
                          key={starValue}
                          type="button"
                          disabled={!isEditing || saving}
                          className={`star-btn ${
                            starValue <= selectedScore ? 'filled' : ''
                          }`}
                          onClick={() => setSelectedScore(starValue)}
                        >
                          {starValue <= selectedScore ? '★' : '☆'}
                        </button>
                      ))}
                    </div>

                    {selectedScore > 0 && (
                      <span className="rating-big-score">
                        {selectedScore.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="modal-submit-btn"
                  onClick={handleConclude}
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Concluir →'}
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}