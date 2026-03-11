'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AX_StatsCardProps {
    label: string;
    value: string;
    change: number;
    icon: React.ReactNode;
    color: 'amber' | 'green' | 'blue' | 'red';
}

export const AX_StatsCard = ({ label, value, change, icon, color }: AX_StatsCardProps) => {
    const isPositive = change >= 0;

    const colors = {
        amber: 'from-amber-500/20 to-transparent text-amber-500 border-amber-500/20',
        green: 'from-green-500/20 to-transparent text-green-500 border-green-500/20',
        blue: 'from-blue-500/20 to-transparent text-blue-500 border-blue-500/20',
        red: 'from-red-500/20 to-transparent text-red-500 border-red-500/20',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className={cn(
                "relative overflow-hidden bg-zinc-900/40 border border-zinc-800 p-6 rounded-[2rem] transition-all duration-300",
                "hover:border-zinc-700/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            )}
        >
            <div className={cn("absolute inset-0 bg-gradient-to-br -z-10", colors[color])} />

            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800 shadow-inner", colors[color])}>
                    {icon}
                </div>
                <div className={cn(
                    "flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black tracking-tighter",
                    isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                )}>
                    {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(change)}%
                </div>
            </div>

            <div className="space-y-1">
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
                <h3 className="text-3xl font-black text-white tracking-tighter">{value}</h3>
            </div>

            <div className="absolute -bottom-2 -right-2 opacity-5 scale-150 rotate-12">
                {icon}
            </div>
        </motion.div>
    );
};
