import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchAnime, fetchAnimeById, ANILIST_GENRES, ANILIST_FORMATS, ANILIST_SORTS } from '../api/anilist';
import type { AniListMedia, AniListPage, FavoriteItem } from '../types';
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

export default function AnimePage({ isFavorite, toggleFavorite, addToast }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<AniListPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [format, setFormat] = useState('');
  const [sort, setSort] = useState('POPULARITY_DESC');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<AniListMedia | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError('');
    try {
      const result = await fetchAnime({ search: search || undefined, genre: genre || undefined, format: format || undefined, sort: sort || undefined, page, perPage: 20 }, ctrl.signal);
      setData(result);
    } catch (err: any) {
      if (err.name !== 'AbortError') setError(err.message || 'Failed to load anime');
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }, [search, genre, format, sort, page]);

  useEffect(() => {
    const timer = setTimeout(() => load(), 300);
    return () => clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    const detailId = searchParams.get('detail');
    if (detailId) openDetail(Number(detailId));
  }, []);

  const openDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const anime = await fetchAnimeById(id);
      setDetail(anime);
    } catch { setDetail(null); }
    setDetailLoading(false);
  };

  const closeDetail = () => {
    setDetail(null);
    setSearchParams({});
  };

  const resetFilters = () => { setSearch(''); setGenre(''); setFormat(''); setSort('POPULARITY_DESC'); setPage(1); };

  const handleFav = (anime: AniListMedia, e: React.MouseEvent) => {
    e.stopPropagation();
    const item: FavoriteItem = { id: String(anime.id), source: 'anilist', title: anime.title.romaji || anime.title.english || '', image: anime.coverImage.medium, subtitle: anime.genres?.slice(0, 2).join(', ') };
    const added = toggleFavorite(item);
    addToast(added ? `Added "${item.title}" to favorites` : `Removed "${item.title}" from favorites`);
  };

  // Clean description: remove HTML tags
  const cleanDesc = (html: string | null) => {
    if (!html) return '';
    return html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '').trim();
  };

  return (
    <div className="container" style={{ paddingTop: '0.5rem', paddingBottom: '2rem' }}>
      <div className="page-header">
        <h1>🎌 Anime Explorer</h1>
        <p>Discover anime powered by AniList</p>
      </div>

      <div className="filter-bar">
        <input className="input" placeholder="Search anime..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} aria-label="Search anime" />
        <select className="select" value={genre} onChange={e => { setGenre(e.target.value); setPage(1); }} aria-label="Filter by genre">
          <option value="">All Genres</option>
          {ANILIST_GENRES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select className="select" value={format} onChange={e => { setFormat(e.target.value); setPage(1); }} aria-label="Filter by format">
          <option value="">All Formats</option>
          {ANILIST_FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <select className="select" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} aria-label="Sort by">
          {ANILIST_SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <button className="btn btn-outline" onClick={resetFilters}>Clear</button>
      </div>

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && data && data.media.length === 0 && <EmptyState />}

      {!loading && !error && data && data.media.length > 0 && (
        <>
          <div className="grid-cards">
            {data.media.map(anime => (
              <div key={anime.id} className="media-card" onClick={() => { setSearchParams({ detail: String(anime.id) }); openDetail(anime.id); }}>
                <FavButton isFav={isFavorite(String(anime.id), 'anilist')} onClick={e => handleFav(anime, e)} />
                <ImageWithFallback src={anime.coverImage.large} alt={anime.title.romaji} className="media-card-img" />
                <div className="media-card-body">
                  <div className="media-card-title">{anime.title.romaji || anime.title.english}</div>
                  <div className="media-card-sub">
                    {anime.format} {anime.episodes ? `· ${anime.episodes} eps` : ''} {anime.averageScore ? `· ⭐ ${anime.averageScore}%` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination currentPage={data.pageInfo.currentPage} totalPages={data.pageInfo.lastPage} onPageChange={p => setPage(p)} disabled={loading} />
        </>
      )}

      <DetailModal open={!!detail} onClose={closeDetail}>
        {detail && (
          <>
            <ImageWithFallback src={detail.bannerImage || detail.coverImage.large} alt={detail.title.romaji} className="detail-header-img" />
            <div className="detail-body">
              <h2>{detail.title.romaji || detail.title.english}</h2>
              {detail.title.native && <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{detail.title.native}</p>}
              <div className="detail-meta">
                {detail.format && <span className="badge">{detail.format}</span>}
                {detail.status && <span className="badge">{detail.status}</span>}
                {detail.seasonYear && <span className="badge">{detail.season} {detail.seasonYear}</span>}
                {detail.episodes && <span className="badge">{detail.episodes} episodes</span>}
                {detail.averageScore && <span className="badge">⭐ {detail.averageScore}%</span>}
              </div>
              {detail.genres?.length > 0 && <div className="detail-meta">{detail.genres.map(g => <span key={g} className="badge">{g}</span>)}</div>}
              {detail.studios?.nodes?.length > 0 && <p style={{ fontSize: '0.8125rem', marginBottom: '0.5rem' }}><strong>Studio:</strong> {detail.studios.nodes.map(s => s.name).join(', ')}</p>}
              <p style={{ whiteSpace: 'pre-line' }}>{cleanDesc(detail.description)}</p>
            </div>
          </>
        )}
      </DetailModal>
    </div>
  );
}
