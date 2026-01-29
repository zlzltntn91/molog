import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Trash2, Plus, Minus, Calendar } from 'lucide-react';
import AutoResizeTextarea from '../AutoResizeTextarea';
import BufferedInput from '../BufferedInput';

// 타입 내부 정의 (안전)
interface Transaction {
  id: string;
  date: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
}

interface LedgerPopoverProps {
  item: Transaction;
  targetRect: DOMRect;
  onClose: () => void;
  onUpdate: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

const PopoverArrow = ({ direction, style }: { direction: 'top' | 'bottom', style: React.CSSProperties }) => (
    <div style={{ ...style, width: 20, height: 10, position: 'absolute', pointerEvents: 'none', zIndex: 101, overflow: 'hidden' }}>
        <div 
            style={{
                width: 14,
                height: 14,
                transform: 'rotate(45deg)',
                position: 'absolute',
                left: 3, // Center horizontally ((20 - 14) / 2 approx)
                top: direction === 'top' ? 4 : -8, // Adjust vertical position to make tip protrude correctly
            }}
            className={`
                bg-white dark:bg-[#2c2c2e]
                border-gray-100 dark:border-[#2c2c2e]
                ${direction === 'top' ? 'border-t border-l' : 'border-b border-r'}
            `}
        />
    </div>
);

export default function LedgerPopover({ item, targetRect, onClose, onUpdate, onDelete }: LedgerPopoverProps) {
    if (!item) return null;

    const popoverRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0, position: 'fixed', pointerEvents: 'none' });
    const [arrowDir, setArrowDir] = useState<'top' | 'bottom'>('bottom');
    const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
    
    // 로컬 상태
    const [title, setTitle] = useState(item.title);
    const [amount, setAmount] = useState(item.amount);
    const [date, setDate] = useState(item.date);
    const [type, setType] = useState<'income' | 'expense'>(item.type);
    
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [calMonth, setCalMonth] = useState(new Date(item.date));

    useEffect(() => {
        setTitle(item.title);
        setAmount(item.amount);
        setDate(item.date);
        setType(item.type);
        setCalMonth(new Date(item.date));
    }, [item]);

    useEffect(() => {
        const update = () => {
            if (!popoverRef.current) return;
            const isBottom = targetRect.top > window.innerHeight / 2;
            const left = Math.max(10, Math.min(targetRect.left - 160 + targetRect.width/2, window.innerWidth - 330));
            
            if (isBottom) {
                setStyle({ position: 'fixed', left, bottom: window.innerHeight - targetRect.top + 10, width: 320, opacity: 1, zIndex: 100 });
                setArrowDir('bottom'); 
                setArrowStyle({ bottom: -9, left: targetRect.left - left + targetRect.width/2 - 10 });
            } else {
                setStyle({ position: 'fixed', left, top: targetRect.bottom + 10, width: 320, opacity: 1, zIndex: 100 });
                setArrowDir('top'); 
                setArrowStyle({ top: -9, left: targetRect.left - left + targetRect.width/2 - 10 });
            }
        };
        update(); 
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, [targetRect]);

    useEffect(() => {
        const outside = (e: MouseEvent) => { 
            const target = e.target as HTMLElement;
            if (popoverRef.current && !popoverRef.current.contains(target) && !target.closest('.ledger-item')) {
                onClose();
            }
        };
        document.addEventListener('mousedown', outside); 
        return () => document.removeEventListener('mousedown', outside);
    }, [onClose]);

    const updateField = (field: keyof Transaction, value: any) => {
        if (field === 'title') setTitle(value);
        if (field === 'amount') setAmount(value);
        if (field === 'date') setDate(value);
        if (field === 'type') setType(value);

        onUpdate({
            ...item,
            title: field === 'title' ? value : title,
            amount: field === 'amount' ? value : amount,
            date: field === 'date' ? value : date,
            type: field === 'type' ? value : type,
        });
    };

    const days = eachDayOfInterval({ start: startOfWeek(startOfMonth(calMonth)), end: endOfWeek(endOfMonth(calMonth)) });

    return createPortal(
        <div ref={popoverRef} style={style} className="w-[320px] z-[100] text-gray-900 dark:text-white">
            <PopoverArrow direction={arrowDir} style={arrowStyle} />
            
            {/* Inner Container for Content & Styling (Clips content but not arrow) */}
            <div className="relative bg-white dark:bg-[#2c2c2e] rounded-2xl shadow-2xl border border-theme">
                {/* Highlight Bar & Tint (Matching LedgerCard) - Clipped separately to allow content overflow */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                     <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                     <div className={`absolute inset-0 opacity-30 ${type === 'income' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`} />
                </div>

                {/* Content Container */}
                <div className="relative p-5 pr-7 pl-7">
                    {/* 1. Header: Date (Left) & Actions (Right) */}
                    <div className="flex justify-between items-center mb-3">
                        {/* Date & Calendar */}
                        <div className="relative">
                            <div 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setIsCalendarOpen(!isCalendarOpen); 
                                }} 
                                className="cursor-pointer flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors w-fit rounded py-1"
                            >
                                <Calendar className="w-3.5 h-3.5" />
                                <span className="font-medium text-xs">{format(new Date(date), 'yyyy년 M월 d일')}</span>
                                <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${isCalendarOpen ? 'rotate-90' : ''}`} />
                            </div>
                            
                            {isCalendarOpen && (
                                <div className="absolute top-full left-0 mt-2 z-50 p-3 bg-white dark:bg-[#1c1c1e] rounded-xl shadow-xl border border-theme min-w-[280px]">
                                    <div className="flex justify-between mb-2">
                                        <button onClick={() => setCalMonth(subMonths(calMonth, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded"><ChevronLeft className="w-4 h-4" /></button>
                                        <span className="font-bold text-sm">{format(calMonth, 'yyyy. M')}</span>
                                        <button onClick={() => setCalMonth(addMonths(calMonth, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded"><ChevronRight className="w-4 h-4" /></button>
                                    </div>
                                    <div className="grid grid-cols-7 text-center gap-1">
                                        {['일','월','화','수','목','금','토'].map(d => <div key={d} className="text-[10px] text-gray-400">{d}</div>)}
                                        {days.map(d => (
                                            <button 
                                                key={d.toISOString()} 
                                                onClick={() => { 
                                                    const newDate = format(d, 'yyyy-MM-dd');
                                                    updateField('date', newDate);
                                                    setIsCalendarOpen(false);
                                                }} 
                                                className={`w-7 h-7 text-xs rounded-full flex items-center justify-center mx-auto transition-colors duration-200 
                                                    ${isSameDay(d, new Date(date)) ? 'bg-blue-600 text-white font-bold' : isSameMonth(d, calMonth) ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/10' : 'text-gray-300 dark:text-gray-600'}
                                                `}
                                            >
                                                {format(d, 'd')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => updateField('type', type === 'income' ? 'expense' : 'income')}
                                className={`p-1.5 rounded-lg transition-colors ${type === 'income' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}
                            >
                                {type === 'income' ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                            </button>
                            <button onClick={() => onDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* 2. Title (AutoResizeTextarea) */}
                    <div className="mb-2">
                        <AutoResizeTextarea
                            value={title}
                            onChange={(val) => updateField('title', val)}
                            onEnter={onClose}
                        />
                    </div>

            {/* 3. Amount (그다음으로 크게, 색상 강조) */}
            <div>
                <div className={`flex items-center gap-1 text-xl font-bold ${type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    <BufferedInput 
                      type="text" 
                      value={amount.toLocaleString()} 
                      onValueChange={(val) => {
                          const num = Number(val.replace(/[^0-9]/g, ''));
                          updateField('amount', num);
                      }}
                      onEnter={onClose}
                      processInput={(val) => {
                          const numStr = val.replace(/[^0-9]/g, '');
                          return numStr ? Number(numStr).toLocaleString() : '';
                      }}
                      onClick={(e) => e.stopPropagation()}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="bg-transparent focus:outline-none w-full text-right placeholder-gray-400 p-0"
                      placeholder="0"
                    />
                    <span className="text-base text-gray-500 font-medium">원</span>
                </div>
            </div>
                </div>
            </div>
        </div>, 
        document.body
    );
}