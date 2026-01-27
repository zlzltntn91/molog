import { useDroppable } from '@dnd-kit/core'
import { format } from 'date-fns'
import { Transaction } from '../../types/ledger'
import TransactionItem from './TransactionItem'

interface CalendarDayCellProps {
  day: Date
  isCurrentMonth: boolean
  isTodayDate: boolean
  transactions: Transaction[]
  onItemClick: (e: React.MouseEvent, t: Transaction) => void
}

export default function CalendarDayCell({ day, isCurrentMonth, isTodayDate, transactions, onItemClick }: CalendarDayCellProps) {
  const dayStr = format(day, 'yyyy-MM-dd')
  const { setNodeRef, isOver } = useDroppable({ id: dayStr })

  const displayLimit = 3
  const visibleItems = transactions.slice(0, displayLimit)
  const extraCount = transactions.length - displayLimit

  return (
    <div 
      ref={setNodeRef}
      className={`
        border-b border-r border-gray-200 dark:border-white/10 
        p-1 relative flex flex-col min-w-0 transition-colors duration-200
        ${!isCurrentMonth ? 'bg-gray-50/50 dark:bg-black/20' : ''}
        ${isOver ? 'bg-blue-50 dark:bg-blue-900/20 ring-inset ring-2 ring-blue-500 z-10' : ''}
      `}
    >
      <div className="flex justify-end p-0.5 pointer-events-none">
        <span className={`
          text-xs md:text-sm font-bold w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full transition-colors
          ${isTodayDate ? 'bg-blue-600 text-white shadow-sm' : !isCurrentMonth ? 'text-gray-300 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}
        `}>
          {format(day, 'd')}
        </span>
      </div>

      <div className="flex flex-col mt-0.5 flex-1 w-full overflow-hidden">
        {visibleItems.map((t) => (
          <TransactionItem key={t.id} t={t} onClick={onItemClick} />
        ))}
        {extraCount > 0 && (
          <div className="text-[10px] md:text-xs text-gray-400 font-bold px-1 py-0.5 mt-auto text-center">
            +{extraCount}건
          </div>
        )}
      </div>
    </div>
  )
}
