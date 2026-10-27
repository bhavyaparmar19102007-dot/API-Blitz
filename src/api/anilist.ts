import type { AniListMedia, AniListPage } from '../types';

const ANILIST_URL = 'https://graphql.anilist.co';

const MEDIA_QUERY = `
query ($page: Int, $perPage: Int, $search: String, $genre: String, $format: MediaFormat, $sort: [MediaSort]) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total currentPage lastPage hasNextPage perPage }
    media(search: $search, genre: $genre, format: $format, sort: $sort, type: ANIME) {
      id
      title { romaji english native }
      coverImage { large medium }
      bannerImage
      description(asHtml: false)
      genres
      averageScore
      popularity
      episodes
      format
      status
      seasonYear
      season
      studios(isMain: true) { nodes { name } }
    }
  }
}`;

const DETAIL_QUERY = `
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    title { romaji english native }
    coverImage { large medium }
    bannerImage
    description(asHtml: false)
    genres
    averageScore
    popularity
    episodes
    format
    status
    seasonYear
    season
    studios(isMain: true) { nodes { name } }
  }
}`;

export interface AniListFilters {
  search?: string;
  genre?: string;
  format?: string;
  sort?: string;
  page?: number;
  perPage?: number;
}

async function gqlFetch<T>(query: string, variables: Record<string, any>, signal?: AbortSignal): Promise<T> {
  const res = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, variables }),
    signal,
  });
  if (!res.ok) throw new Error(`AniList HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data;
}

export async function fetchAnime(filters: AniListFilters, signal?: AbortSignal): Promise<AniListPage> {
  const variables: Record<string, any> = {
    page: filters.page ?? 1,
    perPage: filters.perPage ?? 20,
  };
  if (filters.search) variables.search = filters.search;
  if (filters.genre) variables.genre = filters.genre;
  if (filters.format) variables.format = filters.format;
  if (filters.sort) variables.sort = [filters.sort];
  else variables.sort = ['POPULARITY_DESC'];

  const data = await gqlFetch<{ Page: AniListPage }>(MEDIA_QUERY, variables, signal);
  return data.Page;
}

export async function fetchAnimeById(id: number, signal?: AbortSignal): Promise<AniListMedia> {
  const data = await gqlFetch<{ Media: AniListMedia }>(DETAIL_QUERY, { id }, signal);
  return data.Media;
}

export const ANILIST_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Ecchi', 'Fantasy',
  'Horror', 'Mahou Shoujo', 'Mecha', 'Music', 'Mystery', 'Psychological',
  'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller',
];

export const ANILIST_FORMATS = [
  { value: 'TV', label: 'TV' },
  { value: 'TV_SHORT', label: 'TV Short' },
  { value: 'MOVIE', label: 'Movie' },
  { value: 'SPECIAL', label: 'Special' },
  { value: 'OVA', label: 'OVA' },
  { value: 'ONA', label: 'ONA' },
  { value: 'MUSIC', label: 'Music' },
];

export const ANILIST_SORTS = [
  { value: 'POPULARITY_DESC', label: 'Most Popular' },
  { value: 'SCORE_DESC', label: 'Highest Rated' },
  { value: 'TRENDING_DESC', label: 'Trending' },
  { value: 'START_DATE_DESC', label: 'Newest' },
  { value: 'FAVOURITES_DESC', label: 'Most Favourited' },
];

export async function searchAnimeForGlobal(search: string, signal?: AbortSignal): Promise<AniListMedia[]> {
  const page = await fetchAnime({ search, page: 1, perPage: 5 }, signal);
  return page.media;
}
