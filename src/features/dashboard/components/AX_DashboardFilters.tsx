'use client';

import React, { useState } from 'react';
import { Calendar, Filter, ChevronDown, Check, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AX_DashboardFiltersProps {
    onTimeChange: (range: string) => void;
    onStoreChange: (storeId: string) => void;
    stores: { id: string, name: string }[];
}

const timeRanges = [
    { value: 'today', label: 'اليوم' },
    { value: '7d', label: 'آخر 7 أيام' },
    { value: '30d', label: 'آخر 30 يوم' },
    { value: '1y', label: 'السنة الحالية' },
    { value: 'custom', label: 'تاريخ مخصص...' }
];

export const AX_DashboardFilters = ({ onTimeChange, onStoreChange, stores }: AX_DashboardFiltersProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(timeRanges[1]);
    const [showCustom, setShowCustom] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSelect = (range: typeof timeRanges[0]) => {
        setSelected(range);
        setIsOpen(false);
        if (range.value === 'custom') {
            setShowCustom(true);
        } else {
            setShowCustom(false);
            onTimeChange(range.value);
        }
    };

    const applyCustomRange = () => {
        if (startDate && endDate) {
            onTimeChange(`custom:${startDate}:${endDate}`);
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-4 bg-background border-2 border-border/50 p-3 rounded-3xl shadow-xl shadow-primary/5 transition-all duration-500 relative">
            {/* Custom Animated Dropdown */}
            <div className="relative group/filter">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "flex items-center gap-4 px-6 py-3.5 bg-secondary/30 border-2 rounded-2xl transition-all cursor-pointer min-w-[200px] shadow-inner",
                        isOpen ? "border-primary bg-background" : "border-transparent hover:border-primary/20 hover:bg-secondary/50"
                    )}
                >
                    <Calendar size={18} className={cn("transition-colors duration-500", isOpen ? "text-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]" : "text-muted-foreground")} />
                    <span className="text-xs font-black text-foreground flex-1 tracking-tight">{selected.label}</span>
                    <ChevronDown size={14} className={cn("text-muted-foreground transition-transform duration-500", isOpen && "rotate-180 text-primary")} />
                </motion.div>

                <AnimatePresence>
                    {isOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                            <motion.div
                                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                animate={{ opacity: 1, y: 10, scale: 1 }}
                                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                transition={{ duration: 0.4 }}
                                className="absolute top-full left-0 z-50 bg-background border-2 border-primary/20 rounded-2xl overflow-hidden shadow-2xl p-2 min-w-[240px] backdrop-blur-2xl"
                            >
                                <div className="px-3 py-2 border-b border-border/50 mb-1">
                                    <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] opacity-60">نطاقات زمنية</p>
                                </div>
                                {timeRanges.map((range) => (
                                    <div
                                        key={range.value}
                                        onClick={() => handleSelect(range)}
                                        className={cn(
                                            "flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all mb-1 last:mb-0 group/item",
                                            selected.value === range.value
                                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                        )}
                                    >
                                        <span className="text-xs font-black tracking-tight">{range.label}</span>
                                        {selected.value === range.value && <Check size={14} className="text-white animate-in zoom-in duration-300" />}
                                    </div>
                                ))}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>

            {/* Custom Date Inputs */}
            {showCustom && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 bg-secondary/30 p-2 rounded-2xl border-2 border-primary/10 shadow-inner"
                >
                    <div className="flex flex-col px-3">
                        <span className="text-[8px] text-primary font-black uppercase tracking-widest leading-none mb-1">من التاريخ</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent text-xs text-foreground font-black focus:outline-none appearance-none"
                        />
                    </div>
                    <div className="w-px h-6 bg-primary/20" />
                    <div className="flex flex-col px-3">
                        <span className="text-[8px] text-primary font-black uppercase tracking-widest leading-none mb-1">إلى التاريخ</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent text-xs text-foreground font-black focus:outline-none appearance-none"
                        />
                    </div>
                </motion.div>
            )}

            <div className="h-10 w-px bg-border/50 mx-2 hidden xl:block" />

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => showCustom ? applyCustomRange() : onTimeChange(selected.value)}
                className="h-14 flex items-center gap-4 px-10 bg-primary hover:bg-primary/90 text-white rounded-2xl transition-all shadow-xl shadow-primary/10 group active:shadow-inner"
            >
                <Filter size={18} className="group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-xs font-black uppercase tracking-widest">تحديث البيانات</span>
            </motion.button>
        </div>
    );
};
