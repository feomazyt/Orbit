import { useState, useRef, useEffect } from 'react';
import type { BoardEntity } from '@orbit/schemas';
import {
  useGetBoardsQuery,
  useUpdateBoardMutation,
  useDeleteBoardMutation,
} from '@/shared/api';
import { Button, Card, Input, Modal, useToast } from '@/shared/ui';
import { Link } from 'react-router-dom';
import { CreateBoardModal } from '@/app/components/CreateBoardModal';

const BOARD_THEMES = [
  { barColor: 'bg-blue-500', iconColor: 'text-blue-500', icon: 'campaign' },
  { barColor: 'bg-purple-500', iconColor: 'text-purple-500', icon: 'map' },
  { barColor: 'bg-rose-500', iconColor: 'text-rose-500', icon: 'bug_report' },
  {
    barColor: 'bg-emerald-500',
    iconColor: 'text-emerald-500',
    icon: 'palette',
  },
  { barColor: 'bg-amber-500', iconColor: 'text-amber-500', icon: 'analytics' },
] as const;

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMins < 1) return 'Przed chwilą';
  if (diffMins < 60) return `${diffMins} min temu`;
  if (diffHours < 24) return `${diffHours} godz. temu`;
  if (diffDays === 1) return 'Wczoraj';
  if (diffDays < 7) return `${diffDays} dni temu`;
  if (diffWeeks === 1) return '1 tydzień temu';
  if (diffWeeks < 5) return `${diffWeeks} tygodnie temu`;
  return date.toLocaleDateString('pl-PL');
}

function getInitials(name: string | undefined): string {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function BoardsPage() {
  const { data: boards, isLoading, error } = useGetBoardsQuery();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleOpenCreate = () => setCreateModalOpen(true);

  if (isLoading) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 py-10">
        <p className="text-slate-600 dark:text-slate-400">Ładowanie tablic…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 py-10">
        <p className="text-red-600 dark:text-red-400">
          Nie udało się załadować tablic.
        </p>
      </div>
    );
  }

  const list = boards ?? [];
  const isEmpty = list.length === 0;

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-10">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Moje tablice
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Zarządzaj swoimi projektami i zadaniami zespołu.
          </p>
        </div>
        <Button variant="primary" size="m" onClick={handleOpenCreate}>
          <span className="material-symbols-outlined text-lg">add</span>
          Nowa tablica
        </Button>
      </div>

      {/* Empty state */}
      {isEmpty ? (
        <Card className="max-w-md mx-auto p-10 text-center">
          <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-500">
              dashboard
            </span>
          </div>
          <p className="text-slate-700 dark:text-slate-200 font-medium mb-1">
            Nie masz jeszcze tablic.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Utwórz pierwszą.
          </p>
          <Button variant="primary" size="m" onClick={handleOpenCreate}>
            <span className="material-symbols-outlined text-lg">add</span>
            Utwórz tablicę
          </Button>
        </Card>
      ) : (
        <>
          {/* Boards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {list.map((board, index) => (
              <BoardCard key={board.id} board={board} themeIndex={index} />
            ))}
            {/* Create New Board Placeholder */}
            <button
              type="button"
              onClick={handleOpenCreate}
              className="text-left h-full min-h-40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 rounded-xl"
            >
              <Card
                shadow={false}
                className="group relative bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer aspect-16/10 flex flex-col items-center justify-center text-center p-6 h-full"
              >
                <div className="size-12 rounded-full bg-slate-200 dark:bg-slate-800 group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-2xl">
                    add
                  </span>
                </div>
                <p className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                  Utwórz nową tablicę
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Zacznij zarządzać nowym projektem
                </p>
              </Card>
            </button>
          </div>

          {/* Ulubione */}
          <section className="mt-16">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-slate-400">
                star
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Ulubione
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 col-span-full">
                Oznacz tablice jako ulubione, aby zobaczyć je tutaj.
              </p>
            </div>
          </section>
        </>
      )}

      <CreateBoardModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
}

function BoardCard({
  board,
  themeIndex,
}: {
  board: BoardEntity;
  themeIndex: number;
}) {
  const theme = BOARD_THEMES[themeIndex % BOARD_THEMES.length];
  const updatedAt =
    board.updatedAt instanceof Date
      ? board.updatedAt
      : new Date(board.updatedAt);
  const ownerInitials = getInitials(board.owner?.name);

  const [menuOpen, setMenuOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(board.title);
  const [editError, setEditError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [updateBoard] = useUpdateBoardMutation();
  const [deleteBoard] = useDeleteBoardMutation();
  const { addToast } = useToast();

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    setEditTitle(board.title);
  }, [board.title]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = editTitle.trim();
    if (!title) {
      setEditError('Podaj nazwę tablicy.');
      return;
    }
    if (title === board.title) {
      setEditModalOpen(false);
      return;
    }
    setEditError('');
    setEditSubmitting(true);
    try {
      await updateBoard({ id: board.id, body: { title } }).unwrap();
      addToast('Nazwa tablicy została zapisana.', 'success');
      setEditModalOpen(false);
    } catch {
      addToast('Nie udało się zapisać zmian.', 'error');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    if (
      !window.confirm(
        'Czy na pewno usunąć tę tablicę? Ta operacja jest nieodwracalna.',
      )
    )
      return;
    try {
      await deleteBoard(board.id).unwrap();
      addToast('Tablica została usunięta.', 'success');
    } catch {
      addToast('Nie udało się usunąć tablicy.', 'error');
    }
  };

  return (
    <div className="relative h-full" ref={menuRef}>
      <Link to={`/boards/${board.id}`} className="block h-full">
        <Card
          shadow={true}
          className="group relative p-0 overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer aspect-16/10 flex flex-col h-full"
        >
          <div className={`h-2 w-full ${theme.barColor}`} />
          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`material-symbols-outlined ${theme.iconColor}`}
                >
                  {theme.icon}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMenuOpen((o) => !o);
                  }}
                  className="material-symbols-outlined text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Menu tablicy"
                >
                  more_horiz
                </button>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                {board.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Ostatnia zmiana: {formatRelativeTime(updatedAt)}
              </p>
            </div>
            <div className="flex -space-x-2">
              {board.owner && (
                <div
                  className="size-7 rounded-full border-2 border-white dark:border-slate-900 bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary"
                  title={board.owner.name}
                >
                  {ownerInitials}
                </div>
              )}
              {!board.owner && (
                <div className="size-7 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">
                  —
                </div>
              )}
            </div>
          </div>
        </Card>
      </Link>

      {menuOpen && (
        <div
          className="absolute right-0 top-12 z-20 w-48 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg py-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              setEditTitle(board.title);
              setEditError('');
              setEditModalOpen(true);
            }}
            className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
            Edytuj nazwę
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
            Usuń
          </button>
        </div>
      )}

      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edytuj nazwę tablicy"
        maxWidth="sm"
      >
        <form onSubmit={handleEditSubmit} className="space-y-6">
          <Input
            label="Nazwa"
            placeholder="np. Marketing Q4"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            error={editError}
            autoFocus
            disabled={editSubmitting}
          />
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              size="m"
              onClick={() => setEditModalOpen(false)}
              disabled={editSubmitting}
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="m"
              disabled={editSubmitting}
            >
              Zapisz
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
