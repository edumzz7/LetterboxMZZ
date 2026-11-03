import { useLocation } from 'wouter';

const FOOTER_LINKS = [
  ['Qual é a proposta?', '/proposta'],
  ['FAQ', '/faq'],
  ['Contato', '/contato'],
  ['Política de Privacidade', '/privacidade'],
  ['Termos de Uso', '/termos'],
] as const;

export default function PublicFooter() {
  const [, setLocation] = useLocation();
  return (
    <footer className='mt-12 border-t border-[#151b28] bg-[#06080d] px-4 py-9 text-sm text-brand-text-muted'>
      <div className='mx-auto flex max-w-[1700px] flex-col justify-between gap-6 lg:flex-row lg:items-center'>
        <div>
          <p className='text-brand-text'>CineRats</p>
          <p className='mt-2 text-xs'>Sua cinemateca particular</p>
        </div>
        <div className='flex flex-wrap gap-x-5 gap-y-3 text-xs'>
          {FOOTER_LINKS.map(([label, path]) => (
            <button
              key={path}
              type='button'
              onClick={() => setLocation(path)}
              className='cursor-pointer hover:text-brand-gold'
            >
              {label}
            </button>
          ))}
          <a
            href='https://instagram.com/usecinerats'
            target='_blank'
            rel='noreferrer'
            className='cursor-pointer hover:text-brand-gold'
          >
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
