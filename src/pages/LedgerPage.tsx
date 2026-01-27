import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, isSameDay } from 'date-fns'
import { Plus, ChevronLeft, ChevronRight, Repeat, Trash2 } from 'lucide-react'
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

// ---- Components ----
const DraggableItem = ({ t, isOverlay, onClick }: { t: Transaction, isOverlay?: boolean, onClick?: (e: React.MouseEvent, t: Transaction) => void }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: t.id,
    data: t
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    touchAction: 'none',
  }

  const colorClasses = t.type === 'income' 
    ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' 
    : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300'

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      onClick={(e) => {
        if (!isDragging && onClick) onClick(e, t)
      }}
      className={`w-full flex items-center px-1.5 py-1 rounded-md shadow-sm truncate mb-1 cursor-pointer hover:brightness-95 ${colorClasses} ${isOverlay ? 'scale-105 z-50 ring-2 ring-blue-500' : ''}`}
    >
      <span className="text-xs md:text-sm font-bold truncate flex-1">{t.title}</span>
      <span className="hidden xl:block text-[10px] ml-1 font-medium opacity-80 whitespace-nowrap">{t.amount.toLocaleString()}</span>
    </div>
  )
}

const DroppableCell = ({ day, isCurrentMonth, isTodayDate, transactions, onItemClick }: any) => {
  const dayStr = format(day, 'yyyy-MM-dd')
  const { setNodeRef, isOver } = useDroppable({ id: dayStr })

  return (
    <div 
      ref={setNodeRef}
      className={`border-b border-r border-gray-100 dark:border-white/5 p-1 relative flex flex-col h-full ${!isCurrentMonth ? 'bg-gray-50/50 dark:bg-black/20' : ''} ${isOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
    >
      <div className="flex justify-end p-0.5">
        <span className={`text-xs md:text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ${isTodayDate ? 'bg-blue-600 text-white' : !isCurrentMonth ? 'text-gray-300 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}`}>
          {format(day, 'd')}
        </span>
      </div>
      <div className="flex flex-col mt-0.5 flex-1 overflow-hidden">
        {transactions.slice(0, 3).map((t: Transaction) => (
          <DraggableItem key={t.id} t={t} onClick={onItemClick} />
        ))}
        {transactions.length > 3 && (
          <div className="text-[10px] text-gray-400 font-bold text-center mt-auto">+{transactions.length - 3}건</div>
        )}
      </div>
    </div>
  )
}

const PopoverArrow = ({ direction, style }: any) => (
    <div style={{ ...style, width: 20, height: 10, position: 'absolute', pointerEvents: 'none', zIndex: 101 }}>
        <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
            <path d={direction === 'top' ? "M 0 10 L 10 0 L 20 10" : "M 0 0 L 10 10 L 20 0"} className="fill-white dark:fill-[#2c2c2e] stroke-gray-100 dark:border-white/5" strokeWidth="1" />
        </svg>
    </div>
)

const EventDetailPopover = ({ item, targetRect, onClose, onUpdate, onDelete }: any) => {
    const popoverRef = useRef<HTMLDivElement>(null)
    const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0, position: 'fixed' })
    const [arrowDir, setArrowDir] = useState<'top' | 'bottom'>('bottom')
    const [arrowStyle, setArrowStyle] = useState<any>({})
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)
    const [calMonth, setCalMonth] = useState(new Date(item.date))

    useEffect(() => {
        const update = () => {
            if (!popoverRef.current) return
            const isBottom = targetRect.top > window.innerHeight / 2
            const left = Math.max(10, Math.min(targetRect.left - 160 + targetRect.width/2, window.innerWidth - 330))
            
            if (isBottom) {
                setStyle({ position: 'fixed', left, bottom: window.innerHeight - targetRect.top + 10, width: 320, opacity: 1, zIndex: 100 })
                setArrowDir('bottom'); setArrowStyle({ bottom: -9, left: targetRect.left - left + targetRect.width/2 - 10 })
            } else {
                setStyle({ position: 'fixed', left, top: targetRect.bottom + 10, width: 320, opacity: 1, zIndex: 100 })
                setArrowDir('top'); setArrowStyle({ top: -9, left: targetRect.left - left + targetRect.width/2 - 10 })
            }
        }
        update(); window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update)
    }, [targetRect, item, isCalendarOpen])

    useEffect(() => {
        const outside = (e: any) => { if (popoverRef.current && !popoverRef.current.contains(e.target) && !e.target.closest('.ledger-item')) onClose() }
        document.addEventListener('mousedown', outside); return () => document.removeEventListener('mousedown', outside)
    }, [onClose])

    const days = eachDayOfInterval({ start: startOfWeek(startOfMonth(calMonth)), end: endOfWeek(endOfMonth(calMonth)) })

    return createPortal(
        <div ref={popoverRef} style={style} className="bg-white dark:bg-[#2c2c2e] text-gray-900 dark:text-white rounded-xl shadow-2xl border border-gray-100 dark:border-white/5 p-4 text-sm">
            <PopoverArrow direction={arrowDir} style={arrowStyle} />
            <div className="flex justify-between mb-4">
                <input 
                  type="text" 
                  value={item.title} 
                  onChange={e => onUpdate({...item, title: e.target.value})} 
                  onKeyDown={e => e.key === 'Enter' && onClose()}
                  className="bg-transparent text-xl font-bold focus:outline-none w-full" 
                />
                <button onClick={() => onDelete(item.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
            </div>
            <div className="mb-4">
                <div onClick={() => setIsCalendarOpen(!isCalendarOpen)} className="cursor-pointer flex justify-between font-medium">
                    <span>{format(new Date(item.date), 'yyyy. M. d.')}</span>
                    <ChevronRight className={`w-4 h-4 ${isCalendarOpen ? 'rotate-90' : ''}`} />
                </div>
                {isCalendarOpen && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-black/20 rounded-lg">
                        <div className="flex justify-between mb-2">
                            <button onClick={() => setCalMonth(subMonths(calMonth, 1))}><ChevronLeft className="w-4 h-4" /></button>
                            <span className="font-bold">{format(calMonth, 'yyyy. M')}</span>
                            <button onClick={() => setCalMonth(addMonths(calMonth, 1))}><ChevronRight className="w-4 h-4" /></button>
                        </div>
                        <div className="grid grid-cols-7 text-center gap-1">
                            {['일','월','화','수','목','금','토'].map(d => <div key={d} className="text-[10px] text-gray-400">{d}</div>)}
                            {days.map(d => (
                                <button key={d.toISOString()} onClick={() => onUpdate({...item, date: format(d, 'yyyy-MM-dd')})} className={`w-7 h-7 text-xs rounded-full flex items-center justify-center mx-auto ${isSameDay(d, new Date(item.date)) ? 'bg-blue-600 text-white' : isSameMonth(d, calMonth) ? 'text-gray-700 dark:text-gray-200' : 'text-gray-300 dark:text-gray-600'}`}>{format(d, 'd')}</button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="flex justify-between items-center border-t border-gray-100 dark:border-white/5 pt-4">
                <span className="text-gray-400">금액</span>
                <div className="flex items-center gap-1 font-bold">
                    <input 
                      type="text" 
                      value={item.amount.toLocaleString()} 
                      onChange={e => onUpdate({...item, amount: Number(e.target.value.replace(/[^0-9]/g, ''))})} 
                      onKeyDown={e => e.key === 'Enter' && onClose()}
                      className="bg-transparent text-right focus:outline-none" 
                    />
                    <span>원</span>
                </div>
            </div>
        </div>, document.body
    )
}

export default function LedgerPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', date: '2026-01-21', title: '점심 식사', amount: 12000, type: 'expense' },
    { id: '2', date: '2026-01-21', title: '편의점 쇼핑', amount: 4500, type: 'expense' },
    { id: '3', date: '2026-01-21', title: '스타벅스 커피', amount: 5000, type: 'expense' },
    { id: '6', date: '2026-01-20', title: '정기 월급', amount: 3500000, type: 'income' },
  ])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [popover, setPopover] = useState<{ item: Transaction, rect: DOMRect } | null>(null)

  const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 8 } }), useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }))

  const monthStart = startOfMonth(currentDate)
  const days = eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(endOfMonth(monthStart)) })
  const activeT = activeId ? transactions.find(t => t.id === activeId) : null

  return (
    <DndContext sensors={sensors} onDragStart={e => {setActiveId(String(e.active.id)); setPopover(null)}} onDragEnd={e => {setActiveId(null); if (e.over && e.active.id !== e.over.id) setTransactions(prev => prev.map(t => t.id === e.active.id ? {...t, date: String(e.over!.id)} : t))}}>
      <div className="w-full h-full flex flex-col bg-white dark:bg-[#1c1c1e]">
        <header className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{format(currentDate, 'yyyy년 M월')}</h2>
            <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))} 
                  className="p-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-full"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setCurrentDate(new Date())} 
                  className="px-3 py-1 border border-gray-100 dark:border-white/5 rounded text-gray-900 dark:text-white text-sm font-bold hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  오늘
                </button>
                <button 
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))} 
                  className="p-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-full"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
            </div>
        </header>

        <div className="grid grid-cols-7 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#1c1c1e]">
          {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
            <div 
              key={day} 
              className={`text-center py-2 text-xs font-bold ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'}`}
            >
              {day}
            </div>
          ))}
        </div>

        <main 
          className="flex-1 grid grid-cols-7 overflow-hidden border-l border-gray-100 dark:border-white/5"
          style={{ gridTemplateRows: `repeat(${Math.ceil(days.length / 7)}, minmax(0, 1fr))` }}
        >
          {days.map(d => {
            const dateStr = format(d, 'yyyy-MM-dd');
            const sortedTransactions = transactions
              .filter(t => t.date === dateStr)
              .sort((a, b) => {
                if (a.type !== b.type) return a.type === 'income' ? -1 : 1;
                if (b.amount !== a.amount) return b.amount - a.amount;
                return a.id.localeCompare(b.id);
              });

            return (
              <DroppableCell 
                key={dateStr} 
                day={d} 
                isCurrentMonth={isSameMonth(d, monthStart)} 
                isTodayDate={isToday(d)} 
                transactions={sortedTransactions} 
                onItemClick={(e: any, item: any) => { 
                  e.stopPropagation(); 
                  setPopover({ item, rect: e.currentTarget.getBoundingClientRect() }) 
                }} 
              />
            );
          })}
        </main>
        <DragOverlay>{activeT ? <DraggableItem t={activeT} isOverlay /> : null}</DragOverlay>
        <button className="fixed bottom-20 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 z-[60]"><Plus className="w-8 h-8" /></button>
        {popover && (
          <EventDetailPopover 
            item={transactions.find(t => t.id === popover.item.id) || popover.item} 
            targetRect={popover.rect} 
            onClose={() => setPopover(null)} 
            onUpdate={(u: Transaction) => setTransactions(prev => prev.map(t => t.id === u.id ? u : t))} 
            onDelete={(id: string) => { 
              setTransactions(prev => prev.filter(t => t.id !== id)); 
              setPopover(null); 
            }} 
          />
        )}
      </div>
    </DndContext>
  )
}