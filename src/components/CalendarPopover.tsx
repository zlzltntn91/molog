import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight, Repeat, Trash2 } from 'lucide-react'

import { Transaction } from '../types/ledger'

interface CalendarPopoverProps {
  item: Transaction
  targetRect: DOMRect
  onClose: () => void
  onUpdate: (t: Transaction) => void
  onDelete: (id: string) => void
}

// ---- Sub-components ----
const PopoverArrow = ({ direction, style, className }: { direction: 'left' | 'right' | 'top' | 'bottom', style: React.CSSProperties, className?: string }) => {
    let d = "";
    let width = 0;
    let height = 0;
    let viewBox = "";
    let basePath = ""; 

    if (direction === 'left') {
        width = 10; height = 20; viewBox = "0 0 10 20";
        d = "M 10 0 L 0 10 L 10 20"; 
        basePath = "M 9.5 0 L 9.5 20";
    } else if (direction === 'right') {
        width = 10; height = 20; viewBox = "0 0 10 20";
        d = "M 0 0 L 10 10 L 0 20";
        basePath = "M 0.5 0 L 0.5 20";
    } else if (direction === 'top') {
        width = 20; height = 10; viewBox = "0 0 20 10";
        d = "M 0 10 L 10 0 L 20 10";
        basePath = "M 0 9.5 L 20 9.5";
    } else if (direction === 'bottom') {
        width = 20; height = 10; viewBox = "0 0 20 10";
        d = "M 0 0 L 10 10 L 20 0";
        basePath = "M 0 0.5 L 20 0.5";
    }

    return (
        <div style={{ ...style, width, height, position: 'absolute', pointerEvents: 'none', zIndex: 101 }} className={className}>
            <svg width={width} height={height} viewBox={viewBox} fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* fill을 currentColor로 설정하여 부모의 text color를 따르게 함 (다크/라이트 모드 대응) */}
                <path d={d} className="fill-white dark:fill-[#2c2c2e] stroke-gray-200 dark:stroke-white/10" strokeWidth="1" strokeLinejoin="round" />
                <path d={basePath} className="stroke-white dark:stroke-[#2c2c2e]" strokeWidth="3" />
            </svg>
        </div>
    );
}

