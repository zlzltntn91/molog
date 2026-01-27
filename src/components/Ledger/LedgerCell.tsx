import { useRef, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { format } from 'date-fns';
import { Transaction } from '../../types';
import LedgerItem from './LedgerItem';

interface LedgerCellProps {
  day: Date;
  isCurrentMonth: boolean;
  isTodayDate: boolean;
  transactions: Transaction[];
  onItemClick: (e: React.MouseEvent, t: Transaction) => void;
  onCellClick?: (e: React.MouseEvent) => void;
  isHighlighting?: boolean;
}

export default function LedgerCell({ day, isCurrentMonth, isTodayDate, transactions, onItemClick, onCellClick, isHighlighting }: LedgerCellProps) {
  const dayStr = format(day, 'yyyy-MM-dd');
  const { setNodeRef, isOver } = useDroppable({ id: dayStr });
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Visual feedback state
  const [isPressed, setIsPressed] = useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setIsPressed(true);
    
    longPressTimer.current = setTimeout(() => {
      if (onCellClick) onCellClick(e);
      setIsPressed(false);
    }, 500); // 0.5초 꾹 누르면 실행
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setIsPressed(false);
  };

  // 오늘 날짜에만 적용될 강조 스타일 정의 (나타날 때 300ms, 사라질 때 2000ms)
  const highlightClass = isTodayDate 
    ? (isHighlighting 
        ? 'bg-blue-500/10 dark:bg-blue-500/20 !duration-300' 
        : 'bg-transparent !duration-[2000ms]') 
    : '';

  return (
    <div 
      ref={setNodeRef}
      onPointerDown={handlePointerDown}
      onPointerUp={cancelLongPress}
      onPointerLeave={cancelLongPress}
      onPointerMove={cancelLongPress}
      className={`
        p-1 relative flex flex-col h-full transition-all ease-in-out cursor-pointer outline-none select-none
        shadow-[1px_1px_0_0_#f3f4f6] dark:shadow-[1px_1px_0_0_#2c2c2e]
        ${!isCurrentMonth ? 'bg-gray-50/50 dark:bg-black/20' : ''} 
        ${isOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
        ${isPressed ? 'scale-[0.98] bg-gray-100 dark:bg-white/5' : ''}
        ${highlightClass}
      `}
    >
      <div className="flex justify-end p-0.5">
        <span className={`
          text-xs md:text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full
          ${isTodayDate ? 'bg-blue-600 text-white' : !isCurrentMonth ? 'text-gray-300 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}
        `}>
          {format(day, 'd')}
        </span>
      </div>
      <div className="flex flex-col mt-0.5 flex-1 overflow-hidden">
        {transactions && transactions.slice(0, 3).map((t) => (
          <LedgerItem key={t.id} t={t} onClick={onItemClick} />
        ))}
        {transactions && transactions.length > 3 && (
          <div className="text-[10px] text-gray-400 font-bold text-center mt-auto">
            +{transactions.length - 3}건
          </div>
        )}
      </div>
    </div>
  );
}
