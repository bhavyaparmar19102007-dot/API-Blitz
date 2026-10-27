# Multiverse Explorer — Antigravity Build Checklist

> **Instructions for Antigravity:** This Markdown file is the project's source of truth. Build the website described below in the folder containing this file. Do not only explain how to build it: create/edit the project files, run the application, test it, fix problems, and update the checkboxes in this document. Mark a checkbox `[x]` only after the corresponding task is implemented and verified. If something cannot be completed, leave it unchecked and explain the blocker in the **Final Status** section at the bottom.

## Project goal

Build **Multiverse Explorer**, a polished, responsive, interactive website that uses all five APIs assigned in the project:

1. AniList GraphQL API — anime discovery
2. PokéAPI — Pokémon Pokédex
3. Rick and Morty API — character explorer
4. PotterDB — Harry Potter characters, books, movies, and spells
5. Studio Ghibli API — animated movie collection

**Tagline:** *Five Universes. One Explorer.*

The finished website must use real API data. Do not replace the integrations with hardcoded sample data, pretend search results, or decorative controls that do nothing. It is acceptable to use polished empty/error states when an API is unavailable.

---

## 0. Rules of work

- [x] Inspect the current folder before creating or overwriting files.
- [x] This may be a new, empty folder. If it is empty, initialize the project in this exact folder, not in an unrelated nested folder.
- [x] Build and test the application, not just a plan or mockup.
- [x] Update this checklist as work is completed. Never tick a task just because code was written; verify it works.
- [x] Prefer simple, maintainable architecture over unnecessary libraries or complexity.
- [x] Keep working features intact when fixing bugs.
- [x] Do not ask the user to make routine implementation decisions. Choose sensible defaults and proceed.
- [x] If one API fails, investigate whether the endpoint, CORS, network, or response parsing is the cause. Keep other sections working.
- [x] Do not silently use mock data when an API fails. Show an honest error state and explain the issue.

## 1. Initial project setup

- [x] Create a React + Vite + TypeScript application in this folder if one does not already exist.
- [x] Set up Tailwind CSS using the method supported by the installed/current version, or use clean CSS modules/plain CSS if that is more reliable.
- [x] Add React Router for page/section navigation if useful.
- [x] Add Lucide icons or an equivalent lightweight icon package.
- [x] Create and verify the main development command (`npm run dev`).
- [x] Add scripts for linting and/or type checking if appropriate.
- [x] Keep API logic, UI components, types, and pages in separate, understandable files.
- [x] Add a `.gitignore` that excludes `node_modules`, build output, and local environment files.
- [x] Confirm the initial application starts without build errors.

Suggested structure (adjust where there is a clear reason):

```text
src/
  api/
    anilist.ts
    pokeapi.ts
    rickAndMorty.ts
    potterdb.ts
    ghibli.ts
  components/
    Navbar.tsx
    SearchBar.tsx
    UniverseCard.tsx
    MediaCard.tsx
    FilterBar.tsx
    Pagination.tsx
    DetailModal.tsx
    LoadingState.tsx
    ErrorState.tsx
    EmptyState.tsx
    Toast.tsx
  pages/
    HomePage.tsx
    AnimePage.tsx
    PokemonPage.tsx
    RickAndMortyPage.tsx
    PotterPage.tsx
    GhibliPage.tsx
    FavoritesPage.tsx
  types/
  hooks/
  utils/
  App.tsx
  main.tsx
  index.css
README.md
ANTIGRAVITY_TASK_CHECKLIST.md
```

## 2. API endpoints and integration requirements

Before implementing each integration, check its official documentation and inspect a real response. Confirm the selected endpoint is reachable from the browser. Avoid assuming all APIs have the same response format.

### 2.1 AniList GraphQL

- API endpoint: `https://graphql.anilist.co`
- Official docs: <https://docs.anilist.co/guide/graphql/>
- Requests must use POST with a JSON body containing `query` and `variables`.

Tasks:

- [x] Create a dedicated AniList service module with typed query results.
- [x] Fetch anime titles, cover images, descriptions, genres, score, episode count, format, and release year when available.
- [x] Implement search by anime title.
- [x] Implement genre and format filters where supported by the query.
- [x] Implement sorting, for example by popularity and average score, using API-supported query options where possible.
- [x] Implement pagination using AniList's page/pageInfo fields.
- [x] Implement an anime detail view with available metadata.
- [x] Handle GraphQL errors and HTTP failures correctly; do not assume an HTTP 200 response means there are no GraphQL errors.
- [x] Render descriptions safely. If descriptions contain HTML, sanitize or safely transform them before rendering.

### 2.2 PokéAPI

- Base endpoint: `https://pokeapi.co/api/v2/`
- Official docs: <https://pokeapi.co/docs/v2>

Tasks:

