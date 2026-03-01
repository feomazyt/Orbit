import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCreateBoardMutation,
  useLazySearchUsersQuery,
  type UserSearchHit,
} from '@/shared/api';
import { BOARD_TYPES, PRIORITY_LEVELS } from '@orbit/schemas';
import { Button, Input, Modal, Select, Textarea, useToast } from '@/shared/ui';

const TYPE_OPTIONS = BOARD_TYPES.map((t) => ({ value: t, label: t }));
const PRIORITY_OPTIONS = PRIORITY_LEVELS.map((p) => ({
  value: p.value,
  label: p.label,
}));

const DEFAULT_TYPE = BOARD_TYPES[0];
const DEFAULT_PRIORITY = 3;
const SEARCH_DEBOUNCE_MS = 300;

type CreateBoardModalProps = {
  open: boolean;
  onClose: () => void;
};

function UserChip({
  user,
  onRemove,
  disabled,
}: {
  user: UserSearchHit;
  onRemove: () => void;
  disabled?: boolean;
}) {
  const label = user.name ? `${user.name} (${user.email})` : user.email;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 dark:bg-slate-600 px-2.5 py-1 text-sm text-slate-800 dark:text-slate-200"
      title={user.email}
    >
      <span className="truncate max-w-[140px]">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="rounded-full p-0.5 hover:bg-slate-300 dark:hover:bg-slate-500 disabled:opacity-50"
        aria-label={`Usuń ${label}`}
      >
        <span className="text-slate-600 dark:text-slate-300">×</span>
      </button>
    </span>
  );
}

export function CreateBoardModal({ open, onClose }: CreateBoardModalProps) {
  const [createBoard] = useCreateBoardMutation();
  const [searchUsers, { data: searchResults = [], isFetching: searchLoading }] =
    useLazySearchUsersQuery();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<string>(DEFAULT_TYPE);
  const [priorityLevel, setPriorityLevel] = useState<number>(DEFAULT_PRIORITY);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<UserSearchHit[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setDebouncedQuery('');
      return;
    }
    const t = setTimeout(
      () => setDebouncedQuery(searchQuery.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedQuery) searchUsers({ q: debouncedQuery });
  }, [debouncedQuery, searchUsers]);

  const addUser = useCallback((user: UserSearchHit) => {
    setSelectedUsers((prev) =>
      prev.some((u) => u.id === user.id) ? prev : [...prev, user],
    );
  }, []);

  const removeUser = useCallback((id: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Podaj nazwę tablicy.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const board = await createBoard({
        title: trimmed,
        description: description.trim() || undefined,
        type: type as (typeof BOARD_TYPES)[number],
        priorityLevel,
        memberIds: selectedUsers.map((u) => u.id),
      }).unwrap();
      addToast('Tablica została utworzona.', 'success');
      onClose();
      setTitle('');
      setDescription('');
      setType(DEFAULT_TYPE);
      setPriorityLevel(DEFAULT_PRIORITY);
      setSearchQuery('');
      setDebouncedQuery('');
      setSelectedUsers([]);
      navigate(`/boards/${board.id}`);
    } catch {
      addToast('Nie udało się utworzyć tablicy.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setTitle('');
      setDescription('');
      setType(DEFAULT_TYPE);
      setPriorityLevel(DEFAULT_PRIORITY);
      setSearchQuery('');
      setDebouncedQuery('');
      setSelectedUsers([]);
      setError('');
      onClose();
    }
  };

  const selectedIds = new Set(selectedUsers.map((u) => u.id));
  const resultsToShow = searchResults.filter((u) => !selectedIds.has(u.id));

  return (
    <Modal open={open} onClose={handleClose} title="Nowa tablica" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Nazwa"
          placeholder="np. Marketing Q4"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={error}
          autoFocus
          disabled={submitting}
        />
        <Textarea
          label="Opis (opcjonalny)"
          placeholder="Krótki opis tablicy..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={submitting}
          rows={3}
        />
        <Select
          label="Rodzaj"
          options={TYPE_OPTIONS}
          value={type}
          onChange={(e) => setType(e.target.value)}
          disabled={submitting}
        />
        <Select
          label="Priorytet"
          options={PRIORITY_OPTIONS}
          value={priorityLevel}
          onChange={(e) => setPriorityLevel(Number(e.target.value))}
          disabled={submitting}
        />

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900 dark:text-slate-200">
            Dodaj użytkowników (opcjonalnie)
          </label>
          <Input
            placeholder="Szukaj po nazwie lub e-mailu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={submitting}
          />
          {searchLoading && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Szukam…
            </p>
          )}
          {debouncedQuery && !searchLoading && (
            <ul className="max-h-40 overflow-y-auto rounded-md border border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700">
              {resultsToShow.length === 0 ? (
                <li className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                  Brak użytkowników
                </li>
              ) : (
                resultsToShow.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center justify-between gap-2 px-3 py-2"
                  >
                    <span className="text-sm text-slate-800 dark:text-slate-200 truncate">
                      {user.name ? `${user.name} (${user.email})` : user.email}
                    </span>
                    <Button
                      type="button"
                      variant="secondary"
                      size="s"
                      onClick={() => addUser(user)}
                      disabled={submitting}
                    >
                      Dodaj
                    </Button>
                  </li>
                ))
              )}
            </ul>
          )}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {selectedUsers.map((user) => (
                <UserChip
                  key={user.id}
                  user={user}
                  onRemove={() => removeUser(user.id)}
                  disabled={submitting}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            size="m"
            onClick={handleClose}
            disabled={submitting}
          >
            Anuluj
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="m"
            loading={submitting}
            disabled={submitting}
          >
            Zapisz
          </Button>
        </div>
      </form>
    </Modal>
  );
}
