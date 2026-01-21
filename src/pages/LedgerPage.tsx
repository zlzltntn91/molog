import { useState, useRef, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns'
import { Plus, ChevronLeft, ChevronRight, Copy, Move, X, MapPin, Clock, Bell, Trash2, Edit2 } from 'lucide-react'
import { DndContext, useDraggable, useDroppable, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

// ---- Types ----
interface Transaction {
  id: string
  date: string
  title: string
  amount: number
  type: 'income' | 'expense'
}

// ---- Data ----
const initialTransactions: Transaction[] = [
  { id: '1', date: '2026-01-21', title: '점심 식사', amount: 12000, type: 'expense' },
  { id: '2', date: '2026-01-21', title: '편의점 쇼핑', amount: 4500, type: 'expense' },
  { id: '3', date: '2026-01-21', title: '스타벅스 커피', amount: 5000, type: 'expense' },
  { id: '4', date: '2026-01-21', title: '저녁 회식비', amount: 55000, type: 'expense' },
  { id: '5', date: '2026-01-21', title: '택시비', amount: 15000, type: 'expense' },
  { id: '6', date: '2026-01-20', title: '정기 월급', amount: 3500000, type: 'income' },
  { id: '7', date: '2026-01-25', title: '백화점 쇼핑', amount: 150000, type: 'expense' },
  { id: '8', date: '2026-02-01', title: '아파트 관리비', amount: 250000, type: 'expense' },
]

// ---- Components ----
const DraggableItem = ({ t, isOverlay, onClick }: { t: Transaction, isOverlay?: boolean, onClick?: (e: React.MouseEvent, t: Transaction) => void }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: t.id,
    data: t
  })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    touchAction: 'none',
  }

  const baseClasses = "w-full flex items-center px-1.5 py-1 rounded-md shadow-sm truncate mb-1"
  const colorClasses = t.type === 'income' 
    ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' 
    : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300'

  if (isOverlay) {
    return (
      <div className={`${baseClasses} ${colorClasses} scale-105 cursor-grabbing z-50 ring-2 ring-blue-500`}>
        <span className="text-xs font-bold truncate flex-1">{t.title}</span>
        <span className="text-[10px] ml-1">{t.amount.toLocaleString()}</span>
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
      className={`${baseClasses} ${colorClasses} cursor-pointer hover:brightness-95 transition-all`}
    >
      <span className="text-xs md:text-sm font-bold truncate flex-1 leading-none tracking-tight">
        {t.title}
      </span>
    </div>
  )
}

const DroppableCell = ({ day, isCurrentMonth, isTodayDate, transactions, onItemClick }: any) => {
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
        {visibleItems.map((t: Transaction) => (
          <DraggableItem key={t.id} t={t} onClick={onItemClick} />
        ))}
        {extraCount > 0 && (
          <div className="text-[10px] md:text-xs text-gray-400 font-bold px-1 py-0.5 mt-0.5">
            +{extraCount}건
          </div>
        )}
      </div>
    </div>
  )
}

const EventDetailPopover = ({ item, position, onClose }: { item: Transaction, position: { x: number, y: number }, onClose: () => void }) => {
    const popoverRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                onClose()
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [onClose])

    const style: React.CSSProperties = {
        position: 'fixed',
        left: position.x + 10,
        top: position.y,
        zIndex: 100,
        width: '300px'
    }
    
    // 안전하게 window 체크
    if (typeof window !== 'undefined') {
        if (window.innerWidth - position.x < 320) style.left = position.x - 310
        if (window.innerHeight - position.y < 200) style.top = position.y - 150
    }

    return (
        <div ref={popoverRef} style={style} className="bg-[#2c2c2e]/95 backdrop-blur-md text-white rounded-xl shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start p-4 pb-2 border-b border-white/10">
                <div className="flex-1 mr-2">
                    <h3 className="text-lg font-bold leading-tight">{item.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">{item.type === 'income' ? '수입' : '지출'}</p>
                </div>
                <button onClick={onClose} className="p-1 rounded hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-3">
                <div className="flex items-center gap-3 text-sm"><Clock className="w-4 h-4 text-gray-400" /><span>{item.date}</span></div>
                <div className="flex items-center gap-3 text-sm"><MapPin className="w-4 h-4 text-gray-400" /><span className="text-gray-400">위치 정보 없음</span></div>
                <div className="pt-2 mt-2 border-t border-white/10">
                    <p className="text-lg font-bold text-white">{item.amount.toLocaleString()}원</p>
                </div>
            </div>
        </div>
    )
}

