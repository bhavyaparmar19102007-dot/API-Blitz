import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchCharacters, fetchCharacterById, fetchEpisodeName, RM_STATUSES, RM_GENDERS } from '../api/rickAndMorty';
import type { RickMortyCharacter, RickMortyPage, FavoriteItem } from '../types';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import DetailModal from '../components/DetailModal';
import FavButton from '../components/FavButton';
import ImageWithFallback from '../components/ImageWithFallback';

interface Props {
  isFavorite: (id: string, source: FavoriteItem['source']) => boolean;
  toggleFavorite: (item: FavoriteItem) => boolean;
  addToast: (msg: string) => void;
}

const STATUS_COLORS: Record<string, string> = { Alive: 'var(--success)', Dead: 'var(--danger)', unknown: 'var(--text-muted)' };

export default function RickAndMortyPage({ isFavorite, toggleFavorite, addToast }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<RickMortyPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [gender, setGender] = useState('');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<RickMortyCharacter | null>(null);
  const [episodes, setEpisodes] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError('');
    try {
      const result = await fetchCharacters({ name: search || undefined, status: status || undefined, gender: gender || undefined, page }, ctrl.signal);
      setData(result);
    } catch (err: any) {
      if (err.name !== 'AbortError') setError(err.message || 'Failed to load characters');
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }, [search, status, gender, page]);

  useEffect(() => {
    const timer = setTimeout(() => load(), 300);
    return () => clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    const detailId = searchParams.get('detail');
    if (detailId) openDetail(Number(detailId));
  }, []);

  const openDetail = async (id: number) => {
    try {
      const ch = await fetchCharacterById(id);
      setDetail(ch);
      const eps = await Promise.all(ch.episode.slice(0, 5).map(url => fetchEpisodeName(url)));
      setEpisodes(eps);
    } catch { setDetail(null); }
  };

  const closeDetail = () => { setDetail(null); setEpisodes([]); setSearchParams({}); };

  const handleFav = (ch: RickMortyCharacter, e: React.MouseEvent) => {
    e.stopPropagation();
    const item: FavoriteItem = { id: String(ch.id), source: 'rickandmorty', title: ch.name, image: ch.image, subtitle: `${ch.status} · ${ch.species}` };
    const added = toggleFavorite(item);
    addToast(added ? `Added "${ch.name}" to favorites` : `Removed "${ch.name}" from favorites`);
  };

  const resetFilters = () => { setSearch(''); setStatus(''); setGender(''); setPage(1); };

  return (
    <div className="container" style={{ paddingTop: '0.5rem', paddingBottom: '2rem' }}>
      <div className="page-header">
        <h1>🛸 Rick &amp; Morty</h1>
        <p>Characters across dimensions</p>
      </div>

      <div className="filter-bar">
        <input className="input" placeholder="Search characters..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} aria-label="Search characters" />
        <select className="select" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} aria-label="Filter by status">
          <option value="">All Statuses</option>
          {RM_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="select" value={gender} onChange={e => { setGender(e.target.value); setPage(1); }} aria-label="Filter by gender">
          <option value="">All Genders</option>
          {RM_GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <button className="btn btn-outline" onClick={resetFilters}>Clear</button>
      </div>

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && data && data.results.length === 0 && <EmptyState />}

      {!loading && !error && data && data.results.length > 0 && (
        <>
          <div className="grid-cards">
            {data.results.map(ch => (
              <div key={ch.id} className="media-card" onClick={() => { setSearchParams({ detail: String(ch.id) }); openDetail(ch.id); }}>
                <FavButton isFav={isFavorite(String(ch.id), 'rickandmorty')} onClick={e => handleFav(ch, e)} />
                <ImageWithFallback src={ch.image} alt={ch.name} className="media-card-img" />
                <div className="media-card-body">
                  <div className="media-card-title">{ch.name}</div>
                  <div className="media-card-sub" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[ch.status] || 'var(--text-muted)', display: 'inline-block' }} />
                    {ch.status} · {ch.species}
                  </div>
                  <div className="media-card-sub" style={{ marginTop: '0.125rem' }}>{ch.location.name}</div>
                </div>
              </div>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={data.info.pages} onPageChange={setPage} disabled={loading} />
        </>
      )}

      <DetailModal open={!!detail} onClose={closeDetail}>
        {detail && (
          <>
            <ImageWithFallback src={detail.image} alt={detail.name} className="detail-header-img" style={{ objectFit: 'contain', background: 'var(--bg-card)' }} />
            <div className="detail-body">
              <h2>{detail.name}</h2>
              <div className="detail-meta">
                <span className="badge" style={{ color: STATUS_COLORS[detail.status] }}>{detail.status}</span>
                <span className="badge">{detail.species}</span>
                <span className="badge">{detail.gender}</span>
              </div>
              <p><strong>Origin:</strong> {detail.origin.name}</p>
              <p><strong>Last known location:</strong> {detail.location.name}</p>
              {episodes.length > 0 && (
                <>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem' }}>Episodes</h3>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {episodes.map((ep, i) => <li key={i} style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{ep}</li>)}
                  </ul>
                  {detail.episode.length > 5 && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>...and {detail.episode.length - 5} more</p>}
                </>
              )}
            </div>
          </>
        )}
      </DetailModal>
    </div>
  );
}
