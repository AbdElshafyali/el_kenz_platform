'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

interface AX_PerformanceBarProps {
    data: { name: string; value: number }[];
    title: string;
}

export const AX_PerformanceBar = ({ data, title }: AX_PerformanceBarProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const colors = ['hsl(var(--primary))', '#0ea5e9', '#10b981', '#6366f1', '#f43f5e'];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-background border-2 border-border/50 rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 hover:border-primary/20 transition-all duration-500 overflow-hidden relative"
        >
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[100px] -mr-24 -mt-24 rounded-full" />
            
            <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.3)]" />
                    <h3 className="text-xl font-black text-foreground tracking-tighter uppercase leading-none">
                        {title}
                    </h3>
                </div>
                <div className="px-3 py-1 bg-secondary/50 border border-border rounded-xl text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                    أداء الفروع
                </div>
            </div>

            <div className="h-[280px] w-full relative z-10">
                {mounted && (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                            data={data} 
                            layout="vertical" 
                            margin={{ left: 0, right: 40, top: 0, bottom: 0 }}
                        >
                            <CartesianGrid 
                                strokeDasharray="6 6" 
                                stroke="hsl(var(--border))" 
                                horizontal={true} 
                                vertical={false} 
                                opacity={0.5} 
                            />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={10}
                                fontWeight="900"
                                axisLine={false}
                                tickLine={false}
                                width={100}
                                tick={{ textAnchor: 'start', dx: -10 }}
                            />
                            <Tooltip
                                cursor={{ fill: 'hsl(var(--secondary))', opacity: 0.2 }}
                                content={({ active, payload }: any) => {
                                    if (active && payload && payload.length) {
                                        const item = payload[0].payload;
                                        return (
                                            <div className="bg-background/80 backdrop-blur-2xl border-2 border-primary/20 p-4 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1">{item.name}</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-xl font-black text-foreground">{item.value.toLocaleString()}</span>
                                                    <span className="text-[10px] text-primary font-black uppercase">ج.م</span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar
                                dataKey="value"
                                radius={[0, 10, 10, 0]}
                                barSize={20}
                                animationDuration={2000}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </motion.div>
    );
};
