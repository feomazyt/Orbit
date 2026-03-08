import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore, useDispatch } from 'react-redux';
import type { AppDispatch, RootState } from '@/app/store';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  useGetBoardQuery,
  useGetListsQuery,
  useUpdateBoardMutation,
  useDeleteBoardMutation,
  useMoveCardMutation,
  api,
} from '@/shared/api';
import { Button, useToast } from '@/shared/ui';
import { KanbanColumn } from '@/app/components/KanbanColumn';
import { AddListBlock } from '@/app/components/AddListBlock';
import { TaskCardDetailsModal } from '@/app/components/TaskCardDetailsModal';
import type { CardEntity, ListEntity } from '@/shared/types';
import { useBoardRealtime } from '@/shared/realtime/useBoardRealtime';

export function BoardDetailPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const [selectedCard, setSelectedCard] = useState<{ card: CardEntity; listTitle: string } | null>(null);
  const [activeDragCard, setActiveDragCard] = useState<CardEntity | null>(null);
  const [activeDragListTitle, setActiveDragListTitle] = useState('');
  const [boardMenuOpen, setBoardMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [boardTitle, setBoardTitle] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();
  const store = useStore<RootState>();
  const dispatch = useDispatch<AppDispatch>();

  const { data: board, isLoading: boardLoading, error: boardError } = useGetBoardQuery(boardId!, {
    skip: !boardId,
  });
  const { data: lists = [], isLoading: listsLoading } = useGetListsQuery(boardId!, {
    skip: !boardId,
  });

  const [updateBoard] = useUpdateBoardMutation();
  const [deleteBoard, { isLoading: deleting }] = useDeleteBoardMutation();
  const [moveCard] = useMoveCardMutation();

  useBoardRealtime(boardId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const data = active.data?.current as { card?: CardEntity; listId?: string } | undefined;
      if (!data?.card) return;

      const listTitle = (lists as ListEntity[]).find((l) => l.id === data.listId)?.title ?? '';
      setActiveDragCard(data.card);
      setActiveDragListTitle(listTitle);
    },
    [lists]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setActiveDragCard(null);
      setActiveDragListTitle('');

      const sourceListId = active.data?.current?.listId as string | undefined;
      if (!sourceListId) return;

      const state = store.getState();
      const listIds = (lists as ListEntity[]).map((l) => l.id);
      const getCachedCards = (listId: string): CardEntity[] => {
        const result = (api.endpoints as { getCards: { select: (arg: string) => (s: RootState) => { data?: CardEntity[] } } }).getCards.select(listId)(state);
        return result?.data ?? [];
      };

      let targetListId: string;
      let targetIndex: number;

      if (listIds.includes(over.id as string)) {
        targetListId = over.id as string;
        const targetCards = getCachedCards(targetListId);
        targetIndex = targetCards.length;
      } else {
        targetListId = (over.data?.current?.listId as string) ?? sourceListId;
        const targetCards = getCachedCards(targetListId);
        const overIndex = targetCards.findIndex((c) => c.id === over.id);
        targetIndex = overIndex >= 0 ? overIndex : 0;
      }

      const sourceCards = getCachedCards(sourceListId);
      const sourceIndex = sourceCards.findIndex((c) => c.id === active.id);
      if (sourceIndex < 0) return;
      if (sourceListId === targetListId && sourceIndex === targetIndex) return;

      const movedCard = sourceCards.find((c) => c.id === active.id);
      if (!movedCard) return;

      const prevSource = [...sourceCards];
      const prevTarget = [...getCachedCards(targetListId)];

      const updateCardsCache = (
        listId: string,
        update: (draft: CardEntity[]) => void
      ) => {
        (dispatch as (action: unknown) => unknown)(
          (api.util.updateQueryData as (endpoint: string, arg: string, update: (draft: CardEntity[]) => void) => unknown)(
            'getCards',
            listId,
            update
          )
        );
      };

      updateCardsCache(sourceListId, (draft) => {
        const idx = draft.findIndex((c) => c.id === active.id);
        if (idx !== -1) draft.splice(idx, 1);
      });
      updateCardsCache(targetListId, (draft) => {
        const inserted = { ...movedCard, listId: targetListId, position: targetIndex };
        draft.splice(targetIndex, 0, inserted);
      });

      moveCard({
        id: active.id as string,
        body: { listId: targetListId, position: targetIndex },
      })
        .unwrap()
        .catch(() => {
          updateCardsCache(sourceListId, (draft) => {
            draft.splice(0, draft.length, ...prevSource);
          });
          updateCardsCache(targetListId, (draft) => {
            draft.splice(0, draft.length, ...prevTarget);
          });
          addToast('Nie udało się przenieść karty.', 'error');
        });
    },
    [lists, store, dispatch, moveCard, addToast]
  );

  useEffect(() => {
    if (board) setBoardTitle(board.title);
  }, [board?.title]);

  useEffect(() => {
    if (!boardMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setBoardMenuOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [boardMenuOpen]);

  const handleSaveBoardTitle = () => {
    const t = boardTitle.trim();
    if (!boardId || !t || t === board?.title) {
      setIsEditingTitle(false);
      return;
    }
    updateBoard({ id: boardId, body: { title: t } });
    setIsEditingTitle(false);
  };

  const handleDeleteBoard = async () => {
    if (!boardId) return;
    try {
      await deleteBoard(boardId).unwrap();
      addToast('Tablica została usunięta.', 'success');
      window.location.href = '/boards';
    } catch {
      addToast('Nie udało się usunąć tablicy.', 'error');
    }
    setBoardMenuOpen(false);
  };

  if (!boardId) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-slate-600 dark:text-slate-400">Brak ID tablicy.</p>
      </div>
    );
  }

  if (boardLoading || (!board && !boardError)) {
    return (
      <div className="flex flex-col min-h-[60vh]">
        <div className="px-6 md:px-8 py-6">
          <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-6" />
          <div className="h-10 w-72 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <main className="flex-1 overflow-x-auto custom-scrollbar px-6 md:px-8 pb-10 kanban-container">
          <div className="flex gap-6 min-w-max h-full">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-80 shrink-0 rounded-xl bg-slate-200/30 dark:bg-slate-800/40 p-3 border border-slate-200/50 dark:border-slate-700/50"
              >
                <div className="h-5 w-24 bg-slate-300 dark:bg-slate-600 rounded mb-4" />
                <div className="space-y-3">
                  <div className="h-20 bg-slate-300/50 dark:bg-slate-600/50 rounded-lg" />
                  <div className="h-20 bg-slate-300/50 dark:bg-slate-600/50 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (boardError || !board) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 px-4 py-3 text-red-800 dark:text-red-200">
          Nie udało się załadować tablicy.
        </div>
        <Link
          to="/boards"
          className="text-primary font-semibold hover:underline mt-4 inline-block"
        >
          ← Tablice
        </Link>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-[calc(100vh-120px)] bg-linear-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Sub-header: breadcrumb + actions */}
      <div className="px-6 md:px-8 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
            <Link to="/boards" className="hover:text-primary transition-colors">
              Tablice
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-slate-900 dark:text-slate-200 font-medium truncate max-w-[200px]">
              {board.title}
            </span>
          </nav>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="s"
              to="/boards"
              className="flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Tablice
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {isEditingTitle ? (
              <input
                value={boardTitle}
                onChange={(e) => setBoardTitle(e.target.value)}
                onBlur={handleSaveBoardTitle}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveBoardTitle()}
                className="text-3xl font-black text-slate-900 dark:text-white tracking-tight bg-transparent border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 max-w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                autoFocus
                aria-label="Nazwa tablicy"
              />
            ) : (
              <h1
                className="text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded px-1 -mx-1"
                onClick={() => setIsEditingTitle(true)}
                title="Kliknij, aby edytować"
              >
                {board.title}
              </h1>
            )}
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Edytuj nazwę tablicy"
            >
              <span className="material-symbols-outlined text-xl">edit</span>
            </button>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setBoardMenuOpen((o) => !o)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="Menu tablicy"
                aria-expanded={boardMenuOpen}
                aria-haspopup="true"
              >
                <span className="material-symbols-outlined text-xl">more_horiz</span>
              </button>
              {boardMenuOpen && (
                <div className="absolute left-0 top-full mt-1 w-48 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg py-1 z-30">
                  <button
                    type="button"
                    onClick={handleDeleteBoard}
                    disabled={deleting}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                    Usuń tablicę
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Kanban board */}
      <main className="flex-1 overflow-x-auto custom-scrollbar px-6 md:px-8 pb-10 kanban-container">
        <div className="flex gap-6 min-w-max h-full">
          {listsLoading ? (
            <>
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="w-80 shrink-0 rounded-xl bg-slate-200/30 dark:bg-slate-800/40 p-3 border border-slate-200/50 dark:border-slate-700/50 animate-pulse"
                >
                  <div className="h-5 w-24 bg-slate-300 dark:bg-slate-600 rounded mb-4" />
                  <div className="space-y-3">
                    <div className="h-20 bg-slate-300/50 dark:bg-slate-600/50 rounded-lg" />
                    <div className="h-20 bg-slate-300/50 dark:bg-slate-600/50 rounded-lg" />
                  </div>
                </div>
              ))}
            </>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={() => {
                setActiveDragCard(null);
                setActiveDragListTitle('');
              }}
            >
              {lists.map((list) => (
                <KanbanColumn
                  key={list.id}
                  list={list}
                  onCardClick={(card, listTitle) => setSelectedCard({ card, listTitle })}
                />
              ))}
              <AddListBlock boardId={boardId} />

              <DragOverlay>
                {activeDragCard && (
                  <div className="w-80 pointer-events-none">
                    <div className="w-full text-left bg-white dark:bg-slate-800 p-4 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col gap-3">
                      <div className="flex flex-col gap-2 min-w-0">
                        <span className="w-fit px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200">
                          {activeDragCard.type ?? 'task'}
                        </span>
                        <h4
                          className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 wrap-break-word"
                          title={activeDragCard.title}
                        >
                          {activeDragCard.title || 'Bez tytułu'}
                        </h4>
                        {activeDragListTitle && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {activeDragListTitle}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </main>

      <TaskCardDetailsModal
        cardId={selectedCard?.card.id ?? null}
        boardTitle={board.title}
        listName={selectedCard?.listTitle}
        onClose={() => setSelectedCard(null)}
      />
    </div>
  );
}
