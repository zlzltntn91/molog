import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Transaction } from '../../types/ledger'

interface TransactionItemProps {
  t: Transaction
  isOverlay?: boolean
  onClick?: (e: React.MouseEvent, t: Transaction) => void
}

export default function TransactionItem({ t, isOverlay, onClick }: TransactionItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: t?.id || 'unknown',
    data: t
  })

  if (!t) return null;

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    touchAction: 'none',
  }

  const baseClasses = "w-full flex items-center px-1.5 py-1 rounded-md shadow-sm truncate mb-1 ledger-item transition-all"
  const colorClasses = t.type === 'income' 
    ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' 
    : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300'

  if (isOverlay) {
    return (
      <div className={`${baseClasses} ${colorClasses} scale-105 cursor-grabbing z-50 ring-2 ring-blue-500`}>
        <span className="text-xs font-bold truncate flex-1">{t.title}</span>
        <span className="text-[10px] ml-1">{t.amount?.toLocaleString()}</span>
      </div>
    )
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      onClick={(e) => {
        if (!isDragging && onClick) onClick(e, t)
      }}
      className={`${baseClasses} ${colorClasses} cursor-pointer hover:brightness-95 group`}
    >
      <span className="text-xs md:text-sm font-bold truncate flex-1 leading-none tracking-tight">
        {t.title}
      </span>
      <span className="hidden xl:block text-[10px] ml-1 font-medium opacity-80 whitespace-nowrap text-right">
        {t.amount?.toLocaleString()}
      </span>
    </div>
  )
}