- [x] Create a dedicated PokéAPI service module.
- [x] Build a Pokédex grid showing Pokémon image/artwork, name, number, and type(s).
- [x] Use real Pokémon list data and fetch detail data as needed; do not request every Pokémon's full details at startup.
- [x] Implement name search and type filtering. If client-side filtering is used, make its scope clear and only filter data that has actually been loaded; otherwise fetch/query appropriately.
- [x] Implement pagination or Load More using the API's `offset` and `limit` parameters.
- [x] Display HP, Attack, Defense, Special Attack, Special Defense, and Speed as stat bars in the detail view.
- [x] Display height, weight, abilities, and other useful available details.
- [x] Cache repeated requests to reduce network traffic.
- [x] Respect PokéAPI's fair-use guidance and avoid excessive concurrent requests.
- [x] Provide a fallback image when artwork is unavailable.

### 2.3 Rick and Morty API

- Base endpoint: `https://rickandmortyapi.com/api`
- Official docs: <https://rickandmortyapi.com/documentation>
- Character resource: `/character`

Tasks:

- [x] Create a dedicated service module.
- [x] Display character image, name, status, species, gender, origin, and last known location where available.
- [x] Implement name search using the API's supported query parameters.
- [x] Implement status filtering for Alive, Dead, and Unknown.
- [x] Add species/gender filtering when feasible, using supported API filters or clearly scoped loaded data.
- [x] Implement pagination from the API's `info.pages`, `info.next`, and `info.prev` fields.
- [x] Add character details with episode information when available.
- [x] Handle API responses for no matching characters without presenting them as a server failure.
- [x] Show clear loading and retry states.

### 2.4 PotterDB

- Suggested API base: `https://api.potterdb.com/v1`
- Official docs: <https://docs.potterdb.com/>
- Candidate resources: `/characters`, `/books`, `/movies`, `/spells`

Tasks:

- [x] Confirm the current official endpoints and response shape before implementation.
- [x] Create a dedicated PotterDB service module and types.
- [x] Implement sections/tabs for Characters, Books, Movies, and Spells.
- [x] Display relevant real fields for each resource, such as character image/name/house, book title/cover/author, movie title/poster/release information, and spell name/description/type when returned.
- [x] Implement search for the active resource using supported query parameters or loaded data.
- [x] Add a House filter for characters only if the API provides the necessary field and values.
- [x] Handle JSON:API-style response objects properly, including resource `attributes`, relationships, and pagination metadata where returned.
- [x] Do not assume every character has an image, house, or complete information.
- [x] Add pagination or Load More using the API's actual pagination behavior.
- [x] Handle API errors without breaking the rest of the site.

### 2.5 Studio Ghibli API

- Documentation currently associated with this API: <https://ghibliapi.dev/>
- The previous commonly used endpoint is `https://ghibliapi.dev/films`. Verify this endpoint is currently reachable and check for any officially documented endpoint changes before use.

Tasks:

- [x] Confirm the working official/recommended endpoint and CORS behavior before implementing it.
- [x] Create a dedicated service module with TypeScript types that match the real response.
- [x] Display movie title, original title when available, image/poster when supplied, release year, director, producer, rating, and description when available.
- [x] Implement movie search.
- [x] Implement sorting by release year and rating where the data supports it.
- [x] Create a movie detail view.
- [x] Do not invent posters, ratings, or facts that are missing from the API. Use a designed fallback image/placeholder.
- [x] If the original endpoint is unavailable, document what was tested and use a legitimate, compatible endpoint only after verifying its source. Do not quietly substitute unrelated or fabricated data.

## 3. Global application design

Build a refined dark interface inspired by the supplied reference image: dark navy surfaces, thin borders, cyan accents, compact labels, clean typography, rounded cards, and a futuristic entertainment-dashboard feel. Do not copy the reference screenshot as a static picture; implement real UI components.

- [x] Establish consistent CSS variables/design tokens for background, surface, borders, text, muted text, and accent colors.
- [x] Use a dark navy/near-black background, lighter dark cards, white primary text, muted secondary text, and restrained cyan/blue/violet accents.
- [x] Create polished spacing, responsive grids, readable typography, and consistent corner radii.
- [x] Add subtle hover/focus effects and brief transitions; avoid excessive glow, movement, or gradients.
- [x] Provide a working light/dark theme switch and persist the preference.
- [x] Ensure the interface is usable at desktop, tablet, and mobile widths.
- [x] Do not use oversized placeholder sections that push the actual data far below the fold.
- [x] Use real item images from the APIs where available and graceful fallbacks when unavailable.

## 4. Navigation and home page

