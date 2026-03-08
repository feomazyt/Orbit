import { useState } from 'react';
import { useCreateListMutation } from '@/shared/api';
import { Button, Input, useToast } from '@/shared/ui';

type AddListBlockProps = {
  boardId: string;
};

export function AddListBlock({ boardId }: AddListBlockProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [formError, setFormError] = useState('');
  const [createList, { isLoading }] = useCreateListMutation();
  const { addToast } = useToast();

  const handleSave = async () => {
    const t = title.trim();
    if (!t) {
      setFormError('Podaj nazwę listy.');
      return;
    }
    setFormError('');
    try {
      await createList({ boardId, body: { title: t } }).unwrap();
      setTitle('');
      setIsAdding(false);
    } catch {
      addToast('Nie udało się utworzyć listy.', 'error');
    }
  };

  if (isAdding) {
    return (
      <div className="w-80 shrink-0 flex flex-col rounded-xl p-3 border border-slate-200/50 dark:border-slate-700/50 bg-slate-200/30 dark:bg-slate-800/40">
        <Input
          placeholder="Nazwa listy"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setFormError(''); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') { setIsAdding(false); setTitle(''); setFormError(''); }
          }}
          error={formError}
          autoFocus
          data-testid="add-list-title"
        />
        <div className="flex gap-2 mt-3">
          <Button size="s" variant="primary" onClick={handleSave} loading={isLoading} disabled={isLoading || !title.trim()} data-testid="add-list-submit">
            Zapisz
          </Button>
          <Button size="s" variant="ghost" onClick={() => { setIsAdding(false); setTitle(''); }}>
            Anuluj
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 shrink-0 flex flex-col items-center justify-start pt-10">
      <button
        type="button"
        onClick={() => setIsAdding(true)}
        className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl bg-white/20 dark:bg-white/5 border-2 border-dashed border-slate-400/30 dark:border-slate-600/30 text-slate-600 dark:text-slate-400 text-base font-bold hover:bg-white/40 dark:hover:bg-white/10 hover:border-primary/50 hover:text-primary transition-all group"
        data-testid="add-list-btn"
      >
        <div className="p-1 rounded-lg bg-slate-200/50 dark:bg-slate-700/50 group-hover:bg-primary group-hover:text-white transition-all">
          <span className="material-symbols-outlined">add</span>
        </div>
        Dodaj listę
      </button>
    </div>
  );
}
