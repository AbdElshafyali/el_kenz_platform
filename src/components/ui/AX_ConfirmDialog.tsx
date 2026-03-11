'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock';

interface AX_ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    loading?: boolean;
}

export const AX_ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'تأكيد الحذف',
    cancelLabel = 'تراجع',
    variant = 'danger',
    loading = false
}: AX_ConfirmDialogProps) => {
    useBodyScrollLock(isOpen);
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={loading ? undefined : onClose}
                        className="absolute inset-0 bg-background/60 backdrop-blur-xl"
                    />

                    {/* Dialog Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-background border-2 border-border rounded-[2.5rem] shadow-2xl overflow-hidden p-8 text-center"
                    >
                        {/* Icon Header */}
                        <div className={cn(
                            "w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500",
                            variant === 'danger' ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" : 
                            variant === 'warning' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                            "bg-primary/10 text-primary border border-primary/20"
                        )}>
                            <AlertCircle size={40} strokeWidth={2.5} />
                        </div>

                        {/* Text */}
                        <div className="space-y-3 mb-10">
                            <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase">
                                {title}
                            </h3>
                            <p className="text-muted-foreground text-sm font-bold leading-relaxed px-4 opacity-70">
                                {description}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="w-full h-14 bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground font-black rounded-2xl text-xs transition-all disabled:opacity-50"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={loading}
                                className={cn(
                                    "w-full h-14 text-white font-black rounded-2xl text-xs transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50",
                                    variant === 'danger' ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20" : 
                                    variant === 'warning' ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20" :
                                    "bg-primary hover:bg-primary/90 shadow-primary/20"
                                )}
                            >
                                {loading && <Loader2 size={16} className="animate-spin" />}
                                {confirmLabel}
                            </button>
                        </div>

                        {/* Close button top right */}
                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
