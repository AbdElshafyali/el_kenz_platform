'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowDownLeft, ArrowUpRight, AlertCircle, Clock, PackageSearch, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AX_Activity {
    id: string;
    type: 'order' | 'request' | 'like' | 'payout' | 'deposit' | 'alert';
    title: string;
    desc: string;
    time: string;
    amount?: number;
}

interface AX_ActivityListProps {
    activities: AX_Activity[];
}

export const AX_ActivityList = ({ activities }: AX_ActivityListProps) => {
    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full bg-background border-2 border-border/50 rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 hover:border-primary/20 transition-all duration-500"
        >
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-8 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                    <h3 className="text-xl font-black text-foreground tracking-tighter uppercase leading-none">
                        التدفق المباشر
                    </h3>
                </div>
                <button className="px-4 py-2 bg-secondary/50 border border-border rounded-xl text-[10px] font-black text-muted-foreground hover:text-primary hover:border-primary/30 transition-all uppercase tracking-widest active:scale-90">
                    استكشاف
                </button>
            </div>

            <div className="space-y-4 relative">
                {/* Vertical Line */}
                <div className="absolute top-0 bottom-0 right-[27px] w-px bg-gradient-to-b from-border/50 via-border to-transparent hidden sm:block" />

                <AnimatePresence mode="popLayout" initial={false}>
                    {activities.length > 0 ? activities.map((activity, idx) => (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                            transition={{ duration: 0.4, delay: idx * 0.05 }}
                            className="group relative flex items-center gap-5 p-5 rounded-[1.5rem] bg-secondary/20 border border-border/50 hover:border-primary/40 hover:bg-background hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-default"
                        >
                            <ActivityIcon type={activity.type} />

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <h4 className="text-sm font-black text-foreground truncate group-hover:text-primary transition-all uppercase tracking-tight">
                                        {activity.title}
                                    </h4>
                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground bg-background border border-border rounded-lg px-2 py-0.5 shadow-sm group-hover:border-primary/20 transition-all">
                                        <Clock size={10} className="text-primary/50" />
                                        {activity.time}
                                    </div>
                                </div>
                                <p className="text-[11px] text-muted-foreground font-black opacity-60 truncate mt-1 tracking-tight leading-none">
                                    {activity.desc}
                                </p>
                            </div>

                            {activity.amount !== undefined && (
                                <div className={cn(
                                    "text-[10px] font-black px-3 py-1.5 rounded-xl border-b-2 shadow-sm font-mono tracking-tighter",
                                    activity.amount > 0 ? "text-emerald-500 bg-emerald-500/5 border-emerald-500/10" : "text-rose-500 bg-rose-500/5 border-rose-500/10"
                                )}>
                                    {activity.amount > 0 ? '+' : ''}{activity.amount.toLocaleString()} ج.م
                                </div>
                            )}
                        </motion.div>
                    )) : (
                        <div className="py-24 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center text-muted-foreground/20 mb-4 border border-border border-dashed">
                                <AlertCircle size={32} />
                            </div>
                            <p className="text-xs font-black text-muted-foreground/30 uppercase tracking-[0.3em]">هدوء تام.. لا توجد إشعارات</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

const ActivityIcon = ({ type }: { type: AX_Activity['type'] }) => {
    const configs = {
        order: { icon: ShoppingBag, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-amber-500/10' },
        request: { icon: PackageSearch, color: 'text-sky-500 bg-sky-500/10 border-sky-500/20 shadow-sky-500/10' },
        like: { icon: Heart, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-rose-500/10' },
        payout: { icon: ArrowUpRight, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20 shadow-orange-500/10' },
        deposit: { icon: ArrowDownLeft, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10' },
        alert: { icon: AlertCircle, color: 'text-muted-foreground bg-secondary border-border shadow-primary/5' },
    };

    const Config = configs[type];
    const Icon = Config.icon;

    return (
        <div className={cn("p-3 rounded-2xl border-2 shrink-0 transition-transform group-hover:rotate-12 duration-500 shadow-lg", Config.color)}>
            <Icon size={18} />
        </div>
    );
};
