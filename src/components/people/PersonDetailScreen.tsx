import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, Clapperboard, Film, MapPin, Tv, UserRound } from 'lucide-react';
import { useLocation } from 'wouter';
import { getPersonDetailsWithCredits, type TMDBCombinedCredit } from '../../lib/tmdb';
import TmdbImage from '../ui/TmdbImage';
import FavoritePersonButton from './FavoritePersonButton';
import { DetailPageSkeleton } from '../ui/LoadingSkeleton';

type PersonPageMode = 'actor' | 'director';

interface PersonDetailScreenProps {
  id: string;
  mode: PersonPageMode;
  currentUserId?: string | null;
}

function getCreditDate(credit: TMDBCombinedCredit) {
  return credit.media_type === 'movie' ? credit.release_date : credit.first_air_date;
}

function getAge(birthday: string | null, deathday: string | null) {
  if (!birthday) return 'Não informada';

  const birth = new Date(`${birthday}T00:00:00`);
  const end = new Date(`${deathday || new Date().toISOString().slice(0, 10)}T00:00:00`);
  let age = end.getFullYear() - birth.getFullYear();
  const birthdayNotReached = end.getMonth() < birth.getMonth()
    || (end.getMonth() === birth.getMonth() && end.getDate() < birth.getDate());
  if (birthdayNotReached) age -= 1;

  return deathday ? `${age} anos (falecido)` : `${age} anos`;
}

function getCreditTitle(credit: TMDBCombinedCredit) {
  return credit.media_type === 'movie' ? credit.title : credit.name;
}

