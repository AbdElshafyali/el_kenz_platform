'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InventoryStatProps {
    label: string;
    value: string | number;
    color: 'amber' | 'green' | 'blue' | 'zinc';
    icon: React.ReactNode;
}

export const AX_InventoryStat = ({ label, value, color, icon }: InventoryStatProps) => {
    const colors: any = {
        amber: {
            text: 'text-primary',
            bg: 'bg-primary/10',
            border: 'border-primary/20',
            shadow: 'shadow-primary/10'
        },
        green: {
            text: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            shadow: 'shadow-emerald-500/10'
        },
        blue: {
            text: 'text-sky-500',
            bg: 'bg-sky-500/10',
            border: 'border-sky-500/20',
            shadow: 'shadow-sky-500/10'
        },
        zinc: {
            text: 'text-muted-foreground',
            bg: 'bg-secondary/50',
            border: 'border-border',
            shadow: 'shadow-primary/5'
        }
    };

    const c = colors[color];

    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className="bg-background border-2 border-border/50 p-8 rounded-[2.5rem] shadow-xl shadow-primary/5 flex flex-col gap-6 group hover:border-primary/20 transition-all duration-500"
        >
            <div className="flex items-center justify-between">
                <div className={cn("p-3 rounded-2xl border transition-all duration-500 shadow-lg group-hover:scale-110", c.bg, c.border, c.text, c.shadow)}>
                    {icon}
                </div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 text-left">{label}</p>
            </div>
            <div className="flex items-baseline gap-2">
                <p className={cn("text-4xl font-black tracking-tighter leading-none", c.text)}>{value.toLocaleString()}</p>
                <div className={cn("w-1.5 h-1.5 rounded-full", c.text.replace('text-', 'bg-'))} />
            </div>
        </motion.div>
    );
};
