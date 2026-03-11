'use client';

import React, { useState, useEffect } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

interface AX_SalesChartProps {
    data: any[];
    title: string;
}

export const AX_SalesChart = ({ data, title }: AX_SalesChartProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full bg-background border-2 border-border/50 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-primary/5 hover:border-primary/20 transition-all duration-500 overflow-hidden relative"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full -mr-32 -mt-32" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-10 bg-primary rounded-full shadow-[0_0_20px_rgba(var(--primary),0.3)]" />
                    <div>
                        <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase leading-none">
                            {title}
                        </h3>
                        <p className="text-muted-foreground text-[10px] sm:text-[11px] mt-2 font-black uppercase tracking-widest opacity-60">
                            تحليل المبيعات والنمو خلال الأسبوع الأخير
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary animate-in slide-in-from-right duration-700">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest">إحصائيات المبيعات</span>
                    </div>
                </div>
            </div>

            <div className="h-[350px] w-full relative z-10">
                {mounted && (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid 
                                strokeDasharray="6 6" 
                                stroke="hsl(var(--border))" 
                                vertical={false} 
                                opacity={0.5}
                            />
                            <XAxis
                                dataKey="name"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={10}
                                fontWeight="900"
                                tickLine={false}
                                axisLine={false}
                                dy={15}
                                tick={{ textAnchor: 'middle', letterSpacing: '0.05em' }}
                            />
                            <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={10}
                                fontWeight="900"
                                tickLine={false}
                                axisLine={false}
                                dx={-5}
                                tickFormatter={(val) => `${val.toLocaleString()} ج.م`}
                                width={80}
                            />
                            <Tooltip
                                cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '4 4' }}
                                content={({ active, payload }: any) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-background/80 backdrop-blur-2xl border-2 border-primary/20 p-5 rounded-[1.5rem] shadow-2xl animate-in zoom-in-95 duration-200">
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                                                        {payload[0]?.payload?.name || ''}
                                                    </p>
                                                    <div className="flex items-baseline gap-2 mt-1">
                                                        <span className="text-2xl font-black text-foreground tracking-tighter">
                                                            {payload[0]?.value?.toLocaleString() || 0}
                                                        </span>
                                                        <span className="text-[10px] font-black text-primary uppercase">ج.م</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="sales"
                                stroke="hsl(var(--primary))"
                                strokeWidth={5}
                                strokeLinecap="round"
                                fillOpacity={1}
                                fill="url(#colorSales)"
                                animationDuration={2500}
                                animationEasing="ease-in-out"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </motion.div>
    );
};
