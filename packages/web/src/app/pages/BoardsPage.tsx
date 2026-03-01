import { useState, useRef, useEffect } from 'react';
import type { BoardEntity, BoardType } from '@orbit/schemas';
import { BOARD_TYPES, PRIORITY_LEVELS } from '@orbit/schemas';
import {
  useGetBoardsQuery,
  useGetFavouriteBoardsQuery,
  useUpdateBoardMutation,
  useDeleteBoardMutation,
  useAddBoardMemberMutation,
  useRemoveBoardMemberMutation,
  useAddBoardFavouriteMutation,
  useRemoveBoardFavouriteMutation,
  useLazySearchUsersQuery,
  type UserSearchHit,
} from '@/shared/api';
import {
  BoardAvatars,
  Button,
  Card,
  Input,
  Modal,
  Select,
  Textarea,
  useToast,
} from '@/shared/ui';
import { Link } from 'react-router-dom';
import { CreateBoardModal } from '@/app/components/CreateBoardModal';

type BoardTheme = { barColor: string; iconColor: string; icon: string };

const BOARD_TYPE_THEMES: Record<BoardType, BoardTheme> = {
  Marketing: {
    barColor: 'bg-blue-500',
    iconColor: 'text-blue-500',
    icon: 'campaign',
  },
  Roadmap: {
    barColor: 'bg-purple-500',
    iconColor: 'text-purple-500',
    icon: 'map',
  },
  Błędy: {
    barColor: 'bg-rose-500',
    iconColor: 'text-rose-500',
    icon: 'bug_report',
  },
  Design: {
    barColor: 'bg-emerald-500',
    iconColor: 'text-emerald-500',
    icon: 'palette',
  },
  Analityka: {
    barColor: 'bg-amber-500',
    iconColor: 'text-amber-500',
    icon: 'analytics',
  },
  Development: {
    barColor: 'bg-green-500',
    iconColor: 'text-green-500',
    icon: 'code',
  },
};

const DEFAULT_THEME: BoardTheme = BOARD_TYPE_THEMES.Development;

/** Kolory tła ikonki dla uproszczonej karty (np. w sekcji Ulubione). */
const BOARD_TYPE_ICON_BG: Record<BoardType, string> = {
  Marketing: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  Roadmap: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  Błędy: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
  Design: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  Analityka: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  Development: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
};

