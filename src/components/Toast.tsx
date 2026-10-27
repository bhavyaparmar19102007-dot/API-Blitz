import React from 'react';
import type { Toast as ToastType } from '../hooks/useToast';

interface Props { toasts: ToastType[]; }

export default function ToastContainer({ toasts }: Props) {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className="toast">{t.message}</div>
      ))}
    </div>
  );
}
