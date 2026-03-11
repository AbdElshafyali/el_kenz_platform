'use client';

import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { AX_ThemeToggle } from '@/components/ui/AX_ThemeToggle';
import { cn } from '@/lib/utils';

interface AX_StoreHeaderProps {
    totalCount: number;
    onCartOpen: () => void;
}

const AX_StoreHeader = ({ totalCount, onCartOpen }: AX_StoreHeaderProps) => {
    return (
        <nav className="fixed top-0 inset-x-0 h-16 bg-background/60 backdrop-blur-2xl border-b border-border z-[100] flex items-center justify-between px-4 md:px-8 transition-all duration-500">
            {/* Logo */}
            <div className="flex items-center gap-3 group cursor-pointer">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-125 group-hover:bg-primary/40 transition-all duration-700" />
                    <img 
                        src="/logo.png" 
                        alt="الكنز ستور" 
                        className="w-10 h-10 object-contain relative z-10 drop-shadow-2xl group-hover:scale-110 transition-transform duration-500" 
                    />
                </div>
                <div className="flex flex-col">
                    <span className="text-lg font-black tracking-tighter leading-none">
                        مـتـجر <span className="text-primary italic">الـكنـز</span>
                    </span>
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.05em] leading-none mt-1 opacity-80 max-w-[180px] line-clamp-1">
                        أكبر تشكيله أدوات منزلية واكسسوارات بـ ٣٥ ج
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-4">
                <AX_ThemeToggle />
            </div>
        </nav>
    );
};

export default AX_StoreHeader;
