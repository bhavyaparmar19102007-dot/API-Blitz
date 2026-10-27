import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchGhibliFilms } from '../api/ghibli';
import type { GhibliFilm, FavoriteItem } from '../types';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import DetailModal from '../components/DetailModal';
import FavButton from '../components/FavButton';
import ImageWithFallback from '../components/ImageWithFallback';

interface Props {
  isFavorite: (id: string, source: FavoriteItem['source']) => boolean;
  toggleFavorite: (item: FavoriteItem) => boolean;
  addToast: (msg: string) => void;
}

export default function GhibliPage({ isFavorite, toggleFavorite, addToast }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [films, setFilms] = useState<GhibliFilm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'year_desc' | 'year_asc' | 'score_desc' | 'title'>('year_desc');
  const [detail, setDetail] = useState<GhibliFilm | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const loadFilms = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError('');

    try {
      const data = await fetchGhibliFilms(ctrl.signal);
      if (!ctrl.signal.aborted) setFilms(data);
    } catch (err: any) {
      if (err.name !== 'AbortError') setError(err.message || 'Failed to load Studio Ghibli films');
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFilms();
  }, [loadFilms]);

  useEffect(() => {
    const detailId = searchParams.get('detail');
    if (detailId && films.length > 0) {
      const found = films.find(f => f.id === detailId);
      if (found) setDetail(found);
    }
  }, [searchParams, films]);

  const handleFav = (film: GhibliFilm, e: React.MouseEvent) => {
    e.stopPropagation();
    const item: FavoriteItem = {
      id: film.id,
      source: 'ghibli',
      title: film.title,
      image: film.image || '',
      subtitle: `${film.release_date} · Dir: ${film.director}`
    };
    const added = toggleFavorite(item);
    addToast(added ? `Added "${film.title}" to favorites` : `Removed "${film.title}" from favorites`);
  };

  const filteredFilms = films
    .filter(f => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        f.title.toLowerCase().includes(q) ||
        f.original_title?.toLowerCase().includes(q) ||
        f.director?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sort === 'year_desc') return Number(b.release_date) - Number(a.release_date);
      if (sort === 'year_asc') return Number(a.release_date) - Number(b.release_date);
      if (sort === 'score_desc') return Number(b.rt_score || 0) - Number(a.rt_score || 0);
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="container" style={{ paddingTop: '0.5rem', paddingBottom: '2rem' }}>
      <div className="page-header">
        <h1>🌿 Studio Ghibli Collection</h1>
        <p>Animated cinematic masterpieces</p>
      </div>

      <div className="filter-bar">
        <input
          className="input"
          placeholder="Search films or directors..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search Ghibli films"
        />
        <select
          className="select"
          value={sort}
          onChange={e => setSort(e.target.value as any)}
          aria-label="Sort Ghibli films"
        >
          <option value="year_desc">Release Year (Newest)</option>
          <option value="year_asc">Release Year (Oldest)</option>
          <option value="score_desc">Rotten Tomatoes Score</option>
          <option value="title">Alphabetical (Title)</option>
        </select>
        <button className="btn btn-outline" onClick={() => { setSearch(''); setSort('year_desc'); }}>
          Clear
        </button>
      </div>

      {loading && <LoadingState count={8} />}
      {error && <ErrorState message={error} onRetry={loadFilms} />}
      {!loading && !error && filteredFilms.length === 0 && <EmptyState />}

      {!loading && !error && filteredFilms.length > 0 && (
        <div className="grid-cards">
          {filteredFilms.map(f => (
            <div
              key={f.id}
              className="media-card"
              onClick={() => {
                setSearchParams({ detail: f.id });
                setDetail(f);
              }}
            >
              <FavButton
                isFav={isFavorite(f.id, 'ghibli')}
                onClick={e => handleFav(f, e)}
              />
              <ImageWithFallback
                src={f.image || f.movie_banner}
                alt={f.title}
                className="media-card-img"
              />
              <div className="media-card-body">
                <div className="media-card-title">{f.title}</div>
                <div className="media-card-sub" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                  <span>{f.release_date}</span>
                  {f.rt_score && <span style={{ color: 'var(--accent)', fontWeight: 600 }}>🍅 {f.rt_score}%</span>}
                </div>
                <div className="media-card-sub" style={{ fontSize: '0.75rem', marginTop: '0.125rem' }}>
                  Dir: {f.director}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DetailModal open={!!detail} onClose={() => { setDetail(null); setSearchParams({}); }}>
        {detail && (
          <>
            <ImageWithFallback
              src={detail.movie_banner || detail.image}
              alt={detail.title}
              className="detail-header-img"
            />
            <div className="detail-body">
              <h2>{detail.title}</h2>
              {detail.original_title && (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  {detail.original_title} ({detail.original_title_romanised})
                </p>
              )}
              <div className="detail-meta">
                <span className="badge">{detail.release_date}</span>
                <span className="badge">{detail.running_time} mins</span>
                {detail.rt_score && <span className="badge">🍅 {detail.rt_score}% RT Score</span>}
              </div>
              <p><strong>Director:</strong> {detail.director}</p>
              <p><strong>Producer:</strong> {detail.producer}</p>
              <p style={{ marginTop: '0.75rem', lineHeight: '1.6' }}>{detail.description}</p>
            </div>
          </>
        )}
      </DetailModal>
    </div>
  );
}
