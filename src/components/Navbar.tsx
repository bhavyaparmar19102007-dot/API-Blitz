import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Search, Heart, Compass } from 'lucide-react';

interface Props {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  favCount: number;
  onGlobalSearch: () => void;
}

const links = [
  { to: '/', label: 'Home' },
  { to: '/anime', label: 'Anime' },
  { to: '/pokemon', label: 'Pokémon' },
  { to: '/rickandmorty', label: 'Rick & Morty' },
  { to: '/potter', label: 'Harry Potter' },
  { to: '/ghibli', label: 'Ghibli' },
];

export default function Navbar({ theme, toggleTheme, favCount, onGlobalSearch }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem' }}>
          <Compass size={20} style={{ color: 'var(--accent)' }} />
          <span>Multiverse <span style={{ color: 'var(--accent)' }}>Explorer</span></span>
        </Link>

        <div className={`nav-links ${mobileOpen ? 'open' : ''}`}>
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`nav-link ${location.pathname === l.to ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/favorites"
            className={`nav-link ${location.pathname === '/favorites' ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <Heart size={14} />
            Favorites
            {favCount > 0 && <span className="fav-count">{favCount}</span>}
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <button className="btn-ghost btn" onClick={onGlobalSearch} aria-label="Search all universes" title="Search all universes">
            <Search size={18} />
          </button>
          <button className="btn-ghost btn" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="mobile-menu-btn btn-ghost btn" onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
