'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface AX_CategoryPieProps {
    data: { name: string; value: number; color: string }[];
}

export const AX_CategoryPie = ({ data }: AX_CategoryPieProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full h-full bg-background border-2 border-border/50 rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 hover:border-primary/20 transition-all duration-500 flex flex-col"
        >
            <div className="space-y-1 mb-8">
                <h3 className="text-xl font-black text-foreground flex items-center gap-3">
                    <div className="w-2 h-6 bg-sky-500 rounded-full" />
                    تحليل الاقسام
                </h3>
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest opacity-60 mr-5">مشاركة الفئات في الكتالوج</p>
            </div>

            <div className="flex-1 flex flex-col justify-center">
                <div className="h-[280px] w-full relative">
                    {mounted && (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    innerRadius={80}
                                    outerRadius={105}
                                    paddingAngle={6}
                                    dataKey="value"
                                    stroke="none"
                                    animationDuration={1500}
                                >
                                    {data.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={entry.color} 
                                            className="hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={({ active, payload }: any) => {
                                        if (active && payload && payload.length) {
                                            const item = payload[0].payload;
                                            return (
                                                <div className="bg-background/80 backdrop-blur-2xl border-2 border-primary/20 p-4 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{item.name}</p>
                                                    <div className="flex items-baseline gap-2 mt-1">
                                                        <span className="text-xl font-black text-foreground">{item.value}%</span>
                                                        <span className="text-[10px] text-primary font-black">اكتساح</span>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}

                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] opacity-40">إجمالي الأنواع</span>
                        <span className="text-4xl font-black text-foreground tracking-tighter">{data.length}</span>
                        <div className="w-8 h-1 bg-primary/20 rounded-full mt-1" />
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3 pb-2">
                    {data.slice(0, 8).map((item, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30 border border-border group hover:border-primary/20 transition-all duration-300"
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-2.5 h-2.5 rounded-full shrink-0 group-hover:scale-125 transition-transform" style={{ backgroundColor: item.color }} />
                                <span className="text-[11px] font-black text-foreground truncate uppercase tracking-tight">{item.name}</span>
                            </div>
                            <span className="text-[10px] font-black text-primary ml-1">{item.value}%</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};
