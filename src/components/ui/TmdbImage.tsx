import { useState, type ImgHTMLAttributes } from 'react';

const TMDB_WIDTHS = [92, 154, 185, 342, 500, 780, 1280];

function getResponsiveSources(src: string) {
  const match = src.match(/^(https?:\/\/image\.tmdb\.org\/t\/p\/)(w\d+|original)(\/.*)$/i);
  if (!match) return undefined;
  const [, origin, , path] = match;
  return TMDB_WIDTHS.map((width) => `${origin}w${width}${path} ${width}w`).join(', ');
}

interface TmdbImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'srcSet' | 'sizes'> {
  sizes?: string;
  responsive?: boolean;
  wrapperClassName?: string;
}

export default function TmdbImage({ src, alt, className = '', wrapperClassName = '', sizes = '(max-width: 639px) 30vw, (max-width: 1279px) 20vw, 18vw', responsive = true, onLoad, onError, ...props }: TmdbImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const srcSet = responsive && src ? getResponsiveSources(src) : undefined;

  return (
    <span className={`relative block overflow-hidden bg-[#101522] ${wrapperClassName || 'h-full w-full'}`}>
      {!loaded && !failed && <span aria-hidden="true" className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#101522] via-[#1a2130] to-[#101522]" />}
      {!failed && src && (
        <img
          {...props}
          src={src}
          srcSet={srcSet}
          sizes={srcSet ? sizes : undefined}
          alt={alt}
          loading={props.loading || 'lazy'}
          decoding="async"
          onLoad={(event) => { setLoaded(true); onLoad?.(event); }}
          onError={(event) => { setFailed(true); onError?.(event); }}
          className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      {failed && <span aria-hidden="true" className="absolute inset-0 bg-[#101522]" />}
    </span>
  );
}
