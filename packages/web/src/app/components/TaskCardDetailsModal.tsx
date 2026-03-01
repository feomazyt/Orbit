import { useEffect, useRef, useState } from 'react';
import {
  useGetCardQuery,
  useUpdateCardMutation,
  useGetCommentsQuery,
  useAddCommentMutation,
} from '@/shared/api';
import { Button, Modal, useToast } from '@/shared/ui';

type TaskCardDetailsModalProps = {
  cardId: string | null;
  boardTitle: string;
  listName?: string;
  onClose: () => void;
};

function formatDueDate(d: Date | null | undefined): string {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
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
  const titleRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const { data: card, isLoading } = useGetCardQuery(cardId!, { skip: !cardId });
  const { data: comments = [] } = useGetCommentsQuery(
    { cardId: cardId! },
    { skip: !cardId }
  );
  const [updateCard] = useUpdateCardMutation();
  const [addComment, { isLoading: addingComment }] = useAddCommentMutation();

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description ?? '');
    }
  }, [card]);

  useEffect(() => {
    if (cardId && card) titleRef.current?.focus();
  }, [cardId, card]);

  const handleTitleBlur = () => {
    if (!card || title.trim() === card.title) return;
    updateCard({ id: card.id, body: { title: title.trim() } })
      .unwrap()
      .catch(() => addToast('Nie udało się zapisać tytułu.', 'error'));
  };

  const saveDescription = () => {
    if (!card) return;
    const desc = description.trim();
    if (desc === (card.description ?? '')) return;
    updateCard({ id: card.id, body: { description: desc || undefined } })
      .unwrap()
      .catch(() => addToast('Nie udało się zapisać opisu.', 'error'));
  };

  const handleDescriptionBlur = () => {
    saveDescription();
  };

  const handleSendComment = async () => {
    const content = commentText.trim();
    if (!content || !cardId) return;
    try {
      await addComment({ cardId, body: { content } }).unwrap();
      setCommentText('');
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
              onBlur={handleTitleBlur}
              aria-label="Tytuł karty"
            />
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8 min-h-0">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Assignee</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">—</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Due Date</span>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-lg">calendar_today</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {card ? formatDueDate(card.dueDate ?? null) : '—'}
                </span>
              </div>
            </div>
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
              onBlur={handleDescriptionBlur}
              aria-label="Opis karty"
            />
            <div className="mt-2 flex justify-end">
              <Button size="s" variant="secondary" onClick={saveDescription}>
                Zapisz
              </Button>
            </div>
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
