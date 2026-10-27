import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import GlobalSearch from './components/GlobalSearch';
import ToastContainer from './components/Toast';
import { useFavorites } from './hooks/useFavorites';
import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';

import HomePage from './pages/HomePage';
import AnimePage from './pages/AnimePage';
import PokemonPage from './pages/PokemonPage';
import RickAndMortyPage from './pages/RickAndMortyPage';
import PotterPage from './pages/PotterPage';
import GhibliPage from './pages/GhibliPage';
import FavoritesPage from './pages/FavoritesPage';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { favorites, isFavorite, toggleFavorite, removeFavorite, count: favCount } = useFavorites();
  const { toasts, addToast } = useToast();
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar
          theme={theme}
          toggleTheme={toggleTheme}
          favCount={favCount}
          onGlobalSearch={() => setGlobalSearchOpen(true)}
        />

        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/anime"
              element={
                <AnimePage
                  isFavorite={isFavorite}
                  toggleFavorite={toggleFavorite}
                  addToast={addToast}
                />
              }
            />
            <Route
              path="/pokemon"
              element={
                <PokemonPage
                  isFavorite={isFavorite}
                  toggleFavorite={toggleFavorite}
                  addToast={addToast}
                />
              }
            />
            <Route
              path="/rickandmorty"
              element={
                <RickAndMortyPage
                  isFavorite={isFavorite}
                  toggleFavorite={toggleFavorite}
                  addToast={addToast}
                />
              }
            />
            <Route
              path="/potter"
              element={
                <PotterPage
                  isFavorite={isFavorite}
                  toggleFavorite={toggleFavorite}
                  addToast={addToast}
                />
              }
            />
            <Route
              path="/ghibli"
              element={
                <GhibliPage
                  isFavorite={isFavorite}
                  toggleFavorite={toggleFavorite}
                  addToast={addToast}
                />
              }
            />
            <Route
              path="/favorites"
              element={
                <FavoritesPage
                  favorites={favorites}
                  removeFavorite={removeFavorite}
                  addToast={addToast}
                />
              }
            />
          </Routes>
        </main>

        <Footer />
        <GlobalSearch open={globalSearchOpen} onClose={() => setGlobalSearchOpen(false)} />
        <ToastContainer toasts={toasts} />
      </div>
    </BrowserRouter>
  );
}
