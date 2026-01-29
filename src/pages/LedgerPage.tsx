import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, addDays, subDays, isSameDay } from 'date-fns';
import { Plus, Minus, ChevronLeft, ChevronRight, Calendar, Trash2, ArrowUp } from 'lucide-react';
import { DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors, DragStartEvent, DragEndEvent, PointerSensor } from '@dnd-kit/core';
import LedgerItem from '../components/Ledger/LedgerItem';
import LedgerCell from '../components/Ledger/LedgerCell';
import LedgerPopover from '../components/Ledger/LedgerPopover';
import LedgerCard from '../components/Ledger/LedgerCard';
import ConfirmModal from '../components/ConfirmModal';

// 타입 내부 정의
interface Transaction {
  id: string;
  date: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
}

export default function LedgerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewMode = (searchParams.get('view') as 'month' | 'day') || 'day';
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const generateDummyData = (): Transaction[] => {
    const data: Transaction[] = [
      { id: '1', date: '2026-01-21', title: '점심 식사', amount: 12000, type: 'expense' },
      { id: '2', date: '2026-01-21', title: '편의점 쇼핑', amount: 4500, type: 'expense' },
      { id: '3', date: '2026-01-21', title: '스타벅스 커피', amount: 5000, type: 'expense' },
      { id: '4', date: '2026-01-20', title: '정기 월급', amount: 3500000, type: 'income' },
      { id: '5', date: '2026-01-15', title: '관리비', amount: 250000, type: 'expense' },
      { id: '6', date: '2026-01-10', title: '친구 모임', amount: 85000, type: 'expense' },
      { id: '7', date: '2026-01-05', title: '통신비', amount: 65000, type: 'expense' },
      { id: '8', date: '2026-01-01', title: '새해 용돈', amount: 200000, type: 'income' },
    ];
    for (let i = 1; i <= 12; i++) {
      data.push({ id: `2025-${i}`, date: `2025-${String(i).padStart(2, '0')}-15`, title: `${i}월 월급`, amount: 3000000, type: 'income' });
      data.push({ id: `2025-${i}-ex`, date: `2025-${String(i).padStart(2, '0')}-20`, title: `${i}월 식비`, amount: 450000, type: 'expense' });
    }
    for (let i = 1; i <= 10; i++) {
      data.push({ id: `extra-${i}`, date: '2026-01-21', title: `추가 지출 ${i}`, amount: i * 1000, type: 'expense' });
    }
    return data;
  };

  const [transactions, setTransactions] = useState<Transaction[]>(generateDummyData());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [popover, setPopover] = useState<{ item: Transaction, rect: DOMRect } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [calendarOpenId, setCalendarOpenId] = useState<string | null>(null);
  const [calMonth, setCalMonth] = useState(new Date());
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pendingUpdateId, setPendingUpdateId] = useState<string | null>(null);

  useEffect(() => {
      if (pendingUpdateId) {
          const timer = setTimeout(() => {
              const element = document.getElementById(`ledger-item-${pendingUpdateId}`);
              if (element) {
                  const newRect = element.getBoundingClientRect();
                  setPopover(prev => prev ? { ...prev, rect: newRect } : null);
                  setPendingUpdateId(null);
              }
          }, 100);
          return () => clearTimeout(timer);
      }
  }, [pendingUpdateId, currentDate, transactions, viewMode]);

  // 항목 확장 시 중앙으로 자동 스크롤
  useEffect(() => {
    if (expandedId) {
      // DOM 업데이트 후 실행되도록 약간의 지연을 줌
      setTimeout(() => {
        const element = document.getElementById(`ledger-item-${expandedId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [expandedId]);

  // 뷰 모드 변경 시 모든 상호작용 상태 초기화 (더블 클릭 문제 해결)
  useEffect(() => {
    setPopover(null);
    setExpandedId(null);
    setCalendarOpenId(null);
    setDeleteId(null);
    setIsHighlighting(false);
  }, [viewMode]);

  const setViewMode = (mode: 'month' | 'day') => {
    setSearchParams({ view: mode });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  useEffect(() => {
    if (isHighlighting) {
      const timer = setTimeout(() => setIsHighlighting(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isHighlighting]);

  const handleTodayClick = () => {
    setCurrentDate(new Date());
    if (viewMode === 'month') setIsHighlighting(true);
  };

  const handleCellClick = (e: React.MouseEvent, day: Date) => {
    if (activeId) return;
    setCurrentDate(day);
    setViewMode('day');
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    setPopover(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (over && active.id !== over.id) {
      setTransactions(prev => prev.map(t => t.id === active.id ? { ...t, date: String(over.id) } : t));
    }
  };

  const goToLatestTransaction = () => {
    if (transactions.length === 0) return;
    const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latestDate = new Date(sorted[0].date);
    setCurrentDate(latestDate);
  };

  const handleDelete = () => {
    if (deleteId) {
      setTransactions(prev => prev.filter(t => t.id !== deleteId));
      setDeleteId(null);
      setPopover(null);
      setExpandedId(null);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const days = eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(endOfMonth(monthStart)) });
  const weekStart = startOfWeek(currentDate);
  const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart) });
  const activeTransaction = activeId ? transactions.find(t => t.id === activeId) : null;
  const dayTransactions = transactions.filter(t => t.date === format(currentDate, 'yyyy-MM-dd'));
  const dayIncome = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const dayExpense = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const monthTransactions = transactions.filter(t => isSameMonth(new Date(t.date), currentDate));
  const monthIncome = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthExpense = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-[#1c1c1e]">
      <header className="flex items-center justify-between p-4 border-b border-theme bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-md sticky top-0 z-20 h-16">
          <div className="flex items-center flex-1 min-w-0">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white cursor-pointer truncate" onClick={() => setViewMode('month')}>
                  {viewMode === 'month' ? format(currentDate, 'yyyy년 M월') : format(currentDate, 'yyyy년 M월 d일')}
              </h2>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 flex bg-gray-100 dark:bg-white/10 rounded-lg p-1 z-30">
              <button onClick={() => setViewMode('day')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'day' ? 'bg-white dark:bg-[#2c2c2e] shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>일</button>
              <button onClick={() => setViewMode('month')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'month' ? 'bg-white dark:bg-[#2c2c2e] shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>월</button>
          </div>
          <div className="flex items-center gap-1 md:gap-2 flex-1 justify-end">
              <button onClick={() => { if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1)); else setCurrentDate(d => subDays(d, 1)); }} className="p-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-full"><ChevronLeft className="w-5 h-5 md:w-6 md:h-6" /></button>
              <button onClick={handleTodayClick} className="px-2 md:px-3 py-1 border border-theme rounded text-gray-900 dark:text-white text-[10px] md:text-sm font-bold hover:bg-gray-50 dark:hover:bg-white/5">오늘</button>
              <button onClick={() => { if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1)); else setCurrentDate(d => addDays(d, 1)); }} className="p-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-full"><ChevronRight className="w-5 h-5 md:w-6 md:h-6" /></button>
          </div>
      </header>

      {viewMode === 'month' ? (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="px-6 py-4 flex justify-between items-center border-b border-theme bg-gray-50/50 dark:bg-black/20">
                <div className="flex flex-col"><span className="text-xs text-gray-500 mb-1">수입</span><span className="text-lg font-bold text-green-600">+{monthIncome.toLocaleString()}</span></div>
                <div className="h-8 w-px bg-gray-200 dark:bg-white/10 mx-4"></div>
                <div className="flex flex-col text-right"><span className="text-xs text-gray-500 mb-1">지출</span><span className="text-lg font-bold text-red-500">-{monthExpense.toLocaleString()}</span></div>
            </div>
            <div className="grid grid-cols-7 border-b border-theme bg-gray-50 dark:bg-[#1c1c1e]">
              {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                <div key={day} className={`text-center py-2 text-xs font-bold ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'}`}>{day}</div>
              ))}
            </div>
            <main className="flex-1 grid grid-cols-7 overflow-hidden border-l border-theme" style={{ gridTemplateRows: `repeat(${Math.ceil(days.length / 7)}, minmax(0, 1fr))` }}>
              {days.map(d => {
                const dateStr = format(d, 'yyyy-MM-dd');
                const sortedTransactions = transactions.filter(t => t.date === dateStr).sort((a, b) => {
                    if (a.type !== b.type) return a.type === 'income' ? -1 : 1;
                    if (b.amount !== a.amount) return b.amount - a.amount;
                    return a.id.localeCompare(b.id);
                });
                return (
                  <LedgerCell 
                    key={dateStr} day={d} isCurrentMonth={isSameMonth(d, monthStart)} isTodayDate={isToday(d)} transactions={sortedTransactions} 
                    onItemClick={(e, item) => { e.stopPropagation(); setPopover({ item, rect: e.currentTarget.getBoundingClientRect() }); }}
                    onCellClick={(e) => handleCellClick(e, d)} isHighlighting={isHighlighting}
                  />
                );
              })}
            </main>
            <DragOverlay>{activeTransaction ? <LedgerItem t={activeTransaction} isOverlay /> : null}</DragOverlay>
        </DndContext>
      ) : (
          <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#1c1c1e] relative">
              <div className="px-6 py-4 flex justify-between items-center border-b border-theme bg-gray-50/50 dark:bg-black/20">
                  <div className="flex flex-col"><span className="text-xs text-gray-500 mb-1">수입</span><span className="text-lg font-bold text-green-600">+{dayIncome.toLocaleString()}</span></div>
                  <div className="h-8 w-px bg-gray-200 dark:bg-white/10 mx-4"></div>
                  <div className="flex flex-col text-right"><span className="text-xs text-gray-500 mb-1">지출</span><span className="text-lg font-bold text-red-500">-{dayExpense.toLocaleString()}</span></div>
              </div>

              <div className="flex justify-between items-center px-4 py-3 border-b border-theme bg-white dark:bg-[#1c1c1e]">
                  {weekDays.map((d, i) => {
                      const isSelected = isSameDay(d, currentDate);
                      const hasData = transactions.some(t => t.date === format(d, 'yyyy-MM-dd'));
                      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                      return (
                          <button key={d.toISOString()} onClick={() => setCurrentDate(d)} className={`flex flex-col items-center justify-center w-10 h-16 rounded-2xl transition-all relative ${isSelected ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                              <span className={`text-[10px] font-medium mb-1 ${i === 0 && !isSelected ? 'text-red-500' : i === 6 && !isSelected ? 'text-blue-500' : ''}`}>{dayNames[i]}</span>
                              <span className={`text-base font-bold ${isToday(d) && !isSelected ? 'text-blue-600' : ''}`}>{format(d, 'd')}</span>
                              {hasData && <div className={`absolute bottom-2 w-1 h-1 rounded-full ${isSelected ? 'bg-blue-400' : 'bg-blue-500'}`} />}
                          </button>
                      )
                  })}
              </div>

              <div className="flex-1 overflow-y-auto p-4 pb-20">
                  {dayTransactions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60"><Calendar className="w-12 h-12 mb-2 stroke-1" /><p>내역이 없습니다.</p></div>
                  ) : (
                      <div className="space-y-3">
                          {dayTransactions.map(t => (
                            <LedgerCard
                                key={t.id}
                                t={t}
                                isExpanded={expandedId === t.id}
                                isCalOpen={calendarOpenId === t.id}
                                calMonth={calMonth}
                                onExpand={() => { 
                                    setExpandedId(t.id); 
                                    setCalendarOpenId(null); 
                                    setCalMonth(new Date(t.date)); 
                                }}
                                onCollapse={() => setExpandedId(null)}
                                onUpdate={(u) => setTransactions(prev => prev.map(item => item.id === t.id ? u : item))}
                                onDelete={() => setDeleteId(t.id)}
                                onCalendarToggle={() => setCalendarOpenId(calendarOpenId === t.id ? null : t.id)}
                                setCalMonth={setCalMonth}
                            />
                          ))}
                      </div>
                  )}
              </div>
              {dayTransactions.length === 0 && <button onClick={goToLatestTransaction} className="absolute bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 bg-gray-800 dark:bg-white text-white dark:text-gray-900 rounded-full shadow-lg text-xs font-bold flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity z-50"><ArrowUp className="w-3 h-3" /> 최근 내역</button>}
          </div>
      )}
      <button className="fixed bottom-20 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 z-[60] hover:bg-blue-700 transition-colors" onClick={(e) => { const rect = (e.currentTarget as HTMLElement).getBoundingClientRect(); const newT: Transaction = { id: Math.random().toString(36).substr(2, 9), date: format(currentDate, 'yyyy-MM-dd'), title: '', amount: 0, type: 'expense' }; if (viewMode === 'day') { setTransactions(prev => [...prev, newT]); setExpandedId(newT.id); } else { setPopover({ item: newT, rect }); } }}><Plus className="w-8 h-8" /></button>
      {popover && <LedgerPopover 
        item={transactions.find(t => t.id === popover.item.id) || popover.item} 
        targetRect={popover.rect} 
        onClose={() => setPopover(null)} 
        onUpdate={(u) => {
            setTransactions(prev => prev.some(t => t.id === u.id) ? prev.map(t => t.id === u.id ? u : t) : [...prev, u]);
            if (!isSameMonth(new Date(u.date), currentDate)) {
                setCurrentDate(new Date(u.date));
            }
            setPendingUpdateId(u.id);
        }} 
        onDelete={(id) => setDeleteId(id)} 
      />}
      <ConfirmModal isOpen={!!deleteId} message="이 내역을 영구적으로 삭제하시겠습니까?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
