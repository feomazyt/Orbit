import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CardEntity } from '@/shared/types';
import { CARD_TYPES, type CardType } from '@orbit/schemas';

const CARD_TYPE_STYLES: Record<CardType, string> = {
  task: 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200',
  bug: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200',
  feature: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200',
  story: 'bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-200',
};

type SortableTaskCardProps = {
  card: CardEntity;
  listId: string;
  listTitle: string;
  onCardClick: (card: CardEntity, listTitle: string) => void;
};

export function SortableTaskCard({ card, listId, listTitle, onCardClick }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      listId,
      card,
    },
  });

  const cardType = (card.type && CARD_TYPES.includes(card.type as CardType) ? card.type : 'task') as CardType;
  const typeStyles = CARD_TYPE_STYLES[cardType];

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <button
        type="button"
        onClick={() => onCardClick(card, listTitle)}
        className={`w-full text-left bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 flex flex-col gap-3 cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50 shadow-lg' : ''}`}
        aria-label={`Przenieś kartę ${card.title || 'Bez tytułu'}`}
        data-testid={`task-card-${card.id}`}
      >
        <div className="flex flex-col gap-2 min-w-0">
          <span
            className={`w-fit px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${typeStyles}`}
          >
            {cardType}
          </span>
          <h4
            className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 wrap-break-word"
            title={card.title}
          >
            {card.title || 'Bez tytułu'}
          </h4>
        </div>
        <div className="flex items-center justify-between gap-2 mt-auto min-h-6">
          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 shrink-0 min-w-0">
            {card.dueDate ? (
              <>
                <span className="material-symbols-outlined text-sm shrink-0">calendar_today</span>
                <span className="truncate">
                  {new Date(card.dueDate).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}
                </span>
              </>
            ) : (
              <span className="invisible" aria-hidden>—</span>
            )}
          </span>
          <span className="flex -space-x-1.5 shrink-0">
            {card.assignees && card.assignees.length > 0 ? (
              <>
                {card.assignees.slice(0, 3).map((a) => (
                  <span
                    key={a.id}
                    className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-200 ring-1 ring-slate-200 dark:ring-slate-600"
                    title={a.name ?? a.email}
                  >
                    {(a.name ?? a.email ?? '?').slice(0, 1).toUpperCase()}
                  </span>
                ))}
                {card.assignees.length > 3 && (
                  <span
                    className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-500 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300"
                    title={`+${card.assignees.length - 3} więcej`}
                  >
                    +{card.assignees.length - 3}
                  </span>
                )}
              </>
            ) : null}
          </span>
        </div>
      </button>
    </div>
  );
}
