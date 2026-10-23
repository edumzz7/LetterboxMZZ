import { useMemo, useState } from 'react';
import clsx from 'clsx';
import AvatarDisplay from '../layout/AvatarDisplay';
import { useUsers } from '../../hooks/useUsers';

export const MIN_SUGGESTION_CHARS = 3;
const MAX_SUGGESTIONS = 6;

interface InviteUserInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Members and users with a pending invite/request: never suggested. */
  excludedUserIds: string[];
  disabled?: boolean;
}

/** "@usuario" field that suggests users from 3 typed characters, like the main search. */
export default function InviteUserInput({ value, onChange, excludedUserIds, disabled }: InviteUserInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const usersQuery = useUsers(true);

  const term = value.trim().replace(/^@/, '').toLowerCase();
  const suggestions = useMemo(() => {
    if (term.length < MIN_SUGGESTION_CHARS) return [];
    const excluded = new Set(excludedUserIds);
    return (usersQuery.data ?? [])
      .filter(
        (user) =>
          !excluded.has(user.id) &&
          (user.username.toLowerCase().includes(term) || user.display_name?.toLowerCase().includes(term)),
      )
      .slice(0, MAX_SUGGESTIONS);
  }, [excludedUserIds, term, usersQuery.data]);

  const showList = isOpen && suggestions.length > 0;

  const select = (username: string) => {
    onChange(`@${username}`);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showList) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      // Enter picks the highlighted suggestion instead of submitting the form.
      event.preventDefault();
      select(suggestions[activeIndex].username);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative min-w-0 flex-1">
      <input
        id="group-invite-username"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onKeyDown={handleKeyDown}
        placeholder="@usuario"
        autoComplete="off"
        disabled={disabled}
        role="combobox"
        aria-expanded={showList}
        aria-controls="group-invite-suggestions"
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `group-invite-option-${activeIndex}` : undefined}
        className="w-full rounded-2xl border border-[#222] bg-[#090d18] px-4 py-2.5 text-sm text-brand-text placeholder:text-brand-text-muted/60 focus:border-brand-gold focus:outline-none disabled:opacity-50"
      />
      {showList && (
        <ul
          id="group-invite-suggestions"
          role="listbox"
          aria-label="Sugestões de usuários"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-72 overflow-y-auto rounded-xl border border-[#222] bg-[#0A0F1E] p-1 shadow-[0_18px_40px_rgba(0,0,0,0.5)]"
        >
          {suggestions.map((user, index) => (
            <li
              key={user.id}
              id={`group-invite-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              // mousedown keeps the input focused, so blur does not close the list first.
              onMouseDown={(event) => {
                event.preventDefault();
                select(user.username);
              }}
              className={clsx(
                'flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 transition',
                index === activeIndex ? 'bg-brand-gold/10' : 'hover:bg-white/5',
              )}
            >
              <AvatarDisplay avatarId={user.avatar_id} className="h-7 w-7" emojiClassName="text-sm" />
              <span className="min-w-0 truncate text-xs text-brand-text">
                {user.display_name || user.username}{' '}
                <span className="text-brand-text-muted">@{user.username}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
