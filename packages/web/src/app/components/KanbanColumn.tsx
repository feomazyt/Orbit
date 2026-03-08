import { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { ListEntity, CardEntity } from '@/shared/types';
import { CARD_TYPES } from '@orbit/schemas';
import {
  useGetCardsQuery,
  useCreateCardMutation,
  useUpdateListMutation,
} from '@/shared/api';
import { Button, Input, Select, useToast } from '@/shared/ui';
import { SortableTaskCard } from '@/app/components/SortableTaskCard';

type KanbanColumnProps = {
  list: ListEntity;
  onCardClick: (card: CardEntity, listTitle: string) => void;
};

export function KanbanColumn({ list, onCardClick }: KanbanColumnProps) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardType, setNewCardType] = useState<string>(CARD_TYPES[0]);
  const [newCardDueDate, setNewCardDueDate] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [listTitle, setListTitle] = useState(list.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: list.id,
    data: { listId: list.id },
  });

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
      await createCard({
        listId: list.id,
        title,
        type: newCardType as (typeof CARD_TYPES)[number],
        dueDate: newCardDueDate ? new Date(newCardDueDate) : undefined,
        assigneeIds: [],
      }).unwrap();
      setNewCardTitle('');
      setNewCardType(CARD_TYPES[0]);
      setNewCardDueDate('');
      setIsAddingCard(false);
      addToast('Karta została dodana.', 'success');
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
    <div
      className={`w-80 shrink-0 flex flex-col rounded-xl p-3 border transition-colors ${
        isOver
          ? 'bg-primary/10 dark:bg-primary/20 border-primary/50 dark:border-primary/50'
          : 'bg-slate-200/30 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-700/50'
      }`}
      data-testid={`kanban-column-${list.id}`}
    >
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

      <div
        ref={setDroppableRef}
        className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-0"
      >
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
          <div
            className="flex flex-col items-center justify-center py-8 px-4 text-center rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 min-h-[120px]"
            aria-label={`Pusta lista ${list.title}. Upuść tutaj kartę.`}
          >
            <span className="material-symbols-outlined text-3xl text-slate-400 dark:text-slate-500 mb-2">inbox</span>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1">Brak kart</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mb-3">Dodaj pierwszą kartę lub upuść tutaj.</p>
            <button
              type="button"
              onClick={() => setIsAddingCard(true)}
              className="text-xs font-semibold text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
              data-testid="add-card-btn"
            >
              Dodaj kartę
            </button>
          </div>
        ) : (
          <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {cards.map((card) => (
              <SortableTaskCard
                key={card.id}
                card={card}
                listId={list.id}
                listTitle={list.title}
                onCardClick={onCardClick}
              />
            ))}
          </SortableContext>
        )}

        {isAddingCard && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 space-y-3">
            <Input
              placeholder="Tytuł karty"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveCard();
                if (e.key === 'Escape') setIsAddingCard(false);
              }}
              autoFocus
              data-testid="new-card-title"
            />
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Typ</label>
                <Select
                  value={newCardType}
                  onChange={(e) => setNewCardType(e.target.value)}
                  options={CARD_TYPES.map((t) => ({ value: t, label: t }))}
                  aria-label="Typ karty"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Termin</label>
                <input
                  type="date"
                  value={newCardDueDate}
                  onChange={(e) => setNewCardDueDate(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm px-3 py-2 focus:ring-primary focus:border-primary"
                  aria-label="Termin realizacji"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="s" variant="primary" onClick={handleSaveCard} loading={creating} disabled={creating || !newCardTitle.trim()} data-testid="save-card-btn">
                Zapisz
              </Button>
              <Button size="s" variant="ghost" onClick={() => { setIsAddingCard(false); setNewCardTitle(''); setNewCardType(CARD_TYPES[0]); setNewCardDueDate(''); }}>
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
          data-testid="add-card-btn"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Dodaj kartę
        </button>
      )}
    </div>
  );
}
