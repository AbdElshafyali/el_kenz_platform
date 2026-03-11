'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight, User, Phone, MapPin, Package, MessageCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AX_ProductRequestItem {
    id: string;
    product_id?: string;
    product_name: string;
    customer_name: string;
    customer_phone: string;
    customer_address?: string;
    quantity: number;
    created_at: string;
    image_url?: string;
}

interface AX_ProductRequestsProps {
    requests: AX_ProductRequestItem[];
}

export const AX_ProductRequests = ({ requests }: AX_ProductRequestsProps) => {
    const [showAll, setShowAll] = React.useState(false);

    // Group requests by product
    const grouped = requests.reduce((acc, req) => {
        const key = req.product_id || req.product_name;
        if (!acc[key]) {
            acc[key] = {
                product_id: req.product_id,
                product_name: req.product_name,
                image_url: req.image_url,
                total_quantity: 0,
                customers: []
            };
        }
        acc[key].total_quantity += req.quantity;
        acc[key].customers.push({
            name: req.customer_name,
            phone: req.customer_phone,
            address: req.customer_address,
            date: new Date(req.created_at).toLocaleDateString('ar-EG'),
            time: new Date(req.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            q: req.quantity
        });
        return acc;
    }, {} as Record<string, any>);

    const groupedArray = Object.values(grouped).sort((a, b) => b.total_quantity - a.total_quantity);
    const displayCount = showAll ? groupedArray.length : 4;
    const displayedItems = groupedArray.slice(0, displayCount);

    const handleWhatsApp = (phone: string, name: string, product: string) => {
        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.startsWith('01')) cleanPhone = '2' + cleanPhone;

        const currentHour = new Date().getHours();
        const greeting = currentHour < 12 ? 'صباح الخير' : 'مساء الخير';
        const storeLink = typeof window !== 'undefined' ? `${window.location.origin}/store` : '';

        const message = `${greeting} أستاذ ${name}،\nبخصوص طلب التوفر الخاص بمنتج (${product})، حابين نبلغك إنه توفر دلوقتي وتقدر تطلبه من خلال متجرنا على الرابط:\n${storeLink}`;

        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="bg-background border-2 border-border/50 rounded-[2.5rem] p-8 md:p-12 space-y-10 relative overflow-hidden group shadow-xl shadow-primary/5 transition-all duration-500">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-80 h-80 bg-primary/5 blur-[120px] -ml-40 -mt-40 rounded-full" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between relative z-10 gap-8">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                        <ShoppingBag size={28} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase leading-none">
                            طلبات الانتظار
                        </h3>
                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-2 opacity-60 leading-none">
                            تحليل احتياجات العملاء للمنتجات غير المتوفرة
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-secondary/50 border border-border px-6 py-3 rounded-[1.5rem] shadow-inner group-hover:border-primary/30 transition-all">
                    <div className="flex flex-col items-center">
                        <span className="text-primary font-black text-2xl leading-none">{requests.length}</span>
                        <p className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground mt-1">طلب معلق</p>
                    </div>
                    <div className="w-px h-8 bg-border/50 mx-2" />
                    <div className="flex flex-col items-center">
                        <span className="text-foreground font-black text-2xl leading-none">{groupedArray.length}</span>
                        <p className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground mt-1">منتجات مختلفة</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 relative z-10">
                <AnimatePresence mode="popLayout">
                    {displayedItems.length > 0 ? displayedItems.map((prod, idx) => (
                        <motion.div
                            key={prod.product_id || prod.product_name + idx}
                            layout
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="bg-secondary/20 border border-border/50 rounded-[2rem] p-6 hover:border-primary/40 hover:bg-background hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col group/card"
                        >
                            <div className="flex gap-5 items-center">
                                <div className="relative w-20 h-20 rounded-2xl bg-background border-2 border-border overflow-hidden shrink-0 flex items-center justify-center p-1 group-hover/card:border-primary/30 transition-all">
                                    {prod.image_url ? (
                                        <img src={prod.image_url} alt="" className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-secondary/40 rounded-xl text-muted-foreground/30"><Package size={32} /></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-lg font-black text-foreground truncate group-hover/card:text-primary transition-colors uppercase tracking-tight leading-none">
                                        {prod.product_name}
                                    </h4>
                                    <div className="flex items-center gap-3 mt-3">
                                        <span className="text-[10px] font-black text-white bg-primary px-3 py-1 rounded-lg shadow-lg shadow-primary/20 uppercase">إجمالي: {prod.total_quantity}</span>
                                        <span className="text-[10px] font-black text-muted-foreground bg-background border border-border px-3 py-1 rounded-lg uppercase tracking-tight">{prod.customers.length} عملاء مهتمين</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3 flex-1">
                                {prod.customers.slice(0, 3).map((c: any, cidx: number) => (
                                    <motion.div 
                                        key={cidx} 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + (cidx * 0.1) }}
                                        className="flex items-center justify-between p-4 bg-background border border-border/50 rounded-2xl hover:border-primary/20 hover:shadow-md transition-all group/row"
                                    >
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground shrink-0 border border-border/50 group-hover/row:bg-primary/10 group-hover/row:text-primary transition-colors">
                                                <User size={16} />
                                            </div>
                                            <div className="truncate">
                                                <p className="text-xs font-black text-foreground truncate uppercase">{c.name}</p>
                                                <div className="flex items-center gap-2.5 mt-1">
                                                    <span className="text-[10px] font-black text-muted-foreground" dir="ltr">{c.phone}</span>
                                                    <div className="w-1 h-1 bg-border rounded-full" />
                                                    <div className="flex items-center gap-1 text-[9px] font-black text-primary/60">
                                                        <Clock size={10} />
                                                        {c.date}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <div className="text-[10px] font-black text-foreground bg-secondary px-3 py-1.5 rounded-lg border border-border/50 uppercase tracking-tighter">
                                                ×{c.q}
                                            </div>
                                            <button
                                                onClick={() => handleWhatsApp(c.phone, c.name, prod.product_name)}
                                                className="w-10 h-10 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/10 active:scale-90"
                                            >
                                                <MessageCircle size={18} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                                {prod.customers.length > 3 && (
                                    <p className="text-[9px] font-black text-muted-foreground text-center py-1 opacity-50 uppercase tracking-widest">+ {prod.customers.length - 3} عملاء آخرين ينتظرون</p>
                                )}
                            </div>
                        </motion.div>
                    )) : (
                        <div className="col-span-full py-24 flex flex-col items-center justify-center text-center opacity-20">
                            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6">
                                <ShoppingBag size={48} />
                            </div>
                            <p className="text-xs font-black text-foreground uppercase tracking-[0.4em]">لا يوجد عملاء في قائمة الانتظار</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {groupedArray.length > 4 && (
                <div className="flex justify-center pt-6 relative z-10">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="flex items-center gap-3 px-8 py-3 bg-secondary/80 hover:bg-primary hover:text-white border border-border hover:border-primary rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95"
                    >
                        {showAll ? 'طي القائمة' : `كشف جميع الطلبات (${groupedArray.length})`}
                        <ArrowRight size={14} className={cn("transition-transform", showAll ? "-rotate-90" : "rotate-0")} />
                    </button>
                </div>
            )}
        </div>
    );
};
