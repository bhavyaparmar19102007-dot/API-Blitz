import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchPokemonList, fetchPokemonBatch, fetchPokemonDetail, getPokemonImage, POKEMON_TYPES } from '../api/pokeapi';
import type { PokemonDetail, FavoriteItem } from '../types';
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

const PER_PAGE = 20;
const TOTAL_POKEMON = 1025;

const TYPE_COLORS: Record<string, string> = {
  normal: '#a8a878', fire: '#f08030', water: '#6890f0', electric: '#f8d030',
  grass: '#78c850', ice: '#98d8d8', fighting: '#c03028', poison: '#a040a0',
  ground: '#e0c068', flying: '#a890f0', psychic: '#f85888', bug: '#a8b820',
  rock: '#b8a038', ghost: '#705898', dragon: '#7038f8', dark: '#705848',
  steel: '#b8b8d0', fairy: '#ee99ac',
};

const STAT_COLORS: Record<string, string> = {
  hp: '#ff5959', attack: '#f5ac78', defense: '#fae078', 'special-attack': '#9db7f5',
  'special-defense': '#a7db8d', speed: '#fa92b2',
};

export default function PokemonPage({ isFavorite, toggleFavorite, addToast }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pokemon, setPokemon] = useState<PokemonDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [detail, setDetail] = useState<PokemonDetail | null>(null);
  const [searchResult, setSearchResult] = useState<PokemonDetail | null>(null);
  const [searching, setSearching] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const totalPages = Math.ceil(TOTAL_POKEMON / PER_PAGE);

  const loadPage = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError('');
    try {
      const offset = (page - 1) * PER_PAGE;
      const list = await fetchPokemonList(offset, PER_PAGE, ctrl.signal);
      const details = await fetchPokemonBatch(list.results, ctrl.signal);
      if (!ctrl.signal.aborted) setPokemon(details);
    } catch (err: any) {
      if (err.name !== 'AbortError') setError(err.message || 'Failed to load Pokémon');
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }, [page]);

  useEffect(() => { loadPage(); }, [loadPage]);

  useEffect(() => {
    const detailId = searchParams.get('detail');
    if (detailId) openDetail(detailId);
  }, []);

  useEffect(() => {
    if (!search) { setSearchResult(null); setSearching(false); return; }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const p = await fetchPokemonDetail(search.toLowerCase().trim());
        setSearchResult(p);
      } catch {
        setSearchResult(null);
      }
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const openDetail = async (nameOrId: string | number) => {
    try {
      const p = await fetchPokemonDetail(nameOrId);
      setDetail(p);
    } catch { setDetail(null); }
  };

  const closeDetail = () => { setDetail(null); setSearchParams({}); };

  const handleFav = (p: PokemonDetail, e: React.MouseEvent) => {
    e.stopPropagation();
    const item: FavoriteItem = { id: String(p.id), source: 'pokemon', title: p.name, image: getPokemonImage(p), subtitle: p.types.map(t => t.type.name).join(', ') };
    const added = toggleFavorite(item);
    addToast(added ? `Added "${p.name}" to favorites` : `Removed "${p.name}" from favorites`);
  };

  const displayed = (search && searchResult) ? [searchResult] :
    typeFilter ? pokemon.filter(p => p.types.some(t => t.type.name === typeFilter)) : pokemon;

  return (
    <div className="container" style={{ paddingTop: '0.5rem', paddingBottom: '2rem' }}>
      <div className="page-header">
        <h1>⚡ Pokédex</h1>
        <p>Explore Pokémon powered by PokéAPI</p>
      </div>

      <div className="filter-bar">
        <input className="input" placeholder="Search by name or number..." value={search} onChange={e => setSearch(e.target.value)} aria-label="Search Pokémon" />
        <select className="select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} aria-label="Filter by type">
          <option value="">All Types</option>
          {POKEMON_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
        <button className="btn btn-outline" onClick={() => { setSearch(''); setTypeFilter(''); setPage(1); }}>Clear</button>
      </div>

      {loading && !search && <LoadingState />}
      {error && <ErrorState message={error} onRetry={loadPage} />}
      {searching && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Searching...</p>}
      {!loading && !error && displayed.length === 0 && !searching && <EmptyState />}

      {displayed.length > 0 && (
        <div className="grid-cards">
          {displayed.map(p => (
            <div key={p.id} className="media-card" onClick={() => { setSearchParams({ detail: String(p.id) }); openDetail(p.id); }}>
              <FavButton isFav={isFavorite(String(p.id), 'pokemon')} onClick={e => handleFav(p, e)} />
              <div style={{ background: 'var(--bg-surface)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', aspectRatio: '1' }}>
                <ImageWithFallback src={getPokemonImage(p)} alt={p.name} style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
              </div>
              <div className="media-card-body">
                <div className="media-card-sub" style={{ marginBottom: '0.25rem' }}>#{String(p.id).padStart(3, '0')}</div>
                <div className="media-card-title" style={{ textTransform: 'capitalize' }}>{p.name}</div>
                <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.375rem', flexWrap: 'wrap' }}>
                  {p.types.map(t => (
                    <span key={t.type.name} className="badge" style={{ background: TYPE_COLORS[t.type.name] || 'var(--accent-dim)', color: '#fff', border: 'none', fontSize: '0.6875rem' }}>
                      {t.type.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!search && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} disabled={loading} />}

      <DetailModal open={!!detail} onClose={closeDetail}>
        {detail && (
          <div className="detail-body">
            <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem', background: 'var(--bg-card)' }}>
              <ImageWithFallback src={getPokemonImage(detail)} alt={detail.name} style={{ width: 180, height: 180, objectFit: 'contain' }} />
            </div>
            <h2 style={{ textTransform: 'capitalize', textAlign: 'center' }}>{detail.name} <span style={{ color: 'var(--text-muted)' }}>#{String(detail.id).padStart(3, '0')}</span></h2>
            <div className="detail-meta" style={{ justifyContent: 'center' }}>
              {detail.types.map(t => <span key={t.type.name} className="badge" style={{ background: TYPE_COLORS[t.type.name], color: '#fff', border: 'none' }}>{t.type.name}</span>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', margin: '1rem 0' }}>
              <div><strong style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Height</strong><p>{(detail.height / 10).toFixed(1)} m</p></div>
              <div><strong style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Weight</strong><p>{(detail.weight / 10).toFixed(1)} kg</p></div>
              <div style={{ gridColumn: '1 / -1' }}><strong style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Abilities</strong><p style={{ textTransform: 'capitalize' }}>{detail.abilities.map(a => a.ability.name.replace('-', ' ')).join(', ')}</p></div>
            </div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Base Stats</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {detail.stats.map(s => {
                const pct = Math.min(100, (s.base_stat / 255) * 100);
                return (
                  <div key={s.stat.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.125rem' }}>
                      <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{s.stat.name.replace('-', ' ')}</span>
                      <span style={{ fontWeight: 600 }}>{s.base_stat}</span>
                    </div>
                    <div className="stat-bar-track">
                      <div className="stat-bar-fill" style={{ width: `${pct}%`, background: STAT_COLORS[s.stat.name] || 'var(--accent)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DetailModal>
    </div>
  );
}