export default function PersonDetailScreen({ id, mode, currentUserId = null }: PersonDetailScreenProps) {
  const [, setLocation] = useLocation();
  const [expandedFilmographyKey, setExpandedFilmographyKey] = useState<string | null>(null);
  const [expandedBiographyKey, setExpandedBiographyKey] = useState<string | null>(null);
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    setLocation('/');
  };
  const numericId = Number(id);
  const isValidId = Number.isInteger(numericId) && numericId > 0;
  const personQuery = useQuery({
    queryKey: ['tmdb-person-details', id],
    queryFn: () => getPersonDetailsWithCredits(id),
    enabled: isValidId,
    staleTime: 1000 * 60 * 10,
  });

  const person = personQuery.data;
  const filmography = useMemo(() => {
    if (!person) return [];

    const source = mode === 'actor'
      ? person.combined_credits?.cast || []
      : (person.combined_credits?.crew || []).filter((credit) => credit.job === 'Director' || credit.job === 'Creator');
    const uniqueCredits = new Map<string, TMDBCombinedCredit>();

    for (const credit of source) {
      if ((credit.media_type !== 'movie' && credit.media_type !== 'tv') || !getCreditTitle(credit)) continue;
      const key = `${credit.media_type}-${credit.id}`;
      if (!uniqueCredits.has(key)) uniqueCredits.set(key, credit);
    }

    return [...uniqueCredits.values()].sort((first, second) => {
      const firstDate = getCreditDate(first) || '';
      const secondDate = getCreditDate(second) || '';
      return secondDate.localeCompare(firstDate);
    });
  }, [mode, person]);

  if (personQuery.isLoading) {
    return <DetailPageSkeleton title="Carregando artista" />;
  }

  if (!person || !isValidId) {
    return (
      <div className="py-20 text-center">
        <UserRound className="mx-auto mb-4 text-brand-text-muted" size={36} />
        <h1 className="text-xl font-light text-brand-text">Pessoa não encontrada</h1>
        <button type="button" onClick={handleBack} className="mt-5 cursor-pointer text-xs uppercase tracking-widest text-brand-gold hover:underline">Voltar ao painel</button>
      </div>
    );
  }

  const photoUrl = person.profile_path ? `https://image.tmdb.org/t/p/w500${person.profile_path}` : null;
  const isActorPage = mode === 'actor';
  const sectionTitle = isActorPage ? 'Filmografia como ator/atriz' : 'Filmografia como direção/criação';
  const movieCount = filmography.filter((credit) => credit.media_type === 'movie').length;
  const seriesCount = filmography.filter((credit) => credit.media_type === 'tv').length;
  const filmographyKey = `${mode}:${id}`;
  const showAllFilmography = expandedFilmographyKey === filmographyKey;
  const visibleFilmography = showAllFilmography ? filmography : filmography.slice(0, 10);
  const heroPhotoUrl = person.profile_path ? `https://image.tmdb.org/t/p/original${person.profile_path}` : null;
  const biography = person.biography?.trim() || '';
  const biographyKey = `biography:${mode}:${id}`;
  const showFullBiography = expandedBiographyKey === biographyKey;
  const hasLongBiography = biography.length > 300;
  const visibleBiography = showFullBiography || !hasLongBiography ? biography : biography.slice(0, 300).trimEnd();

  return (
    <div className="flex-1 min-w-0 animate-in fade-in duration-500">
      <div className="relative -mx-4 sm:-mx-7 lg:-mx-9 -mt-4 sm:-mt-7 lg:-mt-9 h-44 sm:h-52 lg:h-56 overflow-hidden rounded-t-3xl bg-[#090d16]">
        {heroPhotoUrl && <><TmdbImage src={heroPhotoUrl} alt="" sizes="100vw" loading="eager" className="h-full w-full object-cover object-top opacity-40 blur-[1px] scale-110" /><div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" /></>}
        <button type="button" onClick={handleBack} className="absolute left-6 top-6 z-10 flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-black/60 px-4 py-2 text-xs uppercase tracking-widest text-brand-text backdrop-blur-md transition-all hover:border-brand-gold/30 hover:text-brand-gold">
          <ArrowLeft size={14} /> Painel
        </button>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 px-0 sm:px-4 -mt-16 sm:-mt-20 lg:-mt-24 md:items-start md:flex-row">
        <div className="mx-auto flex h-56 w-44 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#222] bg-[#050811] shadow-2xl shadow-black/80 md:mx-0 sm:h-64 sm:w-48">
          {photoUrl ? <TmdbImage src={photoUrl} alt={person.name} sizes="192px" className="h-full w-full object-cover" /> : <UserRound className="text-[#333]" size={42} />}
        </div>

        <div className="flex w-full min-w-0 flex-1 flex-col items-center gap-5 text-center md:items-start md:pt-8 md:text-left">
          <div className="w-full text-center md:text-left">
            <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-brand-gold-alt">{isActorPage ? 'Ator / atriz' : 'Diretor / diretora'}</p>
            <h1 className="break-words text-center text-3xl font-extralight uppercase tracking-wide text-brand-text sm:text-4xl md:text-left md:text-5xl">{person.name}</h1>
            {person.known_for_department && <p className="mt-2 text-xs uppercase tracking-widest text-brand-text-muted">{person.known_for_department}</p>}
          </div>

          <FavoritePersonButton
            currentUserId={currentUserId}
            person={{
              tmdbPersonId: numericId,
              name: person.name,
              profilePath: person.profile_path ?? null,
              department: isActorPage ? 'Acting' : 'Directing',
            }}
          />

          <div className="mx-auto grid w-full max-w-[18rem] grid-cols-2 gap-2 text-center md:mx-0 md:max-w-3xl md:grid-cols-3 md:text-left">
            <div className="rounded-2xl border border-[#151515] bg-black/20 p-3"><CalendarDays size={14} className="mx-auto mb-2 text-brand-gold md:mx-0" /><span className="block text-[9px] uppercase tracking-widest text-brand-text-muted">Idade</span><span className="text-xs font-light text-brand-text sm:text-sm">{getAge(person.birthday, person.deathday)}</span></div>
            <div className="rounded-2xl border border-[#151515] bg-black/20 p-3"><MapPin size={14} className="mx-auto mb-2 text-brand-gold md:mx-0" /><span className="block text-[9px] uppercase tracking-widest text-brand-text-muted">Local de nascimento</span><span className="block break-words text-xs font-light text-brand-text sm:text-sm">{person.place_of_birth || 'Não informado'}</span></div>
            <div className="col-span-2 mx-auto w-full max-w-[10rem] rounded-2xl border border-[#151515] bg-black/20 p-3 md:col-span-1 md:max-w-none"><Film size={14} className="mx-auto mb-2 text-brand-gold md:mx-0" /><span className="block text-[9px] uppercase tracking-widest text-brand-text-muted">Obras</span><span className="text-xs font-light text-brand-text sm:text-sm">{movieCount} filmes • {seriesCount} séries</span></div>
          </div>
        </div>
      </div>

      <div className="mt-12 space-y-10">
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-gold">Biografia</h2>
          {biography ? <><p className="max-w-4xl text-sm font-light leading-relaxed text-brand-text/90">{visibleBiography}{hasLongBiography && !showFullBiography && <><span>…</span>{' '}<button type="button" onClick={() => setExpandedBiographyKey(biographyKey)} className="cursor-pointer font-semibold text-brand-gold transition hover:text-brand-gold-alt">Mostrar mais</button></>}</p>{hasLongBiography && showFullBiography && <button type="button" onClick={() => setExpandedBiographyKey(null)} className="cursor-pointer text-xs font-semibold uppercase tracking-widest text-brand-gold transition hover:text-brand-gold-alt">Mostrar menos</button>}</> : <p className="text-sm italic text-brand-text-muted">Biografia não disponível no momento.</p>}
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3"><Clapperboard size={18} className="text-brand-gold" /><h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-gold">{sectionTitle}</h2></div>
          {filmography.length ? (
            <>
              <div className="mx-auto grid w-full max-w-[18rem] grid-cols-2 gap-3 sm:max-w-none sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
                {visibleFilmography.map((credit) => {
                  const title = getCreditTitle(credit) || 'Título não informado';
                  const year = getCreditDate(credit)?.slice(0, 4);
                  const isMovie = credit.media_type === 'movie';
                  return <button key={`${credit.media_type}-${credit.id}`} type="button" onClick={() => setLocation(isMovie ? `/filme/${credit.id}` : `/serie/${credit.id}`)} className="group cursor-pointer overflow-hidden rounded-2xl border border-[#151515] bg-black/20 text-left transition hover:-translate-y-1 hover:border-brand-gold/40">
                    <div className="aspect-[2/3] bg-[#0a0f1e]">{credit.poster_path ? <TmdbImage src={`https://image.tmdb.org/t/p/w342${credit.poster_path}`} alt={title} sizes="(max-width: 639px) 36vw, 140px" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center">{isMovie ? <Film size={24} className="text-[#333]" /> : <Tv size={24} className="text-[#333]" />}</div>}</div>
                    <div className="space-y-1.5 p-3"><p className="truncate text-xs font-medium text-brand-text">{title}</p><p className="text-[10px] uppercase tracking-wider text-brand-text-muted">{isMovie ? 'Filme' : 'Série'}{year ? ` • ${year}` : ''}</p>{(credit.character || credit.job) && <p className="truncate text-[10px] text-brand-gold-alt">{credit.character || credit.job}</p>}</div>
                  </button>;
                })}
              </div>
              {filmography.length > 10 && <div className="pt-2 text-center"><button type="button" onClick={() => setExpandedFilmographyKey(showAllFilmography ? null : filmographyKey)} className="cursor-pointer rounded-xl border border-brand-gold/30 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-brand-gold transition hover:bg-brand-gold/10">{showAllFilmography ? 'Mostrar menos' : `Mostrar todos (${filmography.length})`}</button></div>}
            </>
          ) : <p className="text-sm text-brand-text-muted">Nenhum crédito compatível encontrado.</p>}
        </section>
      </div>
    </div>
  );
}
