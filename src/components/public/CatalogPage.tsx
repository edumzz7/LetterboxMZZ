import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  Star,
  Tv,
} from 'lucide-react';
import { useLocation } from 'wouter';
import {
  getCatalogGenres,
  getCatalogPage,
  getTvDetails,
  type CatalogFilters,
  type TMDBCatalogItem,
} from '../../lib/tmdb';

const PROVIDERS = [
  ['8', 'Netflix'],
  ['119', 'Prime Video'],
  ['1899', 'HBO Max'],
  ['337', 'Disney+'],
  ['531', 'Paramount+'],
  ['283', 'Crunchyroll'],
  ['47', 'Globoplay'],
  ['307', 'Lionsgate+'],
  ['618', 'Star+'],
  ['350', 'Apple TV+'],
];
const LANGUAGES = [
  ['en', 'Inglês'],
  ['es', 'Espanhol'],
  ['pt', 'Português'],
  ['fr', 'Francês'],
  ['ja', 'Japonês'],
  ['ko', 'Coreano'],
  ['it', 'Italiano'],
  ['de', 'Alemão'],
  ['zh', 'Chinês'],
  ['hi', 'Hindi'],
  ['ru', 'Russo'],
  ['tr', 'Turco'],
  ['sv', 'Sueco'],
  ['da', 'Dinamarquês'],
  ['no', 'Norueguês'],
];
const CERTIFICATIONS = ['L', '10', '12', '14', '16', '18'];
const SORT_OPTIONS = {
  movie: [
    ['popularity.desc', 'Popularidade'],
    ['vote_average.desc', 'Avalia\u00e7\u00e3o'],
    ['primary_release_date.desc', 'Ano'],
    ['original_title.asc', 'Nome'],
  ],
  tv: [
    ['popularity.desc', 'Popularidade'],
    ['vote_average.desc', 'Avalia\u00e7\u00e3o'],
    ['first_air_date.desc', 'Ano'],
    ['name.asc', 'Nome'],
  ],
} as const;

