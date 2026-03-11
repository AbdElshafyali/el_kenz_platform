'use client';

import React from 'react';
import { Search, ChevronRight, Ban, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AX_Customer } from '../types';

interface AX_CustomerListProps {
    customers: AX_Customer[];
    loading: boolean;
    search: string;
    onSearchChange: (q: string) => void;
    filter: 'all' | 'blocked';
    onFilterChange: (f: 'all' | 'blocked') => void;
    selectedId?: string;
    onSelect: (c: AX_Customer) => void;
}

export const AX_CustomerList = ({ 
    customers, loading, search, onSearchChange, filter, onFilterChange, selectedId, onSelect 
}: AX_CustomerListProps) => {
    return (
        <div className="space-y-4 transition-colors duration-300">
            <div className="space-y-2">
                <div className="relative group">
                    <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        value={search}
                        onChange={e => onSearchChange(e.target.value)}
                        placeholder="ابحث بالاسم أو التليفون..."
                        className="w-full bg-secondary/40 border border-border rounded-xl pr-10 pl-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 outline-none focus:border-primary/50 transition-all font-bold shadow-sm"
                    />
                </div>
                <div className="flex gap-2">
                    {(['all', 'blocked'] as const).map(f => (
                        <button 
                            key={f} 
                            onClick={() => onFilterChange(f)}
                            className={cn(
                                "flex-1 py-1.5 rounded-xl text-[10px] font-black transition-all border shadow-sm",
                                filter === f 
                                ? "bg-primary text-primary-foreground border-primary" 
                                : "bg-secondary text-muted-foreground border-border hover:border-primary/30"
                            )}
                        >
                            {f === 'all' ? `الكل (${customers.length})` : `محظورين (${customers.filter(c => c.is_blocked).length})`}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar p-1">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-[10px] font-black text-muted-foreground italic">جاري تحميل القائمة...</p>
                    </div>
                ) : customers.length === 0 ? (
                    <div className="py-20 text-center text-muted-foreground/40 text-xs font-black uppercase tracking-widest border-2 border-dashed border-border rounded-2xl">
                        لا يوجد عملاء
                    </div>
                ) : customers.map(c => (
                    <button
                        key={c.id}
                        onClick={() => onSelect(c)}
                        className={cn(
                            "w-full flex items-center gap-3 p-4 rounded-2xl border text-right transition-all group scale-100 active:scale-95",
                            selectedId === c.id
                            ? "bg-primary/10 border-primary shadow-md"
                            : "bg-secondary/40 border-border hover:border-primary/30 hover:bg-secondary/60"
                        )}
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-xs transition-colors shadow-inner",
                            c.is_blocked 
                            ? "bg-destructive/10 text-destructive border border-destructive/20" 
                            : selectedId === c.id ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                        )}>
                            {c.is_blocked ? <Ban size={16} /> : (c.name?.[0] || '?').toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={cn(
                                "text-sm font-black truncate transition-colors",
                                selectedId === c.id ? "text-primary" : "text-foreground"
                            )}>{c.name || 'بدون اسم'}</p>
                            <p className="text-[10px] text-muted-foreground/60 font-mono tracking-tighter italic">{c.phone}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-[9px] text-muted-foreground/40 font-black uppercase">{c.total_orders} طلب</span>
                            {c.is_blocked && <span className="text-[9px] text-destructive font-black bg-destructive/10 px-2 py-0.5 rounded-full border border-destructive/10">محظور</span>}
                        </div>
                        <ChevronRight size={14} className={cn(
                            "transition-transform rotate-180 shrink-0",
                            selectedId === c.id ? "text-primary" : "text-muted-foreground/30"
                        )} />
                    </button>
                ))}
            </div>
        </div>
    );
};
