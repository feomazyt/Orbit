import { useParams } from 'react-router-dom';
import { useGetBoardQuery } from '@/shared/api';
import { Card } from '@/shared/ui';
import { Link } from 'react-router-dom';

export function BoardDetailPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const { data: board, isLoading, error } = useGetBoardQuery(boardId!, { skip: !boardId });

  if (!boardId) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-slate-600 dark:text-slate-400">Brak ID tablicy.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-slate-600 dark:text-slate-400">Ładowanie tablicy…</p>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-red-600 dark:text-red-400">Nie udało się załadować tablicy.</p>
        <Link to="/boards" className="text-primary font-semibold hover:underline mt-2 inline-block">
          ← Wróć do listy tablic
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-6">
        <Link to="/boards" className="text-sm text-primary font-semibold hover:underline">
          ← Tablice
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{board.title}</h1>
      {board.description && (
        <p className="text-slate-600 dark:text-slate-400 mb-8">{board.description}</p>
      )}
      <Card className="p-6 min-h-[400px]" padding="large">
        <p className="text-slate-500 dark:text-slate-500">Widok Kanban tablicy — do rozbudowy.</p>
      </Card>
    </div>
  );
}
