import { useState, useCallback, useRef } from 'react';

export interface Toast {
  id: number;
  message: string;
}

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<number, number>>(new Map());

  const addToast = useCallback((message: string, duration = 2500) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message }]);
    const timer = window.setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      timers.current.delete(id);
    }, duration);
    timers.current.set(id, timer);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) { clearTimeout(timer); timers.current.delete(id); }
  }, []);

  return { toasts, addToast, removeToast };
}
