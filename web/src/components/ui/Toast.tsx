import type React from 'react';
import '../../assets/css/toast.css';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export interface ToastProps { id: string; type: ToastType; title: string; message: string; onClose: (id: string) => void; }
const icons: Record<ToastType, string> = { success: '✓', error: '!', warning: '⚠', info: 'i' };

export const Toast: React.FC<ToastProps> = ({ id, type, title, message, onClose }) => <div className={`toast toast-${type}`} role="status"><div className="toast-icon">{icons[type]}</div><div className="toast-content"><div className="toast-title">{title}</div><div className="toast-message">{message}</div></div><button className="toast-close" type="button" onClick={() => onClose(id)} aria-label="Закрыть">×</button></div>;