interface CatalogPageProps {
  type: 'movie' | 'tv';
  page: number;
}
function toggle(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export default function CatalogPage({ type, page }: CatalogPageProps) {
  const [location, setLocation] = useLocation();
  const params = useMemo(
    () => new URLSearchParams(location.split('?')[1] || ''),
    [location],
  );
  const sortOptions = SORT_OPTIONS[type];
  const requestedSort = params.get('sort');
  const [genres, setGenres] = useState<string[]>(
    () => params.get('genres')?.split(',').filter(Boolean) || [],
  );
  const [providers, setProviders] = useState<string[]>(
    () => params.get('providers')?.split(',').filter(Boolean) || [],
  );
  const [languages, setLanguages] = useState<string[]>(
    () => params.get('languages')?.split(',').filter(Boolean) || [],
  );
  const [sortBy, setSortBy] = useState(() =>
    sortOptions.some(([value]) => value === requestedSort)
      ? requestedSort!
      : 'popularity.desc',
  );
  const [rating, setRating] = useState(params.get('rating') || '');
  const [certification, setCertification] = useState(
    params.get('certification') || '',
  );
  const [minimumEpisodes, setMinimumEpisodes] = useState(
    params.get('episodesMin') || '',
  );
  const [maximumEpisodes, setMaximumEpisodes] = useState(
    params.get('episodesMax') || '',
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filters: CatalogFilters = {
    sortBy,
    genreIds: genres.map(Number),
    providerIds: providers.map(Number),
    languages,
    minimumRating: rating ? Number(rating) : undefined,
    certification: certification || undefined,
  };
  const genreQuery = useQuery({
    queryKey: ['public-catalog-genres', type],
    queryFn: () => getCatalogGenres(type),
    staleTime: 86_400_000,
  });
  const catalogQuery = useQuery({
    queryKey: ['public-catalog', type, page, filters],
    queryFn: () => getCatalogPage(type, page, filters),
    staleTime: 300_000,
  });
  const episodeQuery = useQuery({
    queryKey: [
      'public-catalog-episodes',
      page,
      catalogQuery.data?.results.map((item) => item.id).join(','),
    ],
    enabled:
      type === 'tv' &&
      Boolean(minimumEpisodes || maximumEpisodes || certification) &&
      Boolean(catalogQuery.data?.results.length),
    queryFn: async () =>
      Object.fromEntries(
        await Promise.all(
          (catalogQuery.data?.results || []).map(
            async (item) => [item.id, await getTvDetails(item.id)] as const,
          ),
        ),
      ),
  });
  const results = useMemo(() => {
    const items = catalogQuery.data?.results || [];
    if (
      type !== 'tv' ||
      (!minimumEpisodes && !maximumEpisodes && !certification)
    )
      return items;
    const min = Number(minimumEpisodes || 0);
    const max = Number(maximumEpisodes || Number.POSITIVE_INFINITY);
    return items.filter((item) => {
      const details = episodeQuery.data?.[item.id];
      const episodes = details?.number_of_episodes;
      const matchesEpisodes =
        !minimumEpisodes && !maximumEpisodes
          ? true
          : typeof episodes === 'number' && episodes >= min && episodes <= max;
      const matchesCertification =
        !certification || details?.certification === certification;
      return matchesEpisodes && matchesCertification;
    });
  }, [
    catalogQuery.data?.results,
    episodeQuery.data,
    certification,
    maximumEpisodes,
    minimumEpisodes,
    type,
  ]);
  const submitFilters = () => {
    const query = new URLSearchParams();
    if (genres.length) query.set('genres', genres.join(','));
    if (providers.length) query.set('providers', providers.join(','));
    if (languages.length) query.set('languages', languages.join(','));
    if (sortBy !== 'popularity.desc') query.set('sort', sortBy);
    if (rating) query.set('rating', rating);
    if (certification) query.set('certification', certification);
    if (minimumEpisodes) query.set('episodesMin', minimumEpisodes);
    if (maximumEpisodes) query.set('episodesMax', maximumEpisodes);
    setLocation(
      `/${type === 'movie' ? 'movies' : 'series'}${query.size ? `?${query.toString()}` : ''}`,
    );
    setFiltersOpen(false);
  };
  const reset = () => {
    setGenres([]);
    setProviders([]);
    setLanguages([]);
    setSortBy('popularity.desc');
    setRating('');
    setCertification('');
    setMinimumEpisodes('');
    setMaximumEpisodes('');
    setLocation(`/${type === 'movie' ? 'movies' : 'series'}`);
  };
  const routeFor = (target: number) =>
    `/${type === 'movie' ? 'movies' : 'series'}${target <= 1 ? '' : `/page/${target}`}${location.includes('?') ? `?${location.split('?')[1]}` : ''}`;
  const genresForType = (genreQuery.data || []).map((genre) => [
    String(genre.id),
    genre.name,
  ]);
  const mobileResultRows = Array.from(
    { length: Math.ceil(results.length / 5) },
    (_, index) => results.slice(index * 5, index * 5 + 5),
  );

  return (
    <main className='mx-auto w-full max-w-[1700px] min-w-0 overflow-x-hidden px-4 py-7 sm:px-6 lg:px-8'>
      <div className='mb-7'>
        <p className='text-xs uppercase tracking-[0.24em] text-brand-gold-alt'>
          Catálogo CineRats
        </p>
        <h1 className='mt-2 text-3xl font-light uppercase tracking-[0.08em] sm:text-4xl'>
          {type === 'movie' ? 'Filmes' : 'Séries'}
        </h1>
        <p className='mt-3 text-sm text-brand-text-muted'>
          {type === 'movie'
            ? 'Explore os filmes e suas principais informa\u00e7\u00f5es!'
            : 'Explore as s\u00e9ries e suas principais informa\u00e7\u00f5es!'}
        </p>
        <p className='mt-2 max-w-2xl text-[11px] leading-relaxed text-brand-text-muted/70'>
          Mídias com menos de 20 avaliações não são mostradas para não causar
          distorção, mas podem ser acessadas individualmente na barra de
          pesquisas do site.
        </p>
      </div>
      <div className='grid min-w-0 gap-6 lg:grid-cols-[270px_minmax(0,1fr)]'>
        <aside className='lg:block'>
          <button
            type='button'
            onClick={() => setFiltersOpen((value) => !value)}
            className='flex w-full items-center justify-between rounded-2xl border border-[#151b28] bg-[#06080d] px-4 py-3 text-xs font-semibold uppercase tracking-[0.15em] lg:hidden'
          >
            <span className='flex items-center gap-2'>
              <Filter size={15} className='text-brand-gold' />
              Filtros
            </span>
            <ChevronRight
              size={15}
              className={filtersOpen ? 'rotate-90' : ''}
            />
          </button>
          <div
            className={`${filtersOpen ? 'mt-3 block' : 'hidden'} space-y-5 rounded-3xl border border-[#151b28] bg-[#06080d] p-5 lg:mt-0 lg:block`}
          >
            <label className='block text-[10px] uppercase tracking-[0.18em] text-brand-text-muted'>
              Ordenar
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className='mt-2 w-full rounded-xl border border-[#222] bg-[#090d18] px-3 py-2 text-sm text-brand-text'
              >
                {sortOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <FilterGroup
              title='Gêneros'
              options={genresForType}
              selected={genres}
              onToggle={(value) => setGenres(toggle(genres, value))}
            />
            <FilterGroup
              title='Streaming no Brasil'
              options={PROVIDERS}
              selected={providers}
              onToggle={(value) => setProviders(toggle(providers, value))}
            />
            <FilterGroup
              title='Idioma original'
              options={LANGUAGES}
              selected={languages}
              onToggle={(value) => setLanguages(toggle(languages, value))}
            />
            <label className='block text-[10px] uppercase tracking-[0.18em] text-brand-text-muted'>
              Nota mínima
              <select
                value={rating}
                onChange={(event) => setRating(event.target.value)}
                className='mt-2 w-full rounded-xl border border-[#222] bg-[#090d18] px-3 py-2 text-sm text-brand-text'
              >
                <option value=''>Qualquer nota</option>
                {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((value) => (
                  <option key={value} value={value}>
                    {value === 5 ? 'Apenas 5.0' : `${value.toFixed(1)} ou mais`}
                  </option>
                ))}
              </select>
            </label>
            <label className='block text-[10px] uppercase tracking-[0.18em] text-brand-text-muted'>
              Classificação indicativa
              <select
                value={certification}
                onChange={(event) => setCertification(event.target.value)}
                className='mt-2 w-full rounded-xl border border-[#222] bg-[#090d18] px-3 py-2 text-sm text-brand-text'
              >
                <option value=''>Todas</option>
                {CERTIFICATIONS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            {type === 'tv' && (
              <div>
                <p className='text-[10px] uppercase tracking-[0.18em] text-brand-text-muted'>
                  Quantidade de episódios
                </p>
                <div className='mt-2 grid grid-cols-2 gap-2'>
                  <input
                    type='number'
                    min='0'
                    value={minimumEpisodes}
                    onChange={(event) => setMinimumEpisodes(event.target.value)}
                    placeholder='Mín.'
                    className='min-w-0 rounded-xl border border-[#222] bg-[#090d18] px-3 py-2 text-sm'
                  />
                  <input
                    type='number'
                    min='0'
                    value={maximumEpisodes}
                    onChange={(event) => setMaximumEpisodes(event.target.value)}
                    placeholder='Máx.'
                    className='min-w-0 rounded-xl border border-[#222] bg-[#090d18] px-3 py-2 text-sm'
                  />
                </div>
              </div>
            )}
            <div className='flex gap-2'>
              <button
                type='button'
                onClick={submitFilters}
                className='flex-1 rounded-xl bg-brand-gold px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-black'
              >
                Aplicar
              </button>
              <button
                type='button'
                onClick={reset}
                className='rounded-xl border border-[#222] px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-brand-text-muted'
              >
                Limpar
              </button>
            </div>
          </div>
        </aside>
        <section className='min-w-0'>
          {catalogQuery.isLoading ? (
            <div className='flex min-h-80 items-center justify-center gap-2 text-sm text-brand-text-muted'>
              <Loader2 size={18} className='animate-spin text-brand-gold' />
              Carregando títulos
            </div>
          ) : results.length ? (
            <div className='min-w-0'>
              <div className='space-y-4 sm:hidden'>
                {mobileResultRows.map((row, rowIndex) => (
                  <div key={rowIndex} className='min-w-0'>
                    {rowIndex === 0 && (
                      <div className='mb-2 flex items-center justify-end gap-1 text-[10px] uppercase tracking-[0.14em] text-brand-gold-alt'>
                        Deslize para ver a linha <ChevronRight size={13} />
                      </div>
                    )}
                    <div className='touch-pan-x snap-x snap-mandatory overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                      <div className='flex w-max gap-2 pr-4'>
                        {row.map((item) => (
                          <MediaCard
                            key={item.id}
                            item={item}
                            type={type}
                            episodes={episodeQuery.data?.[item.id]?.number_of_episodes}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className='hidden sm:grid sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-5'>
                {results.map((item) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    type={type}
                    episodes={episodeQuery.data?.[item.id]?.number_of_episodes}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className='rounded-3xl border border-[#151b28] bg-[#06080d] px-6 py-20 text-center text-sm text-brand-text-muted'>
              Nenhum título atende aos filtros desta página.
            </div>
          )}
          <div className='mt-8 flex items-center justify-center gap-3'>
            <button
              type='button'
              disabled={page <= 1}
              onClick={() => setLocation(routeFor(page - 1))}
              className='inline-flex h-10 items-center gap-1 rounded-xl border border-[#222] px-3 text-xs disabled:opacity-40'
            >
              <ChevronLeft size={15} />
              Anterior
            </button>
            <span className='text-xs text-brand-text-muted'>
              Página {page}
              {catalogQuery.data?.totalPages
                ? ` de ${catalogQuery.data.totalPages}`
                : ''}
            </span>
            <button
              type='button'
              disabled={
                !catalogQuery.data?.totalPages ||
                page >= catalogQuery.data.totalPages
              }
              onClick={() => setLocation(routeFor(page + 1))}
              className='inline-flex h-10 items-center gap-1 rounded-xl border border-[#222] px-3 text-xs disabled:opacity-40'
            >
              Próxima
              <ChevronRight size={15} />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
function FilterGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: string[][];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <p className='mb-2 text-[10px] uppercase tracking-[0.18em] text-brand-text-muted'>
        {title}
      </p>
      <div className='flex flex-wrap gap-1.5'>
        {options.map(([value, label]) => (
          <button
            key={value}
            type='button'
            onClick={() => onToggle(value)}
            className={`rounded-full border px-2 py-1 text-[10px] transition ${selected.includes(value) ? 'border-brand-gold/60 bg-brand-gold/10 text-brand-gold' : 'border-[#222] text-brand-text-muted hover:text-brand-text'}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
function MediaCard({
  item,
  type,
  episodes,
}: {
  item: TMDBCatalogItem;
  type: 'movie' | 'tv';
  episodes?: number;
}) {
  const [, setLocation] = useLocation();
  const title = item.title || item.name || 'Sem título';
  return (
    <button
      type='button'
      onClick={() =>
        setLocation(type === 'tv' ? `/serie/${item.id}` : `/filme/${item.id}`)
      }
      className='group w-[calc((100vw-5rem)/3.333)] flex-none snap-start text-left sm:w-auto sm:flex-auto sm:snap-none'
    >
      <div className='aspect-[2/3] overflow-hidden rounded-lg border border-[#222] bg-brand-card transition duration-300 group-hover:-translate-y-1 group-hover:border-brand-gold sm:rounded-xl'>
        {item.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
            alt={title}
            loading='lazy'
            className='h-full w-full object-cover transition duration-500 group-hover:scale-105'
          />
        ) : (
          <Tv className='m-auto h-full text-brand-text-muted' />
        )}
      </div>
      <h2 className='mt-1.5 truncate text-[11px] leading-tight text-brand-text group-hover:text-brand-gold sm:mt-2 sm:text-sm'>
        {title}
      </h2>
      <p className='mt-1 flex overflow-hidden whitespace-nowrap text-[8px] text-brand-text-muted sm:gap-1 sm:text-[10px]'>
        <Star size={10} className='fill-brand-gold text-brand-gold' />
        {(Number(item.vote_average || 0) / 2).toFixed(1)} TMDB{' '}
        {episodes ? `· ${episodes} eps.` : ''}
      </p>
    </button>
  );
}
