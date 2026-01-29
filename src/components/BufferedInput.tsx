import { useState, useEffect } from 'react';

interface BufferedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string | number;
  onValueChange: (val: string) => void;
  onEnter?: () => void;
  processInput?: (val: string) => string;
}

export default function BufferedInput({ value, onValueChange, onEnter, processInput, ...props }: BufferedInputProps) {
  const [localValue, setLocalValue] = useState<string | number>(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    if (String(localValue) !== String(value)) {
      onValueChange(String(localValue));
    }
  };

  return (
    <input
      {...props}
      value={localValue}
      onChange={(e) => {
          const nextVal = processInput ? processInput(e.target.value) : e.target.value;
          setLocalValue(nextVal);
      }}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleBlur();
          onEnter?.();
        }
        props.onKeyDown?.(e);
      }}
      // OS interferences removal
      spellCheck={false}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
    />
  );
}