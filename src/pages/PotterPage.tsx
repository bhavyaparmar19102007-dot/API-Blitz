import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  fetchPotterCharacters,
  fetchPotterBooks,
  fetchPotterMovies,
  fetchPotterSpells
} from '../api/potterdb';
import type {
  PotterCharacter,
  PotterBook,
  PotterMovie,
  PotterSpell,
  FavoriteItem
} from '../types';
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

type TabType = 'characters' | 'books' | 'movies' | 'spells';

const HOUSE_COLORS: Record<string, string> = {
  Gryffindor: '#ae0001',
  Slytherin: '#2a623d',
  Ravenclaw: '#222f5b',
  Hufflepuff: '#ecb939',
};

export default function PotterPage({ isFavorite, toggleFavorite, addToast }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('characters');
  const [characters, setCharacters] = useState<PotterCharacter[]>([]);
  const [books, setBooks] = useState<PotterBook[]>([]);
  const [movies, setMovies] = useState<PotterMovie[]>([]);
  const [spells, setSpells] = useState<PotterSpell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [houseFilter, setHouseFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [detailItem, setDetailItem] = useState<any>(null);
  const abortRef = useRef<AbortController | null>(null);

  const loadData = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError('');

    try {
      if (activeTab === 'characters') {
        const res = await fetchPotterCharacters(page, search || undefined, ctrl.signal);
        setCharacters(res.data);
        setTotalPages(res.meta?.pagination?.last || 1);
      } else if (activeTab === 'books') {
        const res = await fetchPotterBooks(ctrl.signal);
        let items = res.data;
        if (search) {
          const q = search.toLowerCase();
          items = items.filter(b => b.attributes.title.toLowerCase().includes(q));
        }
        setBooks(items);
        setTotalPages(1);
      } else if (activeTab === 'movies') {
        const res = await fetchPotterMovies(ctrl.signal);
        let items = res.data;
        if (search) {
          const q = search.toLowerCase();
          items = items.filter(m => m.attributes.title.toLowerCase().includes(q));
        }
        setMovies(items);
        setTotalPages(1);
      } else if (activeTab === 'spells') {
        const res = await fetchPotterSpells(page, search || undefined, ctrl.signal);
        setSpells(res.data);
        setTotalPages(res.meta?.pagination?.last || 1);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') setError(err.message || 'Failed to load Wizarding World data');
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }, [activeTab, page, search]);

  useEffect(() => {
    const timer = setTimeout(() => loadData(), 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setPage(1);
    setSearch('');
    setHouseFilter('');
  };

  const handleFav = (id: string, title: string, image: string, subtitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item: FavoriteItem = { id, source: 'potter', title, image, subtitle };
    const added = toggleFavorite(item);
    addToast(added ? `Added "${title}" to favorites` : `Removed "${title}" from favorites`);
  };

  const filteredCharacters = houseFilter
    ? characters.filter(c => c.attributes.house?.toLowerCase() === houseFilter.toLowerCase())
    : characters;

  return (
    <div className="container" style={{ paddingTop: '0.5rem', paddingBottom: '2rem' }}>
      <div className="page-header">
        <h1>⚡ Harry Potter Universe</h1>
        <p>Explore characters, books, movies, and spells powered by PotterDB</p>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'characters' ? 'active' : ''}`} onClick={() => handleTabChange('characters')}>
          Characters
        </button>
        <button className={`tab ${activeTab === 'books' ? 'active' : ''}`} onClick={() => handleTabChange('books')}>
          Books
        </button>
        <button className={`tab ${activeTab === 'movies' ? 'active' : ''}`} onClick={() => handleTabChange('movies')}>
          Movies
        </button>
        <button className={`tab ${activeTab === 'spells' ? 'active' : ''}`} onClick={() => handleTabChange('spells')}>
          Spells
        </button>
      </div>

      <div className="filter-bar">
        <input
          className="input"
          placeholder={`Search ${activeTab}...`}
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          aria-label={`Search ${activeTab}`}
        />
        {activeTab === 'characters' && (
          <select className="select" value={houseFilter} onChange={e => setHouseFilter(e.target.value)} aria-label="Filter by House">
            <option value="">All Houses</option>
            <option value="Gryffindor">Gryffindor</option>
            <option value="Slytherin">Slytherin</option>
            <option value="Ravenclaw">Ravenclaw</option>
            <option value="Hufflepuff">Hufflepuff</option>
          </select>
        )}
        <button className="btn btn-outline" onClick={() => { setSearch(''); setHouseFilter(''); setPage(1); }}>
          Clear
        </button>
      </div>

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={loadData} />}

      {!loading && !error && (
        <>
          {activeTab === 'characters' && (
            <>
              {filteredCharacters.length === 0 ? <EmptyState /> : (
                <div className="grid-cards">
                  {filteredCharacters.map(c => {
                    const house = c.attributes.house;
                    return (
                      <div key={c.id} className="media-card" onClick={() => setDetailItem({ type: 'character', data: c.attributes })}>
                        <FavButton
                          isFav={isFavorite(c.id, 'potter')}
                          onClick={e => handleFav(c.id, c.attributes.name, c.attributes.image || '', house || 'Character', e)}
                        />
                        <ImageWithFallback src={c.attributes.image || ''} alt={c.attributes.name} className="media-card-img" />
                        <div className="media-card-body">
                          <div className="media-card-title">{c.attributes.name}</div>
                          <div className="media-card-sub" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                            {house && (
                              <span className="badge" style={{ background: HOUSE_COLORS[house] || 'var(--accent-dim)', color: '#fff', fontSize: '0.6875rem' }}>
                                {house}
                              </span>
                            )}
                            <span>{c.attributes.species || 'Human'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} disabled={loading} />
            </>
          )}

          {activeTab === 'books' && (
            books.length === 0 ? <EmptyState /> : (
              <div className="grid-cards">
                {books.map(b => (
                  <div key={b.id} className="media-card" onClick={() => setDetailItem({ type: 'book', data: b.attributes })}>
                    <FavButton
                      isFav={isFavorite(b.id, 'potter')}
                      onClick={e => handleFav(b.id, b.attributes.title, b.attributes.cover || '', `By ${b.attributes.author}`, e)}
                    />
                    <ImageWithFallback src={b.attributes.cover || ''} alt={b.attributes.title} className="media-card-img" />
                    <div className="media-card-body">
                      <div className="media-card-title">{b.attributes.title}</div>
                      <div className="media-card-sub">{b.attributes.author} · {b.attributes.release_date?.slice(0, 4)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'movies' && (
            movies.length === 0 ? <EmptyState /> : (
              <div className="grid-cards">
                {movies.map(m => (
                  <div key={m.id} className="media-card" onClick={() => setDetailItem({ type: 'movie', data: m.attributes })}>
                    <FavButton
                      isFav={isFavorite(m.id, 'potter')}
                      onClick={e => handleFav(m.id, m.attributes.title, m.attributes.poster || '', m.attributes.release_date || '', e)}
                    />
                    <ImageWithFallback src={m.attributes.poster || ''} alt={m.attributes.title} className="media-card-img" />
                    <div className="media-card-body">
                      <div className="media-card-title">{m.attributes.title}</div>
                      <div className="media-card-sub">{m.attributes.release_date?.slice(0, 4)} {m.attributes.rating ? `· ${m.attributes.rating}` : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'spells' && (
            <>
              {spells.length === 0 ? <EmptyState /> : (
                <div className="grid-cards">
                  {spells.map(s => (
                    <div key={s.id} className="media-card" onClick={() => setDetailItem({ type: 'spell', data: s.attributes })}>
                      <FavButton
                        isFav={isFavorite(s.id, 'potter')}
                        onClick={e => handleFav(s.id, s.attributes.name, s.attributes.image || '', s.attributes.category || 'Spell', e)}
                      />
                      <ImageWithFallback src={s.attributes.image || ''} alt={s.attributes.name} className="media-card-img" />
                      <div className="media-card-body">
                        <div className="media-card-title">{s.attributes.name}</div>
                        <div className="media-card-sub">{s.attributes.category || 'Spell'}</div>
                        {s.attributes.incantation && (
                          <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--accent)', marginTop: '0.25rem' }}>
                            "{s.attributes.incantation}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} disabled={loading} />
            </>
          )}
        </>
      )}

      <DetailModal open={!!detailItem} onClose={() => setDetailItem(null)}>
        {detailItem && (
          <div className="detail-body">
            {detailItem.type === 'character' && (
              <>
                <ImageWithFallback src={detailItem.data.image || ''} alt={detailItem.data.name} className="detail-header-img" style={{ objectFit: 'contain' }} />
                <h2>{detailItem.data.name}</h2>
                <div className="detail-meta">
                  {detailItem.data.house && <span className="badge" style={{ background: HOUSE_COLORS[detailItem.data.house] || 'var(--accent-dim)', color: '#fff' }}>{detailItem.data.house}</span>}
                  {detailItem.data.species && <span className="badge">{detailItem.data.species}</span>}
                  {detailItem.data.gender && <span className="badge">{detailItem.data.gender}</span>}
                </div>
                {detailItem.data.born && <p><strong>Born:</strong> {detailItem.data.born}</p>}
                {detailItem.data.died && <p><strong>Died:</strong> {detailItem.data.died}</p>}
                {detailItem.data.patronus && <p><strong>Patronus:</strong> {detailItem.data.patronus}</p>}
                {detailItem.data.wand && <p><strong>Wand:</strong> {detailItem.data.wand}</p>}
              </>
            )}

            {detailItem.type === 'book' && (
              <>
                <ImageWithFallback src={detailItem.data.cover || ''} alt={detailItem.data.title} className="detail-header-img" style={{ objectFit: 'contain' }} />
                <h2>{detailItem.data.title}</h2>
                <div className="detail-meta">
                  <span className="badge">By {detailItem.data.author}</span>
                  {detailItem.data.release_date && <span className="badge">{detailItem.data.release_date}</span>}
                  {detailItem.data.pages && <span className="badge">{detailItem.data.pages} pages</span>}
                </div>
                <p style={{ marginTop: '0.75rem' }}>{detailItem.data.summary}</p>
              </>
            )}

            {detailItem.type === 'movie' && (
              <>
                <ImageWithFallback src={detailItem.data.poster || ''} alt={detailItem.data.title} className="detail-header-img" style={{ objectFit: 'contain' }} />
                <h2>{detailItem.data.title}</h2>
                <div className="detail-meta">
                  {detailItem.data.release_date && <span className="badge">{detailItem.data.release_date}</span>}
                  {detailItem.data.rating && <span className="badge">{detailItem.data.rating}</span>}
                  {detailItem.data.running_time && <span className="badge">{detailItem.data.running_time}</span>}
                </div>
                {detailItem.data.directors?.length > 0 && <p><strong>Director(s):</strong> {detailItem.data.directors.join(', ')}</p>}
                {detailItem.data.box_office && <p><strong>Box Office:</strong> {detailItem.data.box_office}</p>}
                <p style={{ marginTop: '0.75rem' }}>{detailItem.data.summary}</p>
              </>
            )}

            {detailItem.type === 'spell' && (
              <>
                <ImageWithFallback src={detailItem.data.image || ''} alt={detailItem.data.name} className="detail-header-img" style={{ objectFit: 'contain' }} />
                <h2>{detailItem.data.name}</h2>
                <div className="detail-meta">
                  {detailItem.data.category && <span className="badge">{detailItem.data.category}</span>}
                  {detailItem.data.light && <span className="badge">Light: {detailItem.data.light}</span>}
                </div>
                {detailItem.data.incantation && <p><strong>Incantation:</strong> <em>{detailItem.data.incantation}</em></p>}
                {detailItem.data.effect && <p style={{ marginTop: '0.5rem' }}><strong>Effect:</strong> {detailItem.data.effect}</p>}
              </>
            )}
          </div>
        )}
      </DetailModal>
    </div>
  );
}
