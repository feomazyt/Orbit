import { useState, useRef, useEffect } from 'react';
import type { ListEntity, CardEntity } from '@/shared/types';
import {
  useGetCardsQuery,
  useCreateCardMutation,
  useUpdateListMutation,
} from '@/shared/api';
import { Button, Input, useToast } from '@/shared/ui';

type KanbanColumnProps = {
  list: ListEntity;
  onCardClick: (card: CardEntity, listTitle: string) => void;
};

export function KanbanColumn({ list, onCardClick }: KanbanColumnProps) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [listTitle, setListTitle] = useState(list.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const { data: cards = [], isLoading: cardsLoading } = useGetCardsQuery(list.id);
  const [createCard, { isLoading: creating }] = useCreateCardMutation();
  const [updateList] = useUpdateListMutation();
  const { addToast } = useToast();

  useEffect(() => {
    setListTitle(list.title);
  }, [list.title]);

  useEffect(() => {
    if (isEditingTitle) titleInputRef.current?.focus();
  }, [isEditingTitle]);

  const handleSaveCard = async () => {
    const title = newCardTitle.trim();
    if (!title) return;
    try {
      await createCard({ listId: list.id, title }).unwrap();
      setNewCardTitle('');
      setIsAddingCard(false);
    } catch {
      addToast('Nie udało się dodać karty.', 'error');
    }
  };

  const handleSaveListTitle = () => {
    const title = listTitle.trim();
    if (title && title !== list.title) {
      updateList({ id: list.id, body: { title } });
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="w-80 shrink-0 flex flex-col bg-slate-200/30 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-200/50 dark:border-slate-700/50">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2 min-w-0">
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              value={listTitle}
              onChange={(e) => setListTitle(e.target.value)}
              onBlur={handleSaveListTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                }
              }}
              className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider bg-transparent border border-slate-300 dark:border-slate-600 rounded px-1 py-0.5 w-full max-w-[180px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
              aria-label="Nazwa listy"
            />
          ) : (
            <h3
              className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider truncate cursor-pointer hover:bg-slate-300/30 dark:hover:bg-slate-700/30 rounded px-1 -mx-1"
              onClick={() => setIsEditingTitle(true)}
              title="Kliknij, aby edytować"
            >
              {list.title}
            </h3>
          )}
          <span className="shrink-0 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-xs font-bold text-slate-600 dark:text-slate-400">
            {cards.length}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-0">
        {cardsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 h-24 animate-pulse"
              />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50">
            <span className="material-symbols-outlined text-3xl text-slate-400 dark:text-slate-500 mb-2">inbox</span>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1">Brak kart</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mb-3">Dodaj pierwszą kartę do tej listy.</p>
            <button
              type="button"
              onClick={() => setIsAddingCard(true)}
              className="text-xs font-semibold text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
            >
              Dodaj kartę
            </button>
          </div>
        ) : (
          cards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => onCardClick(card, list.title)}
              className="w-full text-left bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug truncate" title={card.title}>
                {card.title || 'Bez tytułu'}
              </h4>
            </button>
          ))
        )}

        {isAddingCard && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 space-y-2">
            <Input
              placeholder="Tytuł karty"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveCard();
                if (e.key === 'Escape') setIsAddingCard(false);
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="s" variant="primary" onClick={handleSaveCard} loading={creating} disabled={creating || !newCardTitle.trim()}>
                Zapisz
              </Button>
              <Button size="s" variant="ghost" onClick={() => { setIsAddingCard(false); setNewCardTitle(''); }}>
                Anuluj
              </Button>
            </div>
          </div>
        )}
      </div>

      {!isAddingCard && (
        <button
          type="button"
          onClick={() => setIsAddingCard(true)}
          className="mt-4 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-white/50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-white dark:hover:bg-slate-700 transition-all border border-dashed border-slate-300 dark:border-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Dodaj kartę
        </button>
      )}
    </div>
  );
}
