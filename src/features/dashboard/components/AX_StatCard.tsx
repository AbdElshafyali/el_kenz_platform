'use client';

import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AX_StatCardProps {
    label: string;
    value: string | number;
    change: string;
    trend: 'up' | 'down';
    icon: React.ReactNode;
    color: 'amber' | 'emerald' | 'sky' | 'rose' | 'zinc';
}

export const AX_StatCard = ({ label, value, change, trend, icon, color }: AX_StatCardProps) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const colorVariants = {
        amber: {
            bg: 'bg-primary/10',
            border: 'border-primary/30',
            text: 'text-primary',
            icon: 'bg-primary text-primary-foreground',
            hover: 'group-hover:border-primary/60 group-hover:bg-primary/15',
            shadow: 'shadow-primary/30'
        },
        emerald: {
            bg: 'bg-emerald-500/5',
            border: 'border-emerald-500/20',
            text: 'text-emerald-500',
            icon: 'bg-emerald-500 text-white',
            hover: 'group-hover:border-emerald-500/50 group-hover:bg-emerald-500/10',
            shadow: 'shadow-emerald-500/20'
        },
        sky: {
            bg: 'bg-sky-500/5',
            border: 'border-sky-500/20',
            text: 'text-sky-500',
            icon: 'bg-sky-500 text-white',
            hover: 'group-hover:border-sky-500/50 group-hover:bg-sky-500/10',
            shadow: 'shadow-sky-500/20'
        },
        rose: {
            bg: 'bg-rose-500/5',
            border: 'border-rose-500/20',
            text: 'text-rose-500',
            icon: 'bg-rose-500 text-white',
            hover: 'group-hover:border-rose-500/50 group-hover:bg-rose-500/10',
            shadow: 'shadow-rose-500/20'
        },
        zinc: {
            bg: 'bg-secondary/20',
            border: 'border-border',
            text: 'text-muted-foreground',
            icon: 'bg-secondary text-foreground',
            hover: 'group-hover:border-primary/30 group-hover:bg-secondary/40',
            shadow: 'shadow-primary/5'
        }
    };

    const variant = colorVariants[color];

    return (
        <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "relative h-48 w-full rounded-[2.5rem] border p-8 transition-all duration-700 group overflow-hidden shadow-sm",
                variant.bg,
                variant.border,
                variant.hover
            )}
        >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            
            <div
                style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }}
                className="flex h-full flex-col justify-between relative z-10"
            >
                <div className="flex items-center justify-between">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg",
                        variant.icon,
                        variant.shadow
                    )}>
                        {React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
                    </div>
                    
                    <div className={cn(
                        "flex items-center gap-1 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border backdrop-blur-md shadow-sm",
                        trend === 'up' 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" 
                        : "bg-destructive/10 border-destructive/20 text-destructive"
                    )}>
                        {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {change}
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-muted-foreground text-[11px] font-black uppercase tracking-[0.2em] opacity-60 leading-none">{label}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-4xl font-black text-foreground tracking-tighter">{value}</h3>
                        {trend === 'up' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                    </div>
                </div>
            </div>

            {/* Dynamic Hover Glow */}
            <div className={cn(
                "absolute -right-20 -bottom-20 w-64 h-64 blur-[100px] opacity-0 group-hover:opacity-40 transition-opacity duration-700 rounded-full",
                variant.bg.replace('bg-', 'bg-')
            )} />
        </motion.div>
    );
};
