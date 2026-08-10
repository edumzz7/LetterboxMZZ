import { useState, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Download, Instagram, Star, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import { usePersonalMovies } from '../../hooks/usePersonalMovies';
import { useSeries } from '../../hooks/useSeries';
import { generateImagePath } from '../../lib/imageUtils';

interface ShareReviewModalProps {
  currentUserId: string;
  currentDisplayName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SharedItem {
  id: string;
  type: 'movie' | 'series';
  titulo: string;
  capa_url: string | null;
  rating: number | null;
  review: string | null;
  created_at: string;
}

export default function ShareReviewModal({
  currentUserId,
  currentDisplayName,
  open,
  onOpenChange,
}: ShareReviewModalProps) {
  const { moviesQuery } = usePersonalMovies(currentUserId);
  const { seriesQuery } = useSeries(currentUserId);

  const movies = moviesQuery.data || [];
  const series = seriesQuery.data || [];
  
  // Apenas filmes assistidos
  const watchedMovies: SharedItem[] = movies
    .filter((m) => m.status === 'watched')
    .map((m) => ({
      id: m.id,
      type: 'movie',
      titulo: m.titulo,
      capa_url: m.capa_url,
      rating: m.rating ?? m.avaliacao ?? null,
      review: m.review ?? null,
      created_at: m.created_at,
    }));

  // Apenas séries assistidas
  const watchedSeries: SharedItem[] = series
    .filter((s) => s.status === 'watched')
    .map((s) => ({
      id: s.id,
      type: 'series',
      titulo: s.titulo,
      capa_url: s.capa_url,
      rating: s.rating ?? s.avaliacao ?? null,
      review: s.review ?? null,
      created_at: s.created_at,
    }));

  const combinedItems = [...watchedMovies, ...watchedSeries]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const ratedItems = combinedItems.filter((item) => Number.isFinite(Number(item.rating)) && Number(item.rating) > 0);

  const [selectedKey, setSelectedKey] = useState<string>(''); // Formato: type-id (ex: "movie-123")
  const [mediaFilter, setMediaFilter] = useState<'all' | 'movie' | 'series'>('all');
  const [titleFilter, setTitleFilter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const postRefPhoto = useRef<HTMLDivElement>(null);
  const postRefDark = useRef<HTMLDivElement>(null);

  const filteredItems = ratedItems.filter((item) => {
    const matchesType = mediaFilter === 'all' || item.type === mediaFilter;
    const matchesTitle = item.titulo.toLocaleLowerCase().includes(titleFilter.trim().toLocaleLowerCase());
    return matchesType && matchesTitle;
  });

  const selectedItem = ratedItems.find(item => `${item.type}-${item.id}` === selectedKey);

  // Rewrite TMDB image URLs to go through our proxy (same-origin, no CORS issues)
  const getProxiedImageUrl = (item: SharedItem | undefined) => {
    if (!item) return null;
    const rawUrl = generateImagePath(item.titulo, item.capa_url);
    if (!rawUrl) return null;
    // Rewrite https://image.tmdb.org/t/p/
    if (rawUrl.includes('image.tmdb.org/t/p/')) {
      return rawUrl.replace('https://image.tmdb.org/t/p/', '/tmdb-img/');
    }
    return rawUrl;
  };

  const coverImageUrl = selectedItem ? getProxiedImageUrl(selectedItem) : null;

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setTimeout(() => {
        setSelectedKey('');
        setMediaFilter('all');
        setTitleFilter('');
        setGeneratedImages([]);
        setCurrentImageIndex(0);
        setIsGenerating(false);
      }, 300);
    }
  };

  const generateImage = async () => {
    if (!postRefPhoto.current || !postRefDark.current || !selectedItem) return;
    setIsGenerating(true);
    setGeneratedImages([]);
    setCurrentImageIndex(0);

    try {
      // Wait briefly for the proxy image to load in the hidden div
      await new Promise(resolve => setTimeout(resolve, 500));

      const opts = { scale: 2, useCORS: true, backgroundColor: '#0f0f0f' };

      const canvasPhoto = await html2canvas(postRefPhoto.current, opts);
      const dataUrlPhoto = canvasPhoto.toDataURL('image/png');

      const canvasDark = await html2canvas(postRefDark.current, { ...opts, backgroundColor: '#0a0f1e' });
      const dataUrlDark = canvasDark.toDataURL('image/png');

      setGeneratedImages([dataUrlPhoto, dataUrlDark]);
    } catch (error) {
      console.error('Falha ao gerar imagem', error);
      alert('Houve um erro ao gerar a imagem: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedImages.length === 0 || !selectedItem) return;
    const link = document.createElement('a');
    link.href = generatedImages[currentImageIndex];
    const styleName = currentImageIndex === 0 ? 'foto' : 'escuro';
    link.download = `review-${selectedItem.titulo.toLowerCase().replace(/\s+/g, '-')}-${styleName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (generatedImages.length === 0 || !selectedItem) return;

    try {
      const response = await fetch(generatedImages[currentImageIndex]);
      const blob = await response.blob();
      const styleName = currentImageIndex === 0 ? 'foto' : 'escuro';
      const file = new File([blob], `review-${selectedItem.titulo.toLowerCase().replace(/\s+/g, '-')}-${styleName}.png`, { type: 'image/png' });

      if (!navigator.share || !navigator.canShare || !navigator.canShare({ files: [file] })) {
        alert('O compartilhamento de imagens não está disponível neste dispositivo. Baixe a imagem e poste manualmente no Instagram.');
        return;
      }

      await navigator.share({
        files: [file],
        title: 'Resenha CineRats',
        text: `Confira minha resenha de ${selectedItem.titulo} no CineRats!`,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.error('Falha ao compartilhar', error);
      alert('Não foi possível abrir o compartilhamento. Você pode baixar a imagem e postar manualmente.');
    }
  };

  const renderStars = (rating?: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex items-center justify-center gap-1 mt-2" style={{ color: '#D4AF37' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={40}
            color="#D4AF37"
            fill={i < Math.floor(rating) ? "#D4AF37" : "transparent"}
            style={{ opacity: i < Math.floor(rating) ? 1 : 0.3 }}
          />
        ))}
        {rating % 1 !== 0 && (
          <Star size={40} color="#D4AF37" fill="#D4AF37" className="absolute" style={{ opacity: 0.5, clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0% 100%)' }} />
        )}
      </div>
    );
  };

  const truncateReview = (text: string) => {
    const MAX_CHARS = 220;
    if (text.length <= MAX_CHARS) return text;
    return text.substring(0, MAX_CHARS).trim() + '...';
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 flex max-h-[calc(100dvh-1rem)] w-[calc(100vw-1.5rem)] max-w-xl translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-2xl border border-[#222] bg-brand-bg p-4 shadow-lg sm:max-h-[90vh] sm:p-6">
          <Dialog.Title className="mb-4 flex shrink-0 items-center gap-2 pr-8 text-base uppercase tracking-[0.18em] text-brand-gold sm:text-lg">
            <Instagram size={20} /> Postar no Instagram
          </Dialog.Title>

          {generatedImages.length === 0 && (
            <div className="flex min-h-0 flex-col gap-4 overflow-y-auto pr-1">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.14em] text-brand-text-muted">
                  Escolha o tipo de mídia
                </p>
                <div className="grid grid-cols-3 gap-2" role="group" aria-label="Filtrar tipo de mídia">
                  {([
                    ['all', 'Todos'],
                    ['movie', 'Filmes'],
                    ['series', 'Séries'],
                  ] as const).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMediaFilter(value)}
                      aria-pressed={mediaFilter === value}
                      className={`rounded-xl border px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition ${mediaFilter === value ? 'border-brand-gold/60 bg-brand-gold/10 text-brand-gold' : 'border-[#222] bg-[#151515] text-brand-text-muted hover:border-brand-gold/40 hover:text-brand-text'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="share-review-title-filter" className="mb-2 block text-xs uppercase tracking-[0.14em] text-brand-text-muted">
                  Filtrar por título
                </label>
                <input
                  id="share-review-title-filter"
                  type="search"
                  value={titleFilter}
                  onChange={(event) => setTitleFilter(event.target.value)}
                  placeholder="Digite o nome da mídia"
                  className="w-full rounded-xl border border-[#222] bg-[#151515] px-3 py-3 text-sm text-brand-text placeholder-brand-text-muted/50 transition focus:border-brand-gold/40 focus:outline-none"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-brand-text-muted">Mídias avaliadas</p>
                  <span className="text-[10px] uppercase tracking-[0.12em] text-brand-text-muted/70">{filteredItems.length} encontrada{filteredItems.length === 1 ? '' : 's'}</span>
                </div>
                <div className="flex max-h-[min(42vh,380px)] flex-col gap-2 overflow-y-auto pr-1">
                  {filteredItems.map((item) => {
                    const itemKey = `${item.type}-${item.id}`;
                    const isSelected = selectedKey === itemKey;
                    const tag = item.type === 'movie' ? 'Filme' : 'Série';
                    return (
                      <button
                        key={itemKey}
                        type="button"
                        onClick={() => setSelectedKey(itemKey)}
                        aria-pressed={isSelected}
                        className={`flex min-w-0 items-center gap-3 rounded-xl border p-2 text-left transition ${isSelected ? 'border-brand-gold/70 bg-brand-gold/10' : 'border-[#222] bg-[#151515] hover:border-brand-gold/40'}`}
                      >
                        <div className="h-14 w-10 shrink-0 overflow-hidden rounded-md bg-black">
                          {getProxiedImageUrl(item) ? <img src={getProxiedImageUrl(item) || undefined} alt={item.titulo} className="h-full w-full object-cover" /> : null}
                        </div>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-brand-text">{item.titulo}</span>
                          <span className="mt-1 block text-[10px] uppercase tracking-[0.12em] text-brand-text-muted">{tag} · {item.rating} / 5</span>
                        </span>
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${isSelected ? 'border-brand-gold bg-brand-gold text-brand-bg' : 'border-[#444] text-transparent'}`} aria-hidden="true">✓</span>
                      </button>
                    );
                  })}
                  {filteredItems.length === 0 && (
                    <p className="rounded-xl border border-dashed border-[#333] px-4 py-6 text-center text-sm text-brand-text-muted">
                      {ratedItems.length === 0 ? 'Você ainda não possui mídias avaliadas para compartilhar.' : 'Nenhuma mídia avaliada corresponde aos filtros.'}
                    </p>
                  )}
                </div>
              </div>

              {selectedItem && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={generateImage}
                    disabled={isGenerating}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-brand-bg transition hover:bg-brand-gold/90 disabled:opacity-50 sm:w-auto"
                  >
                    {isGenerating ? 'Gerando...' : 'Gerar Imagem'}
                  </button>
                </div>
              )}
            </div>
          )}

          {generatedImages.length > 0 && (
            <div className="flex min-h-0 flex-col items-center gap-3 overflow-y-auto pr-1 sm:gap-4">
              <p className="shrink-0 text-xs uppercase tracking-[0.14em] text-brand-text-muted">Preview da Imagem</p>
              
              <div className="grid w-full min-w-0 grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center justify-items-center gap-2 sm:gap-3">
                {generatedImages.length > 1 ? (
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? generatedImages.length - 1 : prev - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#222] bg-[#151515] p-3 text-white transition hover:border-brand-gold/40 hover:text-brand-gold active:scale-95"
                    title="Versão anterior"
                    aria-label="Versão anterior"
                  >
                    &#8592;
                  </button>
                ) : <div aria-hidden="true" />}
                
                <div className="relative aspect-[9/16] w-full max-w-[270px] overflow-hidden rounded-lg border border-brand-gold/30 bg-black shadow-2xl">
                  <img src={generatedImages[currentImageIndex]} alt="Preview" className="absolute inset-0 h-full w-full object-cover" />
                </div>

                {generatedImages.length > 1 ? (
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === generatedImages.length - 1 ? 0 : prev + 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#222] bg-[#151515] p-3 text-white transition hover:border-brand-gold/40 hover:text-brand-gold active:scale-95"
                    title="Próxima versão"
                    aria-label="Próxima versão"
                  >
                    &#8594;
                  </button>
                ) : <div aria-hidden="true" />}
              </div>

              <div className="flex w-full shrink-0 items-center justify-center gap-2">
                {generatedImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition ${idx === currentImageIndex ? 'bg-brand-gold w-4' : 'bg-[#444]'}`}
                  />
                ))}
              </div>

              <div className="grid w-full shrink-0 grid-cols-3 gap-2 pt-1 sm:gap-3">
                <button
                  onClick={() => { setGeneratedImages([]); setCurrentImageIndex(0); }}
                  className="min-w-0 rounded-xl border border-[#333] px-2 py-3 text-[10px] uppercase tracking-[0.1em] text-brand-text transition hover:border-brand-gold/40 sm:px-4 sm:text-xs sm:tracking-[0.14em]"
                >
                  Voltar
                </button>
                <button
                  onClick={handleDownload}
                  className="flex min-w-0 items-center justify-center gap-1 rounded-xl border border-[#333] bg-white/10 px-2 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-text transition hover:bg-white/20 sm:gap-2 sm:px-4 sm:text-xs sm:tracking-[0.14em]"
                >
                  <Download size={14} /> <span>Baixar</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex min-w-0 items-center justify-center gap-1 rounded-xl bg-brand-gold px-2 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-bg transition hover:bg-brand-gold/90 sm:gap-2 sm:px-4 sm:text-xs sm:tracking-[0.14em]"
                >
                  <Instagram size={14} /> <span>Postar</span>
                </button>
              </div>
            </div>
          )}

          <Dialog.Close asChild>
            <button className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 hover:text-brand-gold outline-none">
              <X size={16} />
            </button>
          </Dialog.Close>
        </Dialog.Content>

        {/* COMPONENTE OCULTO PARA RENDERIZAÇÃO (1080x1920) */}
        {selectedItem && (
          <div className="fixed top-0 pointer-events-none flex" style={{ left: '-9999px', zIndex: -9999 }}>
            
            {/* VARIANTE 1: Fundo com a Foto */}
            <div
              ref={postRefPhoto}
              className="relative flex flex-col items-center overflow-hidden"
              style={{ width: '1080px', height: '1920px', backgroundColor: '#0f0f0f' }}
            >
              {/* Background Decorativo e Fundo */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  opacity: 0.2,
                  backgroundImage: coverImageUrl ? `url(${coverImageUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              
              {/* Container Principal */}
              <div className="z-10 flex flex-col w-full h-full p-24">
                {/* HEADER (Logo) */}
                <div className="w-full flex justify-center mb-16" style={{ opacity: 0.8 }}>
                  <div 
                    className="text-3xl tracking-[0.3em] font-light uppercase pb-4 px-12"
                    style={{ color: '#D4AF37', borderBottom: '2px solid rgba(212, 175, 55, 0.3)' }}
                  >
                    CineRats
                  </div>
                </div>

                {/* MEIO (Capa e Título) */}
                <div className="flex-1 flex flex-col items-center justify-center w-full">
                  <div 
                    className="w-[600px] h-[900px] rounded-xl overflow-hidden mb-16 relative flex items-center justify-center"
                    style={{ 
                       backgroundColor: '#1a1a1a', 
                       boxShadow: '0 0 80px rgba(212, 175, 55, 0.15)',
                       border: '4px solid rgba(212, 175, 55, 0.4)'
                    }}
                  >
                    {coverImageUrl ? (
                      <img 
                        src={coverImageUrl} 
                        alt="Capa" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-4xl font-light uppercase tracking-widest" style={{ color: '#666666' }}>
                        Sem Capa
                      </div>
                    )}
                  </div>
                  
                  <h2 className="text-6xl font-light text-center px-12 leading-tight uppercase tracking-wider mb-8" style={{ color: '#ffffff' }}>
                    {selectedItem.titulo}
                  </h2>
                  
                  {renderStars(selectedItem.rating)}
                </div>

                {/* TEXTO (Resenha) */}
                <div className="h-[350px] w-full flex items-center justify-center px-16">
                  {selectedItem.review ? (
                    <p className="text-4xl text-center font-light leading-[1.6] italic" style={{ color: '#d1d5db' }}>
                      "{truncateReview(selectedItem.review)}"
                    </p>
                  ) : (
                    <div className="text-3xl uppercase tracking-widest font-light" style={{ color: '#6b7280' }}>
                      {selectedItem.type === 'movie' ? 'Avaliado no CineRats' : 'Avaliada no CineRats'}
                    </div>
                  )}
                </div>

                {/* RODAPÉ (Usuário) */}
                <div className="w-full flex justify-between items-end pt-12 mt-8" style={{ borderTop: '1px solid #333333' }}>
                  <div className="flex flex-col">
                    <span className="text-2xl uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(212, 175, 55, 0.7)' }}>
                      {selectedItem.type === 'movie' ? 'Filme' : 'Série'} • Resenha por
                    </span>
                    <span className="text-4xl font-medium tracking-wide" style={{ color: '#ffffff' }}>
                      {currentDisplayName}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* VARIANTE 2: Fundo Azul Escuro */}
            <div
              ref={postRefDark}
              className="relative flex flex-col items-center overflow-hidden"
              style={{ width: '1080px', height: '1920px', backgroundColor: '#0a0f1e' }}
            >
              <div className="z-10 flex flex-col w-full h-full p-24">
                <div className="w-full flex justify-center mb-16" style={{ opacity: 0.8 }}>
                  <div 
                    className="text-3xl tracking-[0.3em] font-light uppercase pb-4 px-12"
                    style={{ color: '#D4AF37', borderBottom: '2px solid rgba(212, 175, 55, 0.3)' }}
                  >
                    CineRats
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center w-full">
                  <div 
                    className="w-[600px] h-[900px] rounded-xl overflow-hidden mb-16 relative flex items-center justify-center"
                    style={{ 
                       backgroundColor: '#1a1a1a', 
                       boxShadow: '0 0 80px rgba(212, 175, 55, 0.15)',
                       border: '4px solid rgba(212, 175, 55, 0.4)'
                    }}
                  >
                    {coverImageUrl ? (
                      <img 
                        src={coverImageUrl} 
                        alt="Capa" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-4xl font-light uppercase tracking-widest" style={{ color: '#666666' }}>
                        Sem Capa
                      </div>
                    )}
                  </div>
                  
                  <h2 className="text-6xl font-light text-center px-12 leading-tight uppercase tracking-wider mb-8" style={{ color: '#ffffff' }}>
                    {selectedItem.titulo}
                  </h2>
                  
                  {renderStars(selectedItem.rating)}
                </div>

                <div className="h-[350px] w-full flex items-center justify-center px-16">
                  {selectedItem.review ? (
                    <p className="text-4xl text-center font-light leading-[1.6] italic" style={{ color: '#d1d5db' }}>
                      "{truncateReview(selectedItem.review)}"
                    </p>
                  ) : (
                    <div className="text-3xl uppercase tracking-widest font-light" style={{ color: '#6b7280' }}>
                      {selectedItem.type === 'movie' ? 'Avaliado no CineRats' : 'Avaliada no CineRats'}
                    </div>
                  )}
                </div>

                <div className="w-full flex justify-between items-end pt-12 mt-8" style={{ borderTop: '1px solid #333333' }}>
                  <div className="flex flex-col">
                    <span className="text-2xl uppercase tracking-[0.2em] mb-2" style={{ color: 'rgba(212, 175, 55, 0.7)' }}>
                      {selectedItem.type === 'movie' ? 'Filme' : 'Série'} • Resenha por
                    </span>
                    <span className="text-4xl font-medium tracking-wide" style={{ color: '#ffffff' }}>
                      {currentDisplayName}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </Dialog.Portal>
    </Dialog.Root>
  );
}
