import { useId, useState } from 'react';
import { Loader2, MessageCircle, Send, ThumbsDown, ThumbsUp } from 'lucide-react';

import { useCreateReviewCommentMutation, useReviewComments, useReviewReactionMutation } from '../../hooks/useReviews';
import { normalizeAvatarPath } from '../../lib/appData';
import type { PublicReview } from '../../lib/appData';
import AvatarDisplay from './AvatarDisplay';

export default function ReviewInteractions({ review }: { review: PublicReview }) {
  const vote = useReviewReactionMutation(review.id);
  const reaction = review.myReaction;
  const counts = { like: review.likes ?? 0, dislike: review.dislikes ?? 0 };
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const commentCount = review.commentCount ?? 0;
  const commentsQuery = useReviewComments(review.id, isOpen || commentCount > 0);
  const publishComment = useCreateReviewCommentMutation(review.id);
  const comments = commentsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const visibleComments = isOpen ? comments : comments.slice(0, 2);
  const commentsId = useId();
  const inputId = useId();

  function addComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || content.length > 2000 || publishComment.isPending) return;
    publishComment.mutate(content, { onSuccess: () => setDraft('') });
  }

  return (
    <div className="mt-4 border-t border-white/10 pt-3 sm:pt-4">
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-black/20 p-1 sm:flex sm:flex-wrap sm:gap-2 sm:bg-transparent sm:p-0">
        {([
          { value: 'like', label: 'Concordar', Icon: ThumbsUp },
          { value: 'dislike', label: 'Discordar', Icon: ThumbsDown },
        ] as const).map(({ value, label, Icon }) => (
          <button
            key={value}
            type="button"
            aria-label={label}
            aria-pressed={reaction === value}
            disabled={vote.isPending}
            onClick={() => vote.mutate(reaction === value ? null : value)}
            className={`flex min-h-8 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg border px-1 py-0.5 sm:py-2 text-[11px] font-medium transition disabled:cursor-wait disabled:opacity-60 active:scale-95 sm:min-h-10 sm:flex-row sm:gap-2 sm:px-3 sm:text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold ${reaction === value ? 'border-brand-gold/40 bg-brand-gold/10 text-brand-gold' : 'border-transparent text-brand-text-muted hover:border-brand-gold/30 hover:text-brand-text sm:border-white/10'}`}
          >
            <span className="flex items-center gap-1.5"><Icon size={17} /><span className="tabular-nums sm:hidden">{counts[value]}</span></span>
            <span className="hidden sm:inline">{label}</span>
            <span className="hidden tabular-nums sm:inline">{counts[value]}</span>
          </button>
        ))}
        <button
          type="button"
          aria-label="Comentar"
          aria-expanded={isOpen}
          aria-controls={commentsId}
          onClick={() => setIsOpen((current) => !current)}
          className={`flex min-h-8 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg border px-1 py-0.5 sm:py-2 text-[11px] font-medium transition active:scale-95 sm:min-h-10 sm:flex-row sm:gap-2 sm:px-3 sm:text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold ${isOpen ? 'border-brand-gold/40 bg-brand-gold/10 text-brand-gold' : 'border-transparent text-brand-text-muted hover:text-brand-text sm:border-white/10'}`}
        >
          <span className="flex items-center gap-1.5"><MessageCircle size={17} /><span className="tabular-nums sm:hidden">{commentCount}</span></span>
          <span className="hidden sm:inline">Comentar</span><span className="hidden tabular-nums sm:inline">{commentCount}</span>
        </button>
      </div>

      {vote.isError && (
        <p role="alert" className="mt-3 text-xs text-red-300">{vote.error.message || 'Não foi possível salvar seu voto. Tente novamente.'}</p>
      )}

      {(isOpen || commentCount > 0) && (
        <div id={commentsId} className="mt-4 space-y-4 border-t border-white/5 pt-4">
          <div aria-live="polite" className="space-y-3">
            {commentsQuery.isLoading && <p role="status" className="flex items-center gap-2 text-xs text-brand-text-muted"><Loader2 size={14} className="animate-spin" />Carregando comentários…</p>}
            {commentsQuery.isError && (
              <div role="alert" className="text-xs text-red-300">
                Não foi possível carregar os comentários.
                <button type="button" onClick={() => void commentsQuery.refetch()} className="ml-2 min-h-10 underline">Tentar novamente</button>
              </div>
            )}
            {commentsQuery.isSuccess && comments.length === 0 && <p className="text-xs text-brand-text-muted">Seja o primeiro a comentar.</p>}
            {visibleComments.map((comment) => (
              <div key={comment.id} className="flex min-w-0 items-start gap-2.5">
                <AvatarDisplay avatarId={normalizeAvatarPath(comment.avatarPath, comment.userId, null).avatarId} className="h-8 w-8 shrink-0 border border-white/10" emojiClassName="text-sm" />
                <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm bg-brand-card p-3">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <span className="font-semibold text-brand-text">{comment.username}</span>
                  <span className="text-brand-text-muted">{new Date(comment.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-brand-text/90 [overflow-wrap:anywhere]">{comment.content}</p>
                </div>
              </div>
            ))}
            {!isOpen && (comments.length > 2 || commentsQuery.hasNextPage) && (
              <button
                type="button"
                aria-expanded={false}
                aria-controls={commentsId}
                onClick={() => setIsOpen(true)}
                className="min-h-11 w-full rounded-xl border border-white/10 px-3 py-2 text-xs text-brand-text-muted transition hover:border-brand-gold/30 hover:text-brand-text"
              >
                Ver mais comentários
              </button>
            )}
            {isOpen && commentsQuery.hasNextPage && (
              <button type="button" disabled={commentsQuery.isFetchingNextPage} onClick={() => void commentsQuery.fetchNextPage()} className="min-h-11 w-full rounded-xl border border-white/10 px-3 py-2 text-xs text-brand-text-muted disabled:opacity-50">
                {commentsQuery.isFetchingNextPage ? 'Carregando…' : 'Ver comentários anteriores'}
              </button>
            )}
          </div>
          {isOpen && <form onSubmit={addComment} className="space-y-3 rounded-2xl border border-white/10 bg-brand-card/50 p-3 sm:p-4">
            <label htmlFor={inputId} className="block text-xs font-medium text-brand-text">Seu comentário</label>
            <textarea
              id={inputId}
              value={draft}
              disabled={publishComment.isPending}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={2000}
              rows={3}
              enterKeyHint="enter"
              placeholder="Compartilhe o que achou desta resenha…"
              className="block min-h-24 w-full resize-y rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-base sm:text-sm text-brand-text placeholder:text-brand-text-muted focus:border-brand-gold/50 focus:outline-none"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-brand-text-muted">{draft.length}/2000</span>
              <button type="submit" disabled={!draft.trim() || publishComment.isPending} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-gold px-4 py-2 text-xs font-semibold text-black transition active:scale-95 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"><Send size={14} /><span>{publishComment.isPending ? 'Publicando…' : <>Publicar<span className="hidden sm:inline"> comentário</span></>}</span></button>
            </div>
            {publishComment.isError && <p role="alert" className="text-xs text-red-300">{publishComment.error.message || 'Não foi possível publicar. Seu texto foi mantido para tentar novamente.'}</p>}
          </form>}
        </div>
      )}
    </div>
  );
}