function FavouriteBoardCard({ board }: { board: BoardEntity }) {
  const theme =
    board.type && board.type in BOARD_TYPE_THEMES
      ? BOARD_TYPE_THEMES[board.type as BoardType]
      : DEFAULT_THEME;
  const iconBg =
    board.type && board.type in BOARD_TYPE_ICON_BG
      ? BOARD_TYPE_ICON_BG[board.type as BoardType]
      : BOARD_TYPE_ICON_BG.Development;
  const memberCount = board.members?.length ?? (board.owner ? 1 : 0);
  const otherCount = Math.max(0, memberCount - 1);
  const subtitle =
    otherCount === 0
      ? 'Prywatna tablica'
      : otherCount === 1
        ? 'Współdzielone z 1 osobą'
        : `Współdzielone z ${otherCount} osobami`;

  return (
    <Link
      to={`/boards/${board.id}`}
      className="flex items-center p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div
        className={`size-10 rounded flex items-center justify-center mr-4 shrink-0 ${iconBg}`}
      >
        <span className="material-symbols-outlined">{theme.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-slate-900 dark:text-white truncate">
          {board.title}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
      <span
        className="material-symbols-outlined text-amber-400 shrink-0"
        style={{ fontVariationSettings: "'FILL' 1" }}
        aria-hidden
      >
        star
      </span>
    </Link>
  );
}

const TYPE_OPTIONS = BOARD_TYPES.map((t) => ({ value: t, label: t }));
const PRIORITY_OPTIONS = PRIORITY_LEVELS.map((p) => ({
  value: p.value,
  label: p.label,
}));
const MEMBER_SEARCH_DEBOUNCE_MS = 300;

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

export function BoardsPage() {
  const { data: boards, isLoading, error } = useGetBoardsQuery();
  const { data: favouriteBoards = [] } = useGetFavouriteBoardsQuery();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleOpenCreate = () => setCreateModalOpen(true);

  if (isLoading) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 py-10">
        <div className="h-9 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
        <div className="h-5 w-96 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 overflow-hidden aspect-16/10 animate-pulse"
            >
              <div className="h-2 w-full bg-slate-300 dark:bg-slate-600" />
              <div className="p-5 flex flex-col gap-3">
                <div className="h-6 w-3/4 bg-slate-300 dark:bg-slate-600 rounded" />
                <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            </div>
          ))}
        </div>
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
            {list.map((board) => (
              <BoardCard key={board.id} board={board} />
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
              {favouriteBoards.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 col-span-full">
                  Oznacz tablice jako ulubione (menu ⋮ przy karcie), aby zobaczyć je tutaj.
                </p>
              ) : (
                favouriteBoards.map((board) => (
                  <FavouriteBoardCard key={board.id} board={board} />
                ))
              )}
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

function BoardCard({ board }: { board: BoardEntity }) {
  const theme =
    board.type && board.type in BOARD_TYPE_THEMES
      ? BOARD_TYPE_THEMES[board.type as BoardType]
      : DEFAULT_THEME;
  const updatedAt =
    board.updatedAt instanceof Date
      ? board.updatedAt
      : new Date(board.updatedAt);
  const members = board.members?.length
    ? board.members
    : board.owner
      ? [
          {
            id: board.owner.id,
            name: board.owner.name,
            email: board.owner.email,
          },
        ]
      : [];

  const [menuOpen, setMenuOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(board.title);
  const [editDescription, setEditDescription] = useState(
    board.description ?? '',
  );
  const [editType, setEditType] = useState<string>(board.type ?? 'Marketing');
  const [editPriorityLevel, setEditPriorityLevel] = useState<number>(
    board.priorityLevel ?? 3,
  );
  const [editError, setEditError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editMembers, setEditMembers] = useState<UserSearchHit[]>(members);
  const [editSearchQuery, setEditSearchQuery] = useState('');
  const [editDebouncedQuery, setEditDebouncedQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const [updateBoard] = useUpdateBoardMutation();
  const [deleteBoard] = useDeleteBoardMutation();
  const [addBoardMember] = useAddBoardMemberMutation();
  const [removeBoardMember] = useRemoveBoardMemberMutation();
  const [addBoardFavourite] = useAddBoardFavouriteMutation();
  const [removeBoardFavourite] = useRemoveBoardFavouriteMutation();
  const [searchUsers, { data: editSearchResults = [], isFetching: editSearchLoading }] =
    useLazySearchUsersQuery();
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
    if (editModalOpen) {
      setEditTitle(board.title);
      setEditDescription(board.description ?? '');
      setEditType(board.type ?? 'Marketing');
      setEditPriorityLevel(board.priorityLevel ?? 3);
      setEditError('');
      setEditMembers(
        board.members?.length
          ? board.members.map((m) => ({ id: m.id, name: m.name, email: m.email ?? '' }))
          : board.owner
            ? [{ id: board.owner.id, name: board.owner.name, email: board.owner.email ?? '' }]
            : [],
      );
      setEditSearchQuery('');
      setEditDebouncedQuery('');
    }
  }, [
    editModalOpen,
    board.id,
    board.title,
    board.description,
    board.type,
    board.priorityLevel,
    // board.members / board.owner omitted to avoid resetting editMembers on every refetch while modal is open
  ]);

  useEffect(() => {
    if (!editSearchQuery.trim()) {
      setEditDebouncedQuery('');
      return;
    }
    const t = setTimeout(
      () => setEditDebouncedQuery(editSearchQuery.trim()),
      MEMBER_SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(t);
  }, [editSearchQuery]);

  useEffect(() => {
    if (editDebouncedQuery) searchUsers({ q: editDebouncedQuery });
  }, [editDebouncedQuery, searchUsers]);

  const addEditMember = async (user: UserSearchHit) => {
    if (editMembers.some((m) => m.id === user.id)) return;
    try {
      await addBoardMember({ boardId: board.id, userId: user.id }).unwrap();
      setEditMembers((prev) => [...prev, user]);
    } catch {
      addToast('Nie udało się dodać użytkownika.', 'error');
    }
  };

  const removeEditMember = async (userId: string) => {
    if (userId === board.owner?.id) return;
    try {
      await removeBoardMember({ boardId: board.id, userId }).unwrap();
      setEditMembers((prev) => prev.filter((m) => m.id !== userId));
    } catch {
      addToast('Nie udało się usunąć użytkownika.', 'error');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = editTitle.trim();
    if (!title) {
      setEditError('Podaj nazwę tablicy.');
      return;
    }
    setEditError('');
    setEditSubmitting(true);
    try {
      await updateBoard({
        id: board.id,
        body: {
          title,
          description: editDescription.trim() || undefined,
          type: editType as BoardType,
          priorityLevel: editPriorityLevel,
        },
      }).unwrap();
      addToast('Tablica została zapisana.', 'success');
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

  const handleToggleFavourite = async () => {
    setMenuOpen(false);
    try {
      if (board.isFavourite) {
        await removeBoardFavourite(board.id).unwrap();
        addToast('Usunięto z ulubionych.', 'success');
      } else {
        await addBoardFavourite(board.id).unwrap();
        addToast('Dodano do ulubionych.', 'success');
      }
    } catch {
      addToast(
        board.isFavourite ? 'Nie udało się usunąć z ulubionych.' : 'Nie udało się dodać do ulubionych.',
        'error',
      );
    }
  };

  return (
    <div className="relative h-full" ref={menuRef}>
      <Link to={`/boards/${board.id}`} className="block h-full">
        <Card
          shadow={true}
          padding="none"
          className="group relative overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer aspect-16/10 flex flex-col h-full"
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
            <BoardAvatars users={members} maxVisible={3} />
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
              setEditModalOpen(true);
            }}
            className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
            Edytuj
          </button>
          <button
            type="button"
            onClick={handleToggleFavourite}
            className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">
              {board.isFavourite ? 'star' : 'star_border'}
            </span>
            {board.isFavourite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
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
        title="Edytuj tablicę"
        maxWidth="md"
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
          <Textarea
            label="Opis (opcjonalny)"
            placeholder="Krótki opis tablicy..."
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            disabled={editSubmitting}
            rows={3}
          />
          <Select
            label="Rodzaj"
            options={TYPE_OPTIONS}
            value={editType}
            onChange={(e) => setEditType(e.target.value)}
            disabled={editSubmitting}
          />
          <Select
            label="Priorytet"
            options={PRIORITY_OPTIONS}
            value={editPriorityLevel}
            onChange={(e) => setEditPriorityLevel(Number(e.target.value))}
            disabled={editSubmitting}
          />

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900 dark:text-slate-200">
              Użytkownicy
            </label>
            <Input
              placeholder="Szukaj po nazwie lub e-mailu, aby dodać..."
              value={editSearchQuery}
              onChange={(e) => setEditSearchQuery(e.target.value)}
              disabled={editSubmitting}
            />
            {editSearchLoading && (
              <p className="text-sm text-slate-500 dark:text-slate-400">Szukam…</p>
            )}
            {editDebouncedQuery && !editSearchLoading && (
              <ul className="max-h-40 overflow-y-auto rounded-md border border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700">
                {editSearchResults
                  .filter((u) => !editMembers.some((m) => m.id === u.id))
                  .length === 0 ? (
                  <li className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                    Brak użytkowników lub wszyscy są już dodani
                  </li>
                ) : (
                  editSearchResults
                    .filter((u) => !editMembers.some((m) => m.id === u.id))
                    .map((user) => (
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
                          onClick={() => addEditMember(user)}
                          disabled={editSubmitting}
                        >
                          Dodaj
                        </Button>
                      </li>
                    ))
                )}
              </ul>
            )}
            {editMembers.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {editMembers.map((user) => {
                  const isOwner = user.id === board.owner?.id;
                  const label = user.name ? `${user.name} (${user.email})` : user.email ?? '';
                  return (
                    <span
                      key={user.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 dark:bg-slate-600 px-2.5 py-1 text-sm text-slate-800 dark:text-slate-200"
                      title={label}
                    >
                      <span className="truncate max-w-[140px]">{label}</span>
                      {!isOwner && (
                        <button
                          type="button"
                          onClick={() => removeEditMember(user.id)}
                          disabled={editSubmitting}
                          className="rounded-full p-0.5 hover:bg-slate-300 dark:hover:bg-slate-500 disabled:opacity-50"
                          aria-label={`Usuń ${label}`}
                        >
                          <span className="text-slate-600 dark:text-slate-300">×</span>
                        </button>
                      )}
                      {isOwner && (
                        <span className="text-xs text-slate-500 dark:text-slate-400" title="Właściciel">
                          (właściciel)
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

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
              loading={editSubmitting}
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
