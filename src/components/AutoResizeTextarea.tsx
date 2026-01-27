import { useState, useRef, useEffect, useLayoutEffect } from 'react';

interface AutoResizeTextareaProps {
  value: string;
  onChange: (val: string) => void;
  onEnter: () => void;
  className?: string;
  placeholder?: string;
}

export default function AutoResizeTextarea({ value, onChange, onEnter, className, placeholder }: AutoResizeTextareaProps) {
  const [localValue, setLocalValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useLayoutEffect(() => {
    if (ghostRef.current && textareaRef.current) {
      const styles = window.getComputedStyle(textareaRef.current);
      ghostRef.current.style.width = styles.width;
      ghostRef.current.style.padding = styles.padding;
      ghostRef.current.style.font = styles.font;
      ghostRef.current.style.lineHeight = styles.lineHeight;
      ghostRef.current.style.letterSpacing = styles.letterSpacing;
      
      ghostRef.current.textContent = localValue + '\u200b'; 
      const height = ghostRef.current.scrollHeight;
      
      textareaRef.current.style.height = `${height}px`;
    }
  }, [localValue]);

  const handleBlur = () => {
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  return (
    <div className="relative w-full">
      <div
        ref={ghostRef}
        className="invisible absolute top-0 left-0 w-full whitespace-pre-wrap break-words pointer-events-none"
        aria-hidden="true"
      />
      <textarea
        ref={textareaRef}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
           if (e.key === 'Enter' && !e.shiftKey) {
             e.preventDefault();
             handleBlur();
             onEnter();
           }
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className={className || "bg-transparent text-2xl font-bold focus:outline-none w-full placeholder-gray-400 leading-tight resize-none overflow-hidden min-h-[1.5em]"}
        placeholder={placeholder || "내역 이름"}
        rows={1}
      />
    </div>
  );
}