import { useRef, useState, useEffect } from 'react';
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
  const contentRef = useRef<HTMLDivElement>(null);
  const [cellHeight, setCellHeight] = useState(0);

  useEffect(() => {
    if (!contentRef.current) return;
    const observer = new ResizeObserver(() => {
      setCellHeight(contentRef.current?.clientHeight || 0);
    });
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, []);

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

  // Calculation Logic for Dynamic Item Display
  const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;
  const ITEM_HEIGHT = isDesktop ? 28 : 26; 
  const LABEL_HEIGHT = 20; // '더보기' 라벨 높이 (보수적 추정)

  // 1. 라벨 없이 순수하게 몇 개 들어가는지 계산
  const fullCapacity = Math.floor(cellHeight / ITEM_HEIGHT);

  // 2. 전체 다 들어가는지 확인
  const showAll = transactions.length <= fullCapacity;

  // 3. 다 안 들어가면 라벨 공간(20px) 빼고 몇 개 들어가는지 계산
  const capacityWithLabel = Math.floor((cellHeight - LABEL_HEIGHT) / ITEM_HEIGHT);
  const visibleCount = showAll ? transactions.length : Math.max(0, capacityWithLabel);

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
      <div ref={contentRef} className="flex flex-col mt-0.5 flex-1 overflow-hidden">
        {transactions && transactions.slice(0, visibleCount).map((t) => (
          <LedgerItem key={t.id} t={t} onClick={onItemClick} />
        ))}
        {transactions && transactions.length > visibleCount && (
          <div className="text-[10px] text-gray-400 font-bold text-center mt-auto h-[20px] flex items-center justify-center">
            +{transactions.length - visibleCount}건
          </div>
        )}
      </div>
    </div>
  );
}