export default function CalendarPopover({ item, targetRect, onClose, onUpdate, onDelete }: CalendarPopoverProps) {
    const popoverRef = useRef<HTMLDivElement>(null)
    const [style, setStyle] = useState<React.CSSProperties>({ visibility: 'hidden', opacity: 0 })
    const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({})
    const [arrowDirection, setArrowDirection] = useState<'left' | 'right' | 'top' | 'bottom'>('left')
    
    // Local Edit State
    const [editForm, setEditForm] = useState(item)
    const editFormRef = useRef(item)

    // Calendar State
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)
    const [calendarMonth, setCalendarMonth] = useState(new Date(item.date))
    const lastItemIdRef = useRef(item.id)

    useEffect(() => {
        editFormRef.current = editForm
    }, [editForm])

    useEffect(() => {
        if (lastItemIdRef.current !== item.id) {
            setIsCalendarOpen(false)
        }
        lastItemIdRef.current = item.id

        setEditForm(item)
        setCalendarMonth(new Date(item.date))
    }, [item])

    const handleSaveAndClose = () => {
        onClose()
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            // 달력 네비게이션 버튼 클릭 시 닫히지 않도록 예외 처리 추가
            if (popoverRef.current && !popoverRef.current.contains(target) && !target.closest('.ledger-item')) {
                handleSaveAndClose()
            }
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleSaveAndClose()
            }
            if (event.key === 'Enter') {
                handleSaveAndClose()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleKeyDown)
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [onClose])

    useEffect(() => {
        const updatePosition = () => {
            if (!popoverRef.current) return

            const popoverWidth = 320
            const popoverHeight = popoverRef.current.offsetHeight
            const ARROW_LENGTH = 10
            
            const viewportWidth = window.innerWidth
            const viewportHeight = window.innerHeight

            // 요소가 화면 중앙보다 아래에 있는지 확인
            const isBottomHalf = targetRect.top > viewportHeight / 2

            let left = 0
            let top: number | string = 'auto'
            let bottom: number | string = 'auto'
            
            let newArrowDirection: 'left' | 'right' | 'top' | 'bottom' = 'left'
            let newArrowStyle: React.CSSProperties = {}

            // Strategy 1: Side Positioning (Desktop preferred)
            const canFitRight = targetRect.right + ARROW_LENGTH + popoverWidth <= viewportWidth - 10
            const canFitLeft = targetRect.left - ARROW_LENGTH - popoverWidth >= 10

            // 모바일 환경(좁은 너비)에서는 상하 배치를 우선시하거나, 사이드 공간이 충분할 때만 사이드 배치
            const isMobileWidth = viewportWidth < 768; 
            const preferSide = !isMobileWidth && (canFitRight || canFitLeft);

            if (preferSide) {
                if (canFitRight) {
                    left = targetRect.right + ARROW_LENGTH
                    newArrowDirection = 'left'
                    newArrowStyle = { left: -9 }
                } else {
                    left = targetRect.left - ARROW_LENGTH - popoverWidth
                    newArrowDirection = 'right'
                    newArrowStyle = { right: -9 }
                }

                // Vertical Anchoring
                if (isBottomHalf) {
                    // Anchor to Bottom
                    let idealBottom = viewportHeight - targetRect.bottom
                    if (idealBottom < 10) idealBottom = 10 
                    bottom = idealBottom
                    
                    const popoverTopY = viewportHeight - (bottom as number) - popoverHeight
                    const targetCenterY = targetRect.top + (targetRect.height / 2)
                    const arrowY = targetCenterY - popoverTopY - 10
                    
                    newArrowStyle = { ...newArrowStyle, top: Math.max(10, Math.min(arrowY, popoverHeight - 20)) }
                } else {
                    // Anchor to Top
                    let idealTop = targetRect.top
                    if (idealTop < 10) idealTop = 10
                    top = idealTop
                    
                    const targetCenterY = targetRect.top + (targetRect.height / 2)
                    const arrowY = targetCenterY - top - 10
                    newArrowStyle = { ...newArrowStyle, top: Math.max(10, Math.min(arrowY, popoverHeight - 20)) }
                }
            } 
            // Strategy 2: Top/Bottom Positioning
            else {
                // Center horizontally
                left = (viewportWidth - popoverWidth) / 2
                // Ensure it doesn't go off-screen horizontally
                left = Math.max(10, Math.min(left, viewportWidth - popoverWidth - 10));

                const spaceAbove = targetRect.top - ARROW_LENGTH - 10;
                const spaceBelow = viewportHeight - targetRect.bottom - ARROW_LENGTH - 10;
                
                // 달력이 열릴 경우를 대비해 여유 공간이 더 큰 쪽을 선호
                // 특히 하단에 있으면 위쪽 공간이 넓으므로 위쪽을 우선
                const preferTop = isBottomHalf || (spaceAbove > spaceBelow);

                // Check if it actually fits
                const canFitAbove = spaceAbove >= popoverHeight;
                const canFitBelow = spaceBelow >= popoverHeight;

                if (preferTop && canFitAbove) {
                     // Place Above (Bottom Anchor)
                     bottom = viewportHeight - targetRect.top + ARROW_LENGTH
                     newArrowDirection = 'bottom'
                     newArrowStyle = { bottom: -9 } 
                     
                     const arrowX = (targetRect.left + targetRect.width / 2) - left - 10
                     newArrowStyle = { ...newArrowStyle, left: Math.max(10, Math.min(arrowX, popoverWidth - 20)) }
                } else if (canFitBelow) {
                     // Place Below (Top Anchor)
                     top = targetRect.bottom + ARROW_LENGTH
                     newArrowDirection = 'top'
                     newArrowStyle = { top: -9 } 
                     
                     const arrowX = (targetRect.left + targetRect.width / 2) - left - 10
                     newArrowStyle = { ...newArrowStyle, left: Math.max(10, Math.min(arrowX, popoverWidth - 20)) }
                } else {
                    // If fits nowhere, place where there is MORE space
                    if (spaceAbove > spaceBelow) {
                        bottom = viewportHeight - targetRect.top + ARROW_LENGTH
                        newArrowDirection = 'bottom'
                        newArrowStyle = { bottom: -9 }
                        // Note: Might get cut off at top, simple clamping could be added if needed
                         const arrowX = (targetRect.left + targetRect.width / 2) - left - 10
                         newArrowStyle = { ...newArrowStyle, left: Math.max(10, Math.min(arrowX, popoverWidth - 20)) }
                    } else {
                        top = targetRect.bottom + ARROW_LENGTH
                        newArrowDirection = 'top'
                        newArrowStyle = { top: -9 }
                        const arrowX = (targetRect.left + targetRect.width / 2) - left - 10
                        newArrowStyle = { ...newArrowStyle, left: Math.max(10, Math.min(arrowX, popoverWidth - 20)) }
                    }
                }
            }

            setStyle({
                position: 'fixed',
                left,
                top,
                bottom,
                zIndex: 100,
                width: popoverWidth,
                visibility: 'visible',
                opacity: 1
            })
            setArrowDirection(newArrowDirection)
            setArrowStyle(newArrowStyle)
        }

        const timeoutId = setTimeout(updatePosition, 0)
        window.addEventListener('resize', updatePosition)
        return () => {
            clearTimeout(timeoutId)
            window.removeEventListener('resize', updatePosition)
        }
    }, [targetRect, item, isCalendarOpen]) // Re-calc on calendar toggle

    const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value
        const updated = { ...editForm, title: newTitle }
        setEditForm(updated)
        onUpdate(updated)
    }

    const handleChangeAmount = (val: string) => {
        const num = Number(val.replace(/[^0-9]/g, ''))
        const updated = { ...editForm, amount: num }
        setEditForm(updated)
        onUpdate(updated)
    }

    const toggleType = () => {
        const newType = editForm.type === 'income' ? 'expense' : 'income'
        const updated = { ...editForm, type: newType }
        setEditForm(updated)
        onUpdate(updated)
    }

    const handleDateSelect = (day: Date) => {
        const updated = { ...editForm, date: format(day, 'yyyy-MM-dd') }
        setEditForm(updated)
        onUpdate(updated)
    }

    const calendarDays = eachDayOfInterval({
        start: startOfWeek(startOfMonth(calendarMonth)),
        end: endOfWeek(endOfMonth(calendarMonth))
    })

    const typeColorClass = editForm.type === 'income' ? 'bg-green-500' : 'bg-red-500'

    return createPortal(
        <div 
            ref={popoverRef} 
            style={style} 
            className="bg-white dark:bg-[#2c2c2e]/95 backdrop-blur-md text-gray-900 dark:text-white rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 animate-in fade-in zoom-in-95 duration-200 relative text-sm font-sans"
        >
            <PopoverArrow direction={arrowDirection} style={arrowStyle} />

            {/* Header */}
            <div className="flex justify-between items-start p-3 pl-4 pr-3">
                <div className="flex-1 mr-2 pt-1">
                    <input 
                        type="text" 
                        value={editForm.title} 
                        onChange={handleChangeTitle}
                        className="bg-transparent text-xl font-bold w-full focus:outline-none placeholder-gray-400 dark:placeholder-gray-500"
                    />
                </div>
                <div className="flex items-center gap-1">
                     <button onClick={toggleType} className="p-1 rounded transition-colors hover:bg-gray-100 dark:hover:bg-white/10">
                         <div className={`w-4 h-4 rounded-sm ${typeColorClass} border border-gray-200 dark:border-white/20 shadow-sm`}></div>
                    </button>
                    <div className="flex items-center ml-2 border-l border-gray-200 dark:border-white/10 pl-2">
                        <button onClick={() => onDelete(item.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-500/20 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Date */}
            <div className="px-4 py-2 border-t border-gray-200 dark:border-white/10 flex flex-col gap-1">
                <div 
                    onClick={() => {
                        setCalendarMonth(new Date(editForm.date))
                        setIsCalendarOpen(!isCalendarOpen)
                    }}
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 p-1 -ml-1 rounded transition-colors flex items-center justify-between group"
                >
                    <span className="font-medium text-gray-700 dark:text-gray-200">{format(new Date(editForm.date), 'yyyy. M. d.')}</span>
                    <ChevronRight className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-transform duration-300 ${isCalendarOpen ? 'rotate-90' : ''}`} />
                </div>
                
                {/* Calendar with Animation */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCalendarOpen ? 'max-h-64 opacity-100 mt-2 mb-2' : 'max-h-0 opacity-0'}`}>
                    <div className="p-2 bg-gray-50 dark:bg-black/20 rounded-lg border border-gray-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-2">
                             <button onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))} className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-400"><ChevronLeft className="w-4 h-4" /></button>
                             <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{format(calendarMonth, 'yyyy. M')}</span>
                             <button onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))} className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-400"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                        <div className="grid grid-cols-7 text-center gap-y-1">
                            {['일','월','화','수','목','금','토'].map(d => <div key={d} className="text-[10px] text-gray-400">{d}</div>)}
                            {calendarDays.map(day => {
                                const isSelected = isSameDay(day, new Date(editForm.date))
                                const isCurrentM = isSameMonth(day, calendarMonth)
                                return (
                                    <button 
                                        key={day.toISOString()} 
                                        onClick={() => handleDateSelect(day)}
                                        className={`w-7 h-7 text-xs rounded-full flex items-center justify-center mx-auto transition-colors ${
                                            isSelected ? 'bg-blue-600 text-white font-bold' : 
                                            isCurrentM ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/10' : 'text-gray-300 dark:text-gray-600'
                                        }`}
                                    >
                                        {format(day, 'd')}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <Repeat className="w-3 h-3" />
                    <span>반복: 매월</span>
                </div>
            </div>

            {/* Amount */}
            <div className="px-4 py-2 border-t border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-xs w-8 text-left">금액</span>
                     <div className="flex items-center gap-1 w-full">
                         <input 
                            type="text" 
                            value={editForm.amount.toLocaleString()} 
                            onChange={(e) => handleChangeAmount(e.target.value)}
                            className="bg-transparent text-base font-semibold text-gray-900 dark:text-white w-full focus:outline-none text-right pr-1"
                        />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">원</span>
                     </div>
                </div>
            </div>

            {/* Notes */}
            <div className="px-4 py-2 pb-3 border-t border-gray-200 dark:border-white/10 flex items-center gap-2">
                <input 
                    type="text" 
                    placeholder="메모, URL 또는 첨부 파일 추가" 
                    className="bg-transparent w-full text-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-gray-200 focus:outline-none"
                    readOnly 
                />
            </div>
        </div>,
        document.body
    )
}