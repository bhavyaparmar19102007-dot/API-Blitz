import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <p>Multiverse Explorer — Five Universes. One Explorer.</p>
      <div className="footer-links">
        <a href="https://docs.anilist.co" target="_blank" rel="noopener noreferrer">AniList API</a>
        <a href="https://pokeapi.co/docs/v2" target="_blank" rel="noopener noreferrer">PokéAPI</a>
        <a href="https://rickandmortyapi.com/documentation" target="_blank" rel="noopener noreferrer">Rick &amp; Morty API</a>
        <a href="https://docs.potterdb.com" target="_blank" rel="noopener noreferrer">PotterDB</a>
        <a href="https://ghibliapi.dev" target="_blank" rel="noopener noreferrer">Studio Ghibli API</a>
      </div>
    </footer>
  );
}
