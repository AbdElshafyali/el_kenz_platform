'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export const AX_OrdersSkeleton = () => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4 transition-colors duration-300">
            <div className="relative">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
            </div>
            <p className="text-muted-foreground text-xs font-black uppercase tracking-[0.2em] italic">جاري تحميل الطلبات...</p>
        </div>
    );
};