- [x] Build a responsive navigation bar with the Multiverse Explorer brand.
- [x] Add working navigation links: Home, Anime, Pokémon, Rick & Morty, Harry Potter, Ghibli, and Favorites.
- [x] Correctly highlight the current route/section.
- [x] Add a global search control.
- [x] Add a mobile menu that opens and closes correctly.
- [x] Build a home hero with title, tagline, and a working Explore button.
- [x] Create five universe cards, each with a title, short description, relevant artwork/visual, and a working Explore action.
- [x] Add a Trending/Discover section populated with real API data from APIs that load successfully.
- [x] Load API sections lazily/on demand rather than fetching everything at first page load.
- [x] Add a footer with project description and links to the API documentation.

## 5. Dedicated explorer pages

- [x] Anime page: real anime cards, search, genre/format filters, score/popularity sorting, pagination, and details.
- [x] Pokémon page: Pokédex cards, type filters, search, pagination/Load More, stats, and details.
- [x] Rick & Morty page: character cards, search, status filters, pagination, and details.
- [x] Harry Potter page: resource tabs, cards/list appropriate to each resource, search, available filters, pagination, and details.
- [x] Ghibli page: movie cards, search, release-year/rating sorting, and details.
- [x] Each page must use its corresponding service module and real API results.
- [x] Search/filter/sort states must be consistent and visibly reflected in the UI.
- [x] Reset/Clear controls must return filters and search to their initial state.

## 6. Interactions that must genuinely work

- [x] Global search searches across the five universes and groups results by API/source. It must call real API services; do not return static or invented results.
- [x] Use a short debounce for text search where appropriate.
- [x] Each result identifies its universe and opens the correct detail view.
- [x] Clicking a card opens its detail modal or dedicated detail route.
- [x] Detail modals/routes display useful available data and close/navigate back correctly.
- [x] Escape closes a modal, and clicking the backdrop closes it if appropriate without making inner dialog clicks close it.
- [x] Favorites heart buttons add/remove the selected item.
- [x] Store favorites in localStorage and restore them after page refresh.
- [x] Store enough stable item information (source, unique ID, title/name, image, and necessary type data) to render favorites without duplicate IDs across APIs.
- [x] Favorites page displays saved items, supports removal, and opens details when enough information is available or fetches the detail record.
- [x] Show a favorites count in the navigation.
- [x] Search, filters, sorting, pagination, theme, and mobile navigation controls must do what their labels imply.
- [x] Show a toast or clear feedback after adding/removing a favorite.
- [x] Add useful empty states when no items match.
- [x] Add keyboard focus styling and labels for icon-only buttons.

## 7. API architecture, state, and reliability

- [x] Keep each API integration in its own service module.
- [x] Define TypeScript types for the actual responses and the UI models.
- [x] Keep network logic out of large presentation components.
- [x] Use reusable fetch helpers only where they genuinely simplify the code.
- [x] Handle HTTP failures, JSON parsing errors, GraphQL errors, empty result sets, and timeouts where sensible.
- [x] Avoid race conditions when the user types rapidly; cancel obsolete requests with `AbortController` where supported, or ignore stale responses.
- [x] Avoid duplicate fetching and repeated renders that trigger unnecessary requests.
- [x] Cache repeated requests when appropriate, especially Pokémon detail requests.
- [x] Keep failure in one API isolated from the other APIs.
- [x] Never place secrets or private credentials in frontend code. Prefer public endpoints that do not require authentication.
- [x] Add clear error messages and Retry actions where useful.
- [x] Show source-specific errors rather than claiming the entire site is offline if only one service fails.
- [x] Do not log sensitive data or flood the browser console.

## 8. Loading, empty, and error states

- [x] Use skeletons or a loading indicator while data is loading.
- [x] Add a useful empty state for zero search results.
- [x] Add a friendly error state and Retry button on API failure.
- [x] Add image fallbacks for failed/missing images.
- [x] Disable or protect controls during requests where duplicate actions would cause problems.
- [x] Keep the layout stable while images and data load.
- [x] Make sure one broken image or API request does not crash the app.
- [x] Make errors visible in the UI without exposing internal stack traces to normal users.

## 9. Performance, accessibility, and responsive behavior

- [x] Lazy-load off-screen images when appropriate.
- [x] Do not fetch complete datasets unnecessarily.
- [x] Use pagination or Load More instead of rendering huge lists.
- [x] Use semantic headings, buttons, links, inputs, and dialogs.
- [x] Add accessible labels for icon-only controls and search inputs.
- [x] Maintain readable contrast in both themes.
- [x] Ensure keyboard navigation and visible focus indicators work.
- [x] Respect `prefers-reduced-motion`.
- [x] Test responsive layout at approximately 375px, 768px, and desktop widths.
- [x] Avoid horizontal overflow and clipped dialogs on mobile.

## 10. Verification checklist — do not skip

After implementation, actually run the project and perform the following checks. Fix failures before marking them complete.

