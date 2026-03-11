'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Crown, Banknote, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AX_CustomerInfo {
    name: string;
    phone: string;
    totalSpent: number;
    orderCount: number;
    lastLocation?: string;
}

interface AX_TopCustomersProps {
    customers: AX_CustomerInfo[];
}

export const AX_TopCustomers = ({ customers }: AX_TopCustomersProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-background border-2 border-border/50 rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 hover:border-primary/20 transition-all duration-500 overflow-hidden relative"
        >
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-[100px] -mr-24 -mt-24 rounded-full" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                    <h3 className="text-xl font-black text-foreground tracking-tighter uppercase leading-none">
                        أفضل العملاء (VIP)
                    </h3>
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                {customers.length > 0 ? customers.map((customer, idx) => (
                    <div 
                        key={customer.phone}
                        className="flex items-center gap-5 p-4 rounded-3xl bg-secondary/20 border border-border/50 group/cust transition-all duration-300 hover:bg-background hover:shadow-xl hover:shadow-primary/5"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-background border-2 border-border flex items-center justify-center text-primary group-hover/cust:border-primary/40 transition-all shadow-sm shrink-0">
                            {idx === 0 ? <Crown size={20} className="text-amber-500" /> : <Users size={20} />}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-black text-foreground group-hover/cust:text-primary transition-colors truncate uppercase tracking-tight">
                                {customer.name}
                            </h4>
                            <div className="flex items-center gap-3 mt-1.5 overflow-hidden">
                                <span className="flex items-center gap-1 text-[9px] font-black text-muted-foreground opacity-60">
                                    <MapPin size={10} /> {customer.lastLocation || 'غير محدد'}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-border" />
                                <span className="text-[9px] font-black text-primary uppercase tracking-widest">{customer.orderCount} طلبات</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                            <div className="text-[12px] font-black text-foreground whitespace-nowrap">
                                {customer.totalSpent.toLocaleString()} <span className="text-primary text-[9px] uppercase">ج.م</span>
                            </div>
                            <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest opacity-40">إجمالي المشتريات</span>
                        </div>
                    </div>
                )) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center opacity-20">
                        <Users size={32} className="mb-3" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">لا توجد بيانات عملاء VIP</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
