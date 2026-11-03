import { useEffect } from 'react';
import type { LegalDocument, LegalListItem } from '../../data/legalDocuments';

function ListItemContent({ item }: { item: LegalListItem }) {
  const text = item.href ? (
    <a
      href={item.href}
      target={item.href.startsWith('http') ? '_blank' : undefined}
      rel='noreferrer'
      className='text-brand-gold hover:underline'
    >
      {item.text}
    </a>
  ) : (
    item.text
  );

  if (!item.label) return <>{text}</>;

  return (
    <>
      <strong className='font-semibold text-brand-text'>{item.label}:</strong>{' '}
      {text}
    </>
  );
}

export default function LegalPage({ document }: { document: LegalDocument }) {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [document]);

  return (
    <main className='mx-auto w-full max-w-4xl px-4 py-10 sm:px-8 lg:py-16'>
      <div className='border-l border-brand-gold/40 pl-5 sm:pl-8'>
        <p className='text-xs uppercase tracking-[0.25em] text-brand-gold-alt'>
          {document.eyebrow}
        </p>
        <h1 className='mt-3 max-w-3xl text-3xl font-light uppercase tracking-[0.08em] sm:text-5xl'>
          {document.title}
        </h1>
        <p className='mt-4 text-xs uppercase tracking-[0.16em] text-brand-text-muted'>
          Última atualização: {document.updatedAt}
        </p>
        <p className='mt-6 max-w-2xl text-sm leading-relaxed text-brand-text-muted'>
          {document.intro}
        </p>
      </div>

      <div className='mt-10 border-t border-[#151b28]'>
        {document.sections.map((section, index) => (
          <section
            key={section.title}
            className='grid gap-3 border-b border-[#151b28] py-6 sm:grid-cols-[11rem_1fr] sm:gap-6'
          >
            <h2 className='text-xs font-semibold uppercase tracking-[0.16em] text-brand-text'>
              <span className='mr-2 text-brand-gold'>{index + 1}.</span>
              {section.title}
            </h2>
            <div className='space-y-4 text-sm leading-relaxed text-brand-text-muted'>
              {section.blocks.map((block, blockIndex) =>
                block.type === 'p' ? (
                  <p key={blockIndex}>{block.text}</p>
                ) : (
                  <ul key={blockIndex} className='space-y-3'>
                    {block.items.map((item) => (
                      <li key={item.label ?? item.text} className='flex gap-3'>
                        <span
                          aria-hidden='true'
                          className='mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-gold'
                        />
                        <span className='min-w-0'>
                          <ListItemContent item={item} />
                        </span>
                      </li>
                    ))}
                  </ul>
                ),
              )}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