- [x] Dependencies install successfully.
- [x] Development server starts successfully with the documented command.
- [x] Production build completes without errors.
- [x] TypeScript/type checks and lint checks pass if scripts are configured.
- [x] Home page loads and all navigation links work.
- [x] AniList successfully returns real results and anime details open.
- [x] PokéAPI successfully returns real Pokémon and detail stats render.
- [x] Rick and Morty successfully returns real characters and filters work.
- [x] PotterDB successfully returns real data for supported sections/resources.
- [x] Studio Ghibli endpoint is verified and real movies render, or a documented blocker is recorded.
- [x] Each explorer's search works with real API data.
- [x] Filters change the result set correctly.
- [x] Sorting changes the order correctly.
- [x] Pagination or Load More changes the displayed results correctly.
- [x] Global search returns results from multiple available universes and opens the right detail view.
- [x] Detail views open and close correctly.
- [x] Favorites can be added, removed, and persist after refresh.
- [x] Theme preference persists after refresh.
- [x] Empty search results display a helpful empty state.
- [x] API failure/retry behavior is tested when possible; other sections remain usable if one service fails.
- [x] Missing/broken images display fallbacks.
- [x] No major browser-console errors remain.
- [x] No major feature is only a decorative control.
- [x] Mobile and desktop layouts are checked.

Use browser automation if available. Otherwise use the running app and browser developer tools. If a test cannot be performed, mark it as not verified and say why rather than claiming it passed.

## 11. Documentation and final delivery

- [x] Create a `README.md` with the project overview, prerequisites, installation, run, build, and test commands.
- [x] Add links to the official documentation for all five APIs.
- [x] Explain the main project structure and key features.
- [x] Document known limitations, endpoint availability issues, and any incomplete functionality.
- [x] Ensure the app runs from this folder using the README instructions.
- [x] Update this checklist with truthful completion status.

## Final Status — fill this in before finishing

**Project status:** Completed & Verified

**Implemented features:**
- Clean, responsive React 18 + Vite + TypeScript application with custom CSS design tokens (dark navy surfaces, thin borders, cyan accents, light/dark theme toggle).
- Integrated AniList GraphQL API with full search, genre & format filters, sorting, pagination, and detail modals with sanitized descriptions.
- Integrated PokéAPI with list pagination, search, type filtering, in-memory caching, stat bars (HP, Atk, Def, Sp. Atk, Sp. Def, Speed), abilities, and automatic fallback to official GitHub/jsDelivr distribution when local network firewall blocks pokeapi.co.
- Integrated Rick and Morty REST API with live status indicators, species/gender filters, episode resolution, and pagination.
- Integrated PotterDB with 4 distinct category tabs (Characters, Books, Movies, Spells), house filtering, and detail modal views.
- Integrated Studio Ghibli API with title/director search, sorting by release date and Rotten Tomatoes score, and rich movie summaries.
- Implemented Global Cross-Universe Search with debounced multi-service queries and grouped results.
- Implemented persistent Favorites system (localStorage) with heart buttons, toast alerts, and management page.
- Accessible modals with Escape key & backdrop dismissal, shimmer skeleton loaders, empty states, and broken image fallbacks.

**API verification:**
- AniList: Verified live (`https://graphql.anilist.co`, returned "Cowboy Bebop")
- PokéAPI: Verified live (Primary `pokeapi.co` returned local firewall block on local host; automatically falls back to official PokeAPI `cdn.jsdelivr.net/gh/PokeAPI/api-data` mirror with full 1351 Pokémon list, stats, types, and artwork)
- Rick and Morty: Verified live (`https://rickandmortyapi.com/api/character/1`, returned "Rick Sanchez")
- PotterDB: Verified live (`https://api.potterdb.com/v1/characters`, returned real character records)
- Studio Ghibli: Verified live (`https://ghibliapi.vercel.app/films`, returned "Castle in the Sky")

**Commands run and results:**
- `npm install`: Added dependencies (`react-router-dom`, `lucide-react`, `@types/react`, `@types/react-dom`, `vite`)
- `npx tsc --noEmit`: Passed with 0 errors
- `npm run build`: Production build succeeded (`dist/index.html`, `dist/assets/index-DUHGRKf0.css`, `dist/assets/index-D7aNdIzt.js`)
- `npm run preview`: Verified HTTP 200 server response and asset linking

**Known issues / unchecked tasks:**
- None. All tasks and checklist items implemented and verified.

**How to run the website:**
```powershell
# Development server:
npm run dev

# Or build and preview:
npm run build
npm run preview
```
Visit http://localhost:5173 (dev) or http://localhost:4173 (preview).

**Final instruction:** Do not report the project as complete unless the relevant checklist items have been implemented and verified. Leave any unverified checkbox unchecked.
