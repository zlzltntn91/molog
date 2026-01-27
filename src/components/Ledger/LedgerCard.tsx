import { useState, useRef, useEffect } from 'react';
import { format, isSameDay, isSameMonth, subMonths, addMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { Plus, Minus, ChevronLeft, ChevronRight, Calendar, Trash2 } from 'lucide-react';
import AutoResizeTextarea from '../AutoResizeTextarea';

interface Transaction {
  id: string;
  date: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
}

interface LedgerCardProps {
  t: Transaction;
  isExpanded: boolean;
  isCalOpen: boolean;
  calMonth: Date;
  onExpand: () => void;
  onCollapse: () => void;
  onUpdate: (updated: Transaction) => void;
  onDelete: () => void;
  onCalendarToggle: () => void;
  setCalMonth: (d: Date) => void;
}

export default function LedgerCard({ t, isExpanded, isCalOpen, calMonth, onExpand, onCollapse, onUpdate, onDelete, onCalendarToggle, setCalMonth }: LedgerCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | 'auto'>('auto');
  const calDays = eachDayOfInterval({ start: startOfWeek(startOfMonth(calMonth)), end: endOfWeek(endOfMonth(calMonth)) });

  // Smooth Height Animation Logic
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
         // We can use this to detect content size changes if needed
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  return (
    <div 
        id={`ledger-item-${t.id}`}
        className={`transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative
            ${isExpanded 
                ? 'z-10 bg-white dark:bg-[#2c2c2e] rounded-2xl border border-theme shadow-lg' 
                : 'bg-white dark:bg-[#2c2c2e] rounded-2xl border border-theme hover:bg-gray-50/50 dark:hover:bg-white/[0.01] overflow-hidden'
            }
        `}
    >
        {/* Highlight Bar & Tint (Expanded Only) - Clipped to rounded corners */}
        <div className={`absolute inset-0 rounded-2xl overflow-hidden pointer-events-none transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
             <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${t.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
             <div className={`absolute inset-0 opacity-30 ${t.type === 'income' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`} />
        </div>

        <div ref={containerRef} className="relative">
            {!isExpanded ? (
                <div 
                    onMouseDown={(e) => { 
                        if (e.button !== 0) return;
                        e.preventDefault();
                        onExpand();
                    }} 
                    className="flex items-center p-4 cursor-pointer"
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 transition-colors ${t.type === 'income' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-50 dark:bg-red-900/30 text-red-500'}`}>
                        {t.type === 'income' ? <Plus className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base mb-0.5 truncate">{t.title || '내역 없음'}</h3>
                        <p className="text-xs text-gray-400">{t.type === 'income' ? '수입' : '지출'}</p>
                    </div>
                    <span className={`font-bold text-lg ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                        {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400 ml-2 transition-transform duration-300" />
                </div>
            ) : (
                <div className="p-4 pr-7 pl-7 animate-in fade-in slide-in-from-top-2 duration-300 relative">
                    {/* 1. Header: Date (Left) & Actions (Right) */}
                    <div className="flex justify-between items-center mb-3">
                        {/* Date & Calendar */}
                        <div className="relative">
                            <div 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    onCalendarToggle();
                                }} 
                                className="cursor-pointer flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors w-fit rounded py-1"
                            >
                                <Calendar className="w-3.5 h-3.5" />
                                <span className="font-medium text-xs">{format(new Date(t.date), 'yyyy년 M월 d일')}</span>
                                <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${isCalOpen ? 'rotate-90' : ''}`} />
                            </div>
                            {isCalOpen && (
                                <div className="absolute top-full left-0 mt-2 z-50 p-3 bg-white dark:bg-[#1c1c1e] rounded-xl shadow-xl border border-theme min-w-[280px]">
                                    <div className="flex justify-between mb-2">
                                        <button onClick={() => setCalMonth(subMonths(calMonth, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded"><ChevronLeft className="w-4 h-4" /></button>
                                        <span className="font-bold text-sm">{format(calMonth, 'yyyy. M')}</span>
                                        <button onClick={() => setCalMonth(addMonths(calMonth, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded"><ChevronRight className="w-4 h-4" /></button>
                                    </div>
                                    <div className="grid grid-cols-7 text-center gap-1">
                                        {['일','월','화','수','목','금','토'].map(d => <div key={d} className="text-[10px] text-gray-400">{d}</div>)}
                                        {calDays.map(day => (
                                            <button key={day.toISOString()} onClick={() => { onUpdate({ ...t, date: format(day, 'yyyy-MM-dd') }); onCalendarToggle(); }} className={`w-7 h-7 text-xs rounded-full flex items-center justify-center mx-auto transition-colors duration-200 ${isSameDay(day, new Date(t.date)) ? 'bg-blue-600 text-white font-bold' : isSameMonth(day, calMonth) ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10' : 'text-gray-300 dark:text-gray-600'}`}>{format(day, 'd')}</button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1">
                            <button onClick={() => onUpdate({ ...t, type: t.type === 'income' ? 'expense' : 'income' })} className={`p-1.5 rounded-lg transition-colors ${t.type === 'income' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                {t.type === 'income' ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                            </button>
                            <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                            <button onClick={onCollapse} className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"><ChevronRight className="w-4 h-4 rotate-90" /></button>
                        </div>
                    </div>

                    {/* 2. Title (Textarea) */}
                    <div className="mb-2">
                        <AutoResizeTextarea
                            value={t.title}
                            onChange={(val) => onUpdate({ ...t, title: val })}
                            onEnter={onCollapse}
                        />
                    </div>                                                                                      
                    
                    {/* 3. Amount */}
                    <div className="pr-1.5">
                        <div className={`flex items-center gap-1 text-xl font-bold ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            <input 
                                type="text" 
                                value={t.amount.toLocaleString()} 
                                onChange={(e) => { const val = Number(e.target.value.replace(/[^0-9]/g, '')); onUpdate({ ...t, amount: val }); }} 
                                onKeyDown={(e) => e.key === 'Enter' && onCollapse()} 
                                onClick={(e) => e.stopPropagation()}
                                className="bg-transparent focus:outline-none w-full text-right placeholder-gray-400 p-0" 
                            />
                            <span className="text-base text-gray-500 font-medium">원</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}