# Multiverse Explorer

> **Five Universes. One Explorer.**

A responsive entertainment dashboard that unites five distinct pop-culture universes into a single exploration experience. Built with React, Vite, TypeScript, and a futuristic dark navy aesthetic with cyan accents.

---

## 🌌 The Five Universes

1. **AniList GraphQL API** (`https://graphql.anilist.co`)
   - Anime catalog with titles, cover art, genres, average score, episode count, format, and release year.
   - Search by title, filter by genre and format, sort by popularity/rating/trending, paginated browsing, and modal detail views.

2. **PokéAPI** (`https://pokeapi.co/api/v2/`)
   - Pokédex grid with official artwork, types, height, weight, abilities, and base stat bars (HP, Attack, Defense, Sp. Atk, Sp. Def, Speed).
   - In-memory request caching and graceful fallback to the official PokeAPI GitHub jsDelivr distribution if network firewalls block the primary domain.

3. **Rick and Morty API** (`https://rickandmortyapi.com/api`)
   - Multiverse character explorer with status indicators (Alive, Dead, Unknown), species, gender, origin, last known location, and episode lists.
   - Filter by status, gender, and search by character name with pagination.

4. **PotterDB** (`https://api.potterdb.com/v1`)
   - Complete Wizarding World database across 4 tabbed categories: Characters, Books, Movies, and Spells.
   - House filtering for characters, cover artwork, movie release details, spell incantations, and summaries.

5. **Studio Ghibli API** (`https://ghibliapi.dev/films` / `https://ghibliapi.vercel.app/films`)
   - Full collection of animated cinematic masterpieces.
   - Search by title/director, sort by release year or Rotten Tomatoes score, and inspect film summaries, running times, and director/producer credits.

---

## 🛠️ Key Features

- **Global Cross-Universe Search**: Type in the top search modal (or hit search) to query all 5 universes simultaneously with results grouped by universe.
- **Favorites System**: Heart any item across all 5 universes to persist it into `localStorage`. View, manage, and delete favorites with dedicated toast notifications.
- **Light & Dark Theme**: Toggle between futuristic dark navy and clean high-contrast light mode, with preferences saved in `localStorage`.
- **Stat Bars & Metadata**: Custom visual progress bars for Pokémon stats, color-coded status badges for Rick & Morty characters, house badges for Potter characters.
- **Resilient Network Architecture**: Dedicated service modules, typed API responses, AbortController cancellation for debounced inputs, and honest error/empty/loading states.
- **Responsive Layout**: Designed for mobile (375px), tablet (768px), and desktop screen widths.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Type Check & Production Build
```bash
npx tsc --noEmit
npm run build
```

### Preview Production Build
```bash
npm run preview
```

---

## 📂 Project Structure

```text
src/
  api/
    anilist.ts         # AniList GraphQL query service & filters
    pokeapi.ts         # PokéAPI service with caching & jsDelivr mirror fallback
    rickAndMorty.ts    # Rick & Morty REST client
    potterdb.ts        # PotterDB JSON:API client (characters, books, movies, spells)
    ghibli.ts          # Studio Ghibli API client with fallback endpoints
  components/
    Navbar.tsx         # Responsive navbar with theme toggle, search, favorites badge
    GlobalSearch.tsx   # Multi-universe debounced global search overlay
    DetailModal.tsx    # Accessible modal dialog with backdrop & ESC key handling
    Pagination.tsx     # Reusable numbered pagination control
    FavButton.tsx      # Heart toggle button with active styling
    ImageWithFallback.tsx # Lazy loading image with SVG placeholder fallback
    LoadingState.tsx   # Shimmer skeleton loader
    ErrorState.tsx     # Friendly error boundary with retry trigger
    EmptyState.tsx     # Zero results empty state
    Toast.tsx          # Auto-dismissing notification toasts
    Footer.tsx         # Project footer with official API documentation links
  hooks/
    useFavorites.ts    # LocalStorage-backed favorites hook
    useTheme.ts        # Theme toggler with DOM attribute reflection
    useToast.ts        # Toast notifications management
  pages/
    HomePage.tsx       # Hero, universe cards, and live trending feeds
    AnimePage.tsx      # AniList explorer with search, filters, and modal
    PokemonPage.tsx    # Pokédex with stats, types, and search
    RickAndMortyPage.tsx # Character explorer with status filters
    PotterPage.tsx     # Tabbed Wizarding World explorer
    GhibliPage.tsx     # Movie explorer with release/score sorting
    FavoritesPage.tsx  # Centralized favorites manager
  types/
    index.ts           # Strongly typed TypeScript interfaces
  App.tsx              # Router setup and global providers
  main.tsx             # React entry point
  index.css            # Dark/light theme tokens and component styling
```

---

## 📚 Official API Documentation Links

- [AniList GraphQL API Documentation](https://docs.anilist.co/guide/graphql/)
- [PokéAPI Documentation](https://pokeapi.co/docs/v2)
- [The Rick and Morty API Documentation](https://rickandmortyapi.com/documentation)
- [PotterDB API Documentation](https://docs.potterdb.com/)
- [Studio Ghibli API Documentation](https://ghibliapi.dev/)
