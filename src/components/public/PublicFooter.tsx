import { Film } from 'lucide-react';
import { useLocation } from 'wouter';

export default function PublicFooter() {
  const [, setLocation] = useLocation();
  return (
    <footer className='mt-12 border-t border-[#151b28] bg-[#06080d] px-4 py-9 text-sm text-brand-text-muted'>
      <div className='mx-auto flex max-w-[1700px] flex-col justify-between gap-6 sm:flex-row sm:items-center'>
        <div>
          <p className='flex items-center gap-2 text-brand-text'>
            <Film size={15} className='text-brand-gold' /> CineRats
          </p>
          <p className='mt-2 text-xs'>Sua cinemateca particular</p>
        </div>
        <div className='flex flex-wrap gap-x-5 gap-y-3 text-xs'>
          <button
            type='button'
            onClick={() => setLocation('/proposta')}
            className='cursor-pointer hover:text-brand-gold'
          >
            Qual é a proposta?
          </button>
          <button
            type='button'
            onClick={() => setLocation('/contato')}
            className='cursor-pointer hover:text-brand-gold'
          >
            Contato
          </button>
          <button
            type='button'
            onClick={() => setLocation('/faq')}
            className='cursor-pointer hover:text-brand-gold'
          >
            FAQ
          </button>
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
