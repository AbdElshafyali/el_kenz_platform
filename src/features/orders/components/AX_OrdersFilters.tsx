'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { STATUS_MAP } from '../constants';

interface AX_OrdersFiltersProps {
    currentStatus: string;
    onStatusChange: (status: string) => void;
    counts: Record<string, number>;
    total: number;
}

export const AX_OrdersFilters = ({ currentStatus, onStatusChange, counts, total }: AX_OrdersFiltersProps) => {
    return (
        <div className="flex gap-3 overflow-x-auto pb-4 pt-2 no-scrollbar scroll-smooth transition-all duration-500">
            <button
                onClick={() => onStatusChange('all')}
                className={cn(
                    "relative px-6 py-3.5 rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all border active:scale-95 shadow-sm min-w-[100px]",
                    currentStatus === 'all' 
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                    : "bg-secondary/40 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                )}
            >
                <div className="flex items-center justify-between gap-4">
                    <span>الكل</span>
                    <span className={cn(
                        "px-2 py-0.5 rounded-lg text-[9px] font-black",
                        currentStatus === 'all' ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                    )}>
                        {total}
                    </span>
                </div>
            </button>

            {Object.entries(STATUS_MAP).map(([key, val]) => (
                <button
                    key={key}
                    onClick={() => onStatusChange(key)}
                    className={cn(
                        "relative px-6 py-3.5 rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all border active:scale-95 shadow-sm min-w-[120px]",
                        currentStatus === key 
                        ? `${val.bg} ${val.color} border-transparent shadow-lg shadow-primary/5` 
                        : "bg-secondary/40 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                    )}
                >
                    <div className="flex items-center justify-between gap-4">
                        <span className="whitespace-nowrap">{val.label}</span>
                        <span className={cn(
                            "px-2 py-0.5 rounded-lg text-[9px] font-black",
                            currentStatus === key ? "bg-black/10 text-inherit" : "bg-primary/10 text-primary"
                        )}>
                            {counts[key] || 0}
                        </span>
                    </div>
                </button>
            ))}
        </div>
    );
};
