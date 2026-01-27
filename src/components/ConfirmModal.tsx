import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ isOpen, message, onConfirm, onCancel }: ConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-200">
      <div className="bg-white dark:bg-[#2c2c2e] rounded-2xl shadow-2xl p-6 w-[320px] transform transition-all duration-200 scale-100 border border-theme">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">알림</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            취소
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            삭제
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