const DragConfirmDialog = ({ isOpen, onClose, onMove, onCopy }: any) => {
    if (!isOpen) return null
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-[#2c2c2e] rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-5 text-center">
            <h3 className="text-lg font-bold mb-2">항목 이동/복사</h3>
            <div className="flex gap-3 mt-6">
              <button onClick={onMove} className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 text-blue-600 dark:text-blue-400"><Move className="w-6 h-6" /><span className="font-bold text-sm">이동</span></button>
              <button onClick={onCopy} className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 text-green-600 dark:text-green-400"><Copy className="w-6 h-6" /><span className="font-bold text-sm">복사</span></button>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-black/20 p-3">
            <button onClick={onClose} className="w-full py-3 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white">취소</button>
          </div>
        </div>
      </div>
    )
}

export default function LedgerPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [pendingDrag, setPendingDrag] = useState<{ id: string, targetDate: string } | null>(null)
  const [popoverInfo, setPopoverInfo] = useState<{ item: Transaction, position: { x: number, y: number } } | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
    setPopoverInfo(null)
  }
  
  const handleDragEnd = (event: any) => {
    const { active, over } = event
    setActiveId(null)
    if (over && active.id !== over.id) setPendingDrag({ id: active.id, targetDate: over.id })
  }

  const handleItemClick = (e: React.MouseEvent, item: Transaction) => {
    e.stopPropagation() // 매우 중요: 드래그 센서와 충돌 방지
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setPopoverInfo({ item, position: { x: rect.right, y: rect.top } })
  }

  const handleMove = () => {
    if (pendingDrag) {
      setTransactions(prev => prev.map(t => t.id === pendingDrag.id ? { ...t, date: pendingDrag.targetDate } : t))
      setPendingDrag(null)
    }
  }

  const handleCopy = () => {
    if (pendingDrag) {
      setTransactions(prev => {
        const original = prev.find(t => t.id === pendingDrag.id)
        if (!original) return prev
        return [...prev, { ...original, id: Math.random().toString(36).substr(2, 9), date: pendingDrag.targetDate }]
      })
      setPendingDrag(null)
    }
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })
  const rowCount = calendarDays.length / 7
  const activeTransaction = activeId ? transactions.find(t => t.id === activeId) : null

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="w-full min-h-full flex flex-col transition-colors duration-300 relative">
        <div className="sticky top-0 z-30 flex-none bg-white dark:bg-[#1c1c1e] shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/5">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{format(currentDate, 'yyyy년 M월')}</h2>
              <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full"><ChevronLeft className="w-6 h-6" /></button>
                  <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-sm font-bold border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5">오늘</button>
                  <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full"><ChevronRight className="w-6 h-6" /></button>
              </div>
          </div>
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1c1c1e]">
              {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                  <div key={day} className={`text-center py-3 text-sm md:text-base font-black ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'}`}>{day}</div>
              ))}
          </div>
        </div>

        <div className="flex-1 grid grid-cols-7 border-l border-gray-200 dark:border-white/10 bg-white dark:bg-[#2c2c2e]" style={{ gridTemplateRows: `repeat(${rowCount}, minmax(110px, 1fr))` }}>
          {calendarDays.map((day) => {
            const dayStr = format(day, 'yyyy-MM-dd')
            return (
                <DroppableCell 
                    key={dayStr} 
                    day={day} 
                    isCurrentMonth={isSameMonth(day, monthStart)} 
                    isTodayDate={isToday(day)} 
                    transactions={transactions.filter(t => t.date === dayStr)}
                    onItemClick={handleItemClick}
                />
            )
          })}
        </div>

        <DragOverlay>{activeTransaction ? <DraggableItem t={activeTransaction} isOverlay /> : null}</DragOverlay>
        <button className="fixed bottom-20 right-6 md:right-10 w-14 h-14 md:w-16 md:h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 active:scale-95 z-[60] transition-all"><Plus className="w-8 h-8 md:w-10 md:h-10" /></button>
        <DragConfirmDialog isOpen={!!pendingDrag} onClose={() => setPendingDrag(null)} onMove={handleMove} onCopy={handleCopy} />
        {popoverInfo && <EventDetailPopover item={popoverInfo.item} position={popoverInfo.position} onClose={() => setPopoverInfo(null)} />}
      </div>
    </DndContext>
  )
}