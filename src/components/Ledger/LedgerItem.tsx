import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// 타입 내부 정의 (Import 문제 방지)
interface Transaction {
  id: string;
  date: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
}

interface LedgerItemProps {
  t: Transaction;
  isOverlay?: boolean;
  onClick?: (e: React.MouseEvent, t: Transaction) => void;
}

export default function LedgerItem({ t, isOverlay, onClick }: LedgerItemProps) {
  // 방어 코드: 데이터가 없으면 렌더링 중단
  if (!t) return null;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: t.id,
    data: t
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    touchAction: 'none' as const,
  };

  const colorClasses = t.type === 'income' 
    ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' 
    : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300';

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        if (!isDragging && onClick) onClick(e, t);
      }}
      className={`w-full flex items-center px-1.5 py-1 rounded-md shadow-sm truncate mb-1 cursor-pointer hover:brightness-95 relative z-10 ${colorClasses} ${isOverlay ? 'scale-105 ring-2 ring-blue-500 !z-50' : ''}`}
    >
      <span className="text-xs md:text-sm font-bold truncate flex-1">{t.title}</span>
      <span className="hidden xl:block text-[10px] ml-1 font-medium opacity-80 whitespace-nowrap">
        {t.amount.toLocaleString()}
      </span>
    </div>
  );
}