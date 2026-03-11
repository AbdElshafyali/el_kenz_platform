'use client';

import React from 'react';
import { useToastStore } from '@/hooks/use-toast';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function AX_Toast() {
    const { toasts, remove } = useToastStore();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-6 left-6 z-[200] flex flex-col gap-3 pointer-events-none" dir="rtl">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`
                        pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-[1.25rem] shadow-2xl border backdrop-blur-xl animate-in fade-in slide-in-from-left-6 duration-300
                        ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : ''}
                        ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : ''}
                        ${toast.type === 'info' ? 'bg-zinc-900/90 border-zinc-800 text-zinc-300' : ''}
                    `}
                >
                    <div className="flex-shrink-0">
                        {toast.type === 'success' && <CheckCircle2 size={20} />}
                        {toast.type === 'error' && <AlertCircle size={20} />}
                        {toast.type === 'info' && <Info size={20} />}
                    </div>
                    <p className="text-sm font-black tracking-tight">{toast.message}</p>
                    <button
                        onClick={() => remove(toast.id)}
                        className="p-1 hover:bg-white/5 rounded-lg transition-colors ml-[-4px]"
                    >
                        <X size={16} className="opacity-50 hover:opacity-100" />
                    </button>
                </div>
            ))}
        </div>
    );
}
