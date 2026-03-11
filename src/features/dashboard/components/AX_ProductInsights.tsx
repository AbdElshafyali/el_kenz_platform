'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, AlertTriangle, XCircle, TrendingUp, ShoppingCart, Search, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AX_ProductInfo {
    id: string;
    name: string;
    image?: string;
    stock: number;
    sales: number;
    price: number;
    status: 'active' | 'hidden' | 'out_of_stock';
}

interface AX_ProductInsightsProps {
    bestSellers: AX_ProductInfo[];
    lowStock: AX_ProductInfo[];
    outOfStock: AX_ProductInfo[];
    hidden: AX_ProductInfo[];
}

export const AX_ProductInsights = ({ bestSellers, lowStock, outOfStock, hidden }: AX_ProductInsightsProps) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filterProducts = (products: AX_ProductInfo[]) => {
        if (!searchQuery) return products;
        return products.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const filteredBestSellers = filterProducts(bestSellers);
    const filteredOutOfStock = filterProducts(outOfStock);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Header with Search */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 pb-2">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-background border-2 border-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-xl shadow-primary/5 rotate-3 hover:rotate-0 transition-all duration-500">
                        <Package size={28} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase leading-none">
                            رؤى المنتجات
                        </h3>
                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-2 opacity-60 leading-none">تحليل أداء المخزون والمبيعات المباشرة</p>
                    </div>
                </div>

                <div className="relative group w-full xl:w-[450px]">
                    <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                        <Search className="text-muted-foreground group-focus-within:text-primary transition-all duration-300" size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="ابحث عن منتج محدد لتحليل أداءه..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-14 bg-secondary/30 border-2 border-border/50 rounded-2xl pr-14 pl-6 outline-none focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/5 transition-all text-sm font-black text-foreground shadow-sm placeholder:text-muted-foreground/30"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Best Sellers Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-background border-2 border-border/50 rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 group"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                                <TrendingUp size={20} />
                            </div>
                            <h3 className="text-lg font-black text-foreground tracking-tighter uppercase">الأكثر مبيعاً</h3>
                        </div>
                        <span className="text-[10px] font-black px-4 py-1.5 rounded-full bg-emerald-500/5 text-emerald-600 border border-emerald-500/10 uppercase tracking-widest leading-none">
                            الأكثر طلباً
                        </span>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {filteredBestSellers.length > 0 ? filteredBestSellers.map((product, idx) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={product.id}
                                >
                                    <ProductRow product={product} metric="sales" color="emerald" />
                                </motion.div>
                            )) : (
                                <NotFoundState label="لا توجد بيانات مبيعات" />
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Out of Stock Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-background border-2 border-border/50 rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 group"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-500 border border-rose-500/20 group-hover:scale-110 transition-transform">
                                <XCircle size={20} />
                            </div>
                            <h3 className="text-lg font-black text-foreground tracking-tighter uppercase">غير متوفر</h3>
                        </div>
                        <div className="flex items-center gap-2">
                             <span className="text-[10px] font-black px-4 py-1.5 rounded-full bg-rose-500/5 text-rose-600 border border-rose-500/10 uppercase tracking-widest leading-none">
                                {outOfStock.length} مفقود
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {filteredOutOfStock.length > 0 ? filteredOutOfStock.map((product, idx) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={product.id}
                                >
                                    <ProductRow product={product} metric="stock" color="rose" />
                                </motion.div>
                            )) : (
                                <NotFoundState label="المخزون مكتمل حالياً" />
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const ProductRow = ({ product, metric, color }: { product: AX_ProductInfo, metric: 'sales' | 'stock', color: 'emerald' | 'amber' | 'rose' }) => {
    const colors = {
        emerald: {
            bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600',
            icon: <TrendingUp size={12} />
        },
        amber: {
            bg: 'bg-primary/10 border-primary/20 text-primary',
            icon: <ShoppingCart size={12} />
        },
        rose: {
            bg: 'bg-rose-500/10 border-rose-500/20 text-rose-600',
            icon: <Package size={12} />
        },
    };

    const variant = colors[color];

    return (
        <div className="flex items-center gap-5 p-4 rounded-3xl bg-secondary/20 border border-border/50 hover:border-primary/30 transition-all duration-500 group/row cursor-default">
            <div className="relative w-14 h-14 rounded-2xl bg-background border-2 border-border overflow-hidden shrink-0 group-hover/row:border-primary/40 transition-all shadow-sm p-1">
                {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary/40 rounded-xl text-muted-foreground/30"><Package size={24} /></div>
                )}
            </div>
            
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black text-foreground truncate group-hover/row:text-primary transition-colors leading-none uppercase tracking-tight">{product.name}</h4>
                <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] font-black text-muted-foreground bg-background border border-border rounded px-2 py-0.5 shadow-sm">{product.price.toLocaleString()} ج.م</span>
                </div>
            </div>

            <div className={cn("px-4 py-2 rounded-2xl border-b-2 text-[10px] font-black flex items-center gap-2.5 shadow-inner transition-transform group-hover/row:scale-105", variant.bg)}>
                {variant.icon}
                <span className="uppercase tracking-widest">{metric === 'sales' ? `${product.sales} تم بيعه` : `${product.stock} متبقي`}</span>
            </div>
        </div>
    );
};

const NotFoundState = ({ label }: { label: string }) => (
    <div className="py-12 flex flex-col items-center justify-center text-center opacity-20">
        <Package size={32} className="mb-3" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">{label}</p>
    </div>
);
