import { useEffect, useRef, useState, useCallback } from 'react';
import { CARD_TYPES } from '@orbit/schemas';
import {
  useGetCardQuery,
  useUpdateCardMutation,
  useGetCommentsQuery,
  useAddCommentMutation,
  useLazySearchUsersQuery,
  type UserSearchHit,
} from '@/shared/api';
import { Button, Modal, Select, useToast } from '@/shared/ui';

const ASSIGNEE_SEARCH_DEBOUNCE_MS = 300;

type TaskCardDetailsModalProps = {
  cardId: string | null;
  boardTitle: string;
  listName?: string;
  onClose: () => void;
};

function dueDateToInputValue(d: Date | string | null | undefined): string {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

function AssigneeChip({
  user,
  onRemove,
  disabled,
}: {
  user: UserSearchHit;
  onRemove: () => void;
  disabled?: boolean;
}) {
  const label = user.name ? `${user.name} (${user.email})` : user.email ?? user.id;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 dark:bg-slate-600 px-2.5 py-1 text-sm text-slate-800 dark:text-slate-200"
      title={user.email ?? ''}
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

export function TaskCardDetailsModal({
  cardId,
  boardTitle,
  listName,
  onClose,
}: TaskCardDetailsModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [commentText, setCommentText] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editType, setEditType] = useState<string>(CARD_TYPES[0]);
  const [editAssignees, setEditAssignees] = useState<UserSearchHit[]>([]);
  const [assigneeSearchQuery, setAssigneeSearchQuery] = useState('');
  const [assigneeDebouncedQuery, setAssigneeDebouncedQuery] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const { data: card, isLoading } = useGetCardQuery(cardId!, { skip: !cardId });
  const { data: comments = [] } = useGetCommentsQuery(
    { cardId: cardId! },
    { skip: !cardId }
  );
  const [updateCard, { isLoading: saving }] = useUpdateCardMutation();
  const [addComment, { isLoading: addingComment }] = useAddCommentMutation();
  const [searchUsers, { data: assigneeSearchResults = [], isFetching: assigneeSearchLoading }] =
    useLazySearchUsersQuery();

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description ?? '');
      setEditDueDate(dueDateToInputValue(card.dueDate));
      setEditType(card.type && CARD_TYPES.includes(card.type as (typeof CARD_TYPES)[number]) ? card.type : CARD_TYPES[0]);
      setEditAssignees(
        (card.assignees ?? []).map((a) => ({
          id: a.id,
          name: a.name,
          email: a.email ?? '',
        }))
      );
    }
  }, [card]);

  useEffect(() => {
    if (!assigneeSearchQuery.trim()) {
      setAssigneeDebouncedQuery('');
      return;
    }
    const t = setTimeout(
      () => setAssigneeDebouncedQuery(assigneeSearchQuery.trim()),
      ASSIGNEE_SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(t);
  }, [assigneeSearchQuery]);

  useEffect(() => {
    if (assigneeDebouncedQuery) searchUsers({ q: assigneeDebouncedQuery });
  }, [assigneeDebouncedQuery, searchUsers]);

  const addAssignee = useCallback((user: UserSearchHit) => {
    setEditAssignees((prev) =>
      prev.some((u) => u.id === user.id) ? prev : [...prev, user],
    );
  }, []);

  const removeAssignee = useCallback((userId: string) => {
    setEditAssignees((prev) => prev.filter((u) => u.id !== userId));
  }, []);

  useEffect(() => {
    if (cardId && card) titleRef.current?.focus();
  }, [cardId, card]);

  const cardAssigneeIds = (card?.assignees ?? []).map((a) => a.id).sort().join(',');
  const editAssigneeIds = editAssignees.map((u) => u.id).sort().join(',');
  const hasChanges =
    card &&
    (title.trim() !== card.title ||
      description.trim() !== (card.description ?? '') ||
      editDueDate !== dueDateToInputValue(card.dueDate) ||
      editType !== (card.type && CARD_TYPES.includes(card.type as (typeof CARD_TYPES)[number]) ? card.type : CARD_TYPES[0]) ||
      cardAssigneeIds !== editAssigneeIds);

  const handleSave = async () => {
    if (!card || !hasChanges) return;
    try {
      await updateCard({
        id: card.id,
        body: {
          title: title.trim(),
          description: description.trim() || undefined,
          dueDate: editDueDate.trim() ? new Date(editDueDate) : null,
          type: editType as (typeof CARD_TYPES)[number],
          assigneeIds: editAssignees.map((u) => u.id),
        },
      }).unwrap();
      addToast('Zmiany zapisane.', 'success');
    } catch {
      addToast('Nie udało się zapisać zmian.', 'error');
    }
  };

  const handleSendComment = async () => {
    const content = commentText.trim();
    if (!content || !cardId) return;
    try {
      await addComment({ cardId, body: { content } }).unwrap();
      setCommentText('');
      addToast('Komentarz dodany.', 'success');
    } catch {
      addToast('Nie udało się dodać komentarza.', 'error');
    }
  };

  if (!cardId) return null;

  const open = Boolean(cardId);

  return (
    <Modal open={open} onClose={onClose} maxWidth="md" title={undefined} fullScreenOnMobile>
      <div className="flex flex-col h-full min-h-0 -m-2">
        <div className="px-6 pt-2 pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-sm">view_kanban</span>
            <span>{boardTitle}</span>
          </div>
          {listName != null && listName !== '' && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">W liście: {listName}</p>
          )}
          {isLoading ? (
            <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
          ) : (
            <input
              ref={titleRef}
              className="w-full text-2xl font-bold text-slate-900 dark:text-white border-transparent bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-primary focus:ring-1 focus:ring-primary focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-2 -ml-2 transition-all"
              placeholder="Tytuł karty..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="Tytuł karty"
            />
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8 min-h-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col gap-2">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Typ zadania</span>
              <Select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                options={CARD_TYPES.map((t) => ({ value: t, label: t }))}
                aria-label="Typ karty"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Termin</span>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-lg shrink-0">calendar_today</span>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm px-3 py-2 focus:ring-primary focus:border-primary"
                  aria-label="Termin realizacji"
                />
              </div>
            </div>
          </div>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">person</span>
              <span className="text-slate-500 dark:text-slate-400 font-medium">Przypisani</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {editAssignees.length === 0 ? (
                <span className="text-slate-500 dark:text-slate-400 text-sm">Brak przypisanych</span>
              ) : (
                editAssignees.map((u) => (
                  <AssigneeChip
                    key={u.id}
                    user={u}
                    onRemove={() => removeAssignee(u.id)}
                  />
                ))
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                value={assigneeSearchQuery}
                onChange={(e) => setAssigneeSearchQuery(e.target.value)}
                placeholder="Szukaj użytkownika do przypisania..."
                className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm px-3 py-2 focus:ring-primary focus:border-primary"
                aria-label="Szukaj użytkownika"
              />
              {assigneeSearchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg z-10 max-h-48 overflow-y-auto">
                  {assigneeSearchLoading ? (
                    <div className="p-3 text-sm text-slate-500">Szukam...</div>
                  ) : assigneeSearchResults.length === 0 ? (
                    <div className="p-3 text-sm text-slate-500">Brak wyników</div>
                  ) : (
                    assigneeSearchResults
                      .filter((u) => !editAssignees.some((a) => a.id === u.id))
                      .map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => addAssignee(u)}
                          className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                        >
                          <span className="font-medium">{u.name ?? u.email}</span>
                          {u.email && u.name && (
                            <span className="text-slate-500 text-xs">{u.email}</span>
                          )}
                        </button>
                      ))
                  )}
                </div>
              )}
            </div>
          </section>

          <div className="flex justify-end">
            <Button
              size="m"
              variant="primary"
              onClick={handleSave}
              loading={saving}
              disabled={!hasChanges || saving}
            >
              Zapisz
            </Button>
          </div>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">subject</span>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Opis</h3>
            </div>
            <textarea
              className="w-full min-h-[120px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-primary focus:border-primary focus-visible:ring-2 focus-visible:ring-primary p-3 text-sm leading-relaxed"
              placeholder="Dodaj opis..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              aria-label="Opis karty"
            />
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">label</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">Etykiety: Coming soon</span>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">forum</span>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Komentarze</h3>
            </div>
            <div className="space-y-6">
              {comments.length === 0 ? (
                <div className="py-6 px-4 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-center">
                  <span className="material-symbols-outlined text-3xl text-slate-400 dark:text-slate-500 mb-2 block">forum</span>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Brak komentarzy</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Dodaj pierwszy komentarz poniżej.</p>
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300">
                      {c.user?.name ? c.user.name.slice(0, 2).toUpperCase() : '?'}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {c.user?.name ?? c.user?.email ?? 'Użytkownik'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {typeof c.createdAt === 'string'
                            ? new Date(c.createdAt).toLocaleString('pl-PL')
                            : c.createdAt.toLocaleString('pl-PL')}
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg rounded-tl-none text-sm text-slate-700 dark:text-slate-300">
                        {c.content}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-6 bg-slate-50/50 dark:bg-slate-900/50 mt-4">
          <div className="flex gap-4 items-start">
            <div className="shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs uppercase">
              +
            </div>
            <div className="flex-1 relative">
              <textarea
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pr-24 py-2 text-sm focus:ring-primary focus:border-primary focus-visible:ring-2 focus-visible:ring-primary min-h-[42px] max-h-32 resize-none"
                placeholder="Dodaj komentarz..."
                rows={1}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendComment();
                  }
                }}
                aria-label="Treść komentarza"
              />
              <div className="absolute right-2 top-1.5 flex gap-1">
                <Button
                  size="s"
                  variant="primary"
                  onClick={handleSendComment}
                  loading={addingComment}
                  disabled={addingComment || !commentText.trim()}
                >
                  Wyślij
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
