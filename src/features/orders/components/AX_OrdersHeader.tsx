'use client';

import React from 'react';
import { Search, ShoppingBag } from 'lucide-react';

interface AX_OrdersHeaderProps {
    total: number;
    searchQuery: string;
    onSearchChange: (val: string) => void;
}

export const AX_OrdersHeader = ({ total, searchQuery, onSearchChange }: AX_OrdersHeaderProps) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 transition-all duration-500">
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/20 rotate-3 hover:rotate-0 transition-transform duration-500">
                    <ShoppingBag size={28} />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter uppercase leading-none">إدارة الطلبات</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest opacity-80">{total} طلب إجمالي مسجل</p>
                    </div>
                </div>
            </div>
            
            <div className="relative group w-full md:w-auto">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <Search className="text-muted-foreground group-focus-within:text-primary transition-all duration-300" size={18} />
                </div>
                <input
                    type="text"
                    placeholder="بحث برقم الطلب، الاسم، أو الهاتف..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full md:w-[400px] h-14 bg-secondary/40 border-2 border-border/50 rounded-2xl pr-12 pl-6 outline-none focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/5 transition-all text-sm font-black text-foreground shadow-sm placeholder:text-muted-foreground/30"
                />
            </div>
        </div>
    );
};
