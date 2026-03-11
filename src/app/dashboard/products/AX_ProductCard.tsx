'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AX_ProductCardProps {
    product: any;
    catName: string;
    pricing: any;
    onEdit: (product: any) => void;
}

export const AX_ProductCard = ({ product, catName, pricing, onEdit }: AX_ProductCardProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const images = product.images?.length > 0 ? product.images : [product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'];

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isHovered && images.length > 1) {
            interval = setInterval(() => {
                setCurrentImgIndex((prev) => (prev + 1) % images.length);
            }, 1200);
        } else {
            setCurrentImgIndex(0);
        }
        return () => clearInterval(interval);
    }, [isHovered, images.length]);

    return (
        <motion.div
            layout
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={cn(
                "group bg-background border-2 border-border/50 rounded-[2.5rem] overflow-hidden hover:border-primary/40 hover:shadow-2xl transition-all flex flex-col h-full relative",
                product.is_best_seller && 'ring-2 ring-primary/20 shadow-xl shadow-primary/5'
            )}
        >
            {product.is_best_seller && (
                <div className="absolute top-6 left-6 z-20">
                    <div className="bg-primary text-white px-4 py-2 rounded-2xl flex items-center gap-2 shadow-2xl animate-bounce-slow">
                        <Star size={14} fill="currentColor" />
                        <span className="text-[10px] font-black uppercase tracking-widest">مـميز</span>
                    </div>
                </div>
            )}
            
            <div className="relative aspect-[4/5] bg-secondary/30 overflow-hidden border-b border-border/50">
                <div className="absolute top-6 right-6 z-10">
                    <span className="bg-background/90 backdrop-blur-2xl text-foreground text-[10px] font-black px-4 py-2 rounded-2xl border-2 border-border/50 shadow-xl uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-10 group-hover:translate-x-0">
                        {catName}
                    </span>
                </div>
                
                <AnimatePresence mode="wait">
                    <motion.img
                        key={images[currentImgIndex]}
                        src={images[currentImgIndex]}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                        alt={product.name_ar}
                    />
                </AnimatePresence>

                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-white text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">الباركود</p>
                    <p className="text-white font-mono text-xs opacity-60">SR-{product.id.split('-')[0].toUpperCase()}</p>
                </div>

                {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                        {images.map((_: any, i: number) => (
                            <div 
                                key={i} 
                                className={cn(
                                    "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                    i === currentImgIndex ? "bg-primary w-4" : "bg-white/40"
                                )} 
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="p-8 space-y-6 flex-1 flex flex-col justify-between relative bg-background">
                <div>
                    <div className="flex items-center justify-between gap-4 mb-3">
                        <h3 className="text-lg font-black text-foreground truncate uppercase tracking-tight group-hover:text-primary transition-colors">{product.name_ar}</h3>
                        <span className={cn(
                            "w-3 h-3 rounded-full shadow-[0_0_10px_rgba(var(--primary),0.3)]",
                            product.is_available ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'
                        )} />
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed font-black opacity-50 uppercase tracking-tighter italic">{product.description}</p>
                </div>

                <div className="space-y-6">
                    <div className="flex items-end justify-between p-4 bg-secondary/40 border border-border/50 rounded-3xl shadow-inner group-hover:border-primary/20 transition-all">
                        <div className="flex flex-col">
                            <div className="flex items-baseline gap-1.5">
                                <span className={cn(
                                    "font-black text-2xl tracking-tighter leading-none",
                                    pricing.isUnified ? 'text-primary' : pricing.original ? 'text-emerald-500' : 'text-foreground'
                                )}>
                                    {pricing.final.toLocaleString()}
                                </span>
                                <small className="text-[10px] font-black opacity-40 uppercase">ج.م</small>
                            </div>
                            {pricing.original && (
                                <span className="text-[11px] text-muted-foreground/30 line-through font-black mt-1">
                                    {pricing.original.toLocaleString()} ج.م
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                             <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest",
                                product.is_available ? 'text-emerald-500' : 'text-rose-500'
                            )}>
                                {product.is_available ? (product.stock > 0 ? `متوفر: ${product.stock}` : 'متاح') : 'نافذ'}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => onEdit(product)}
                            className="flex-1 h-14 bg-secondary border border-border/50 hover:bg-primary hover:text-white hover:border-primary text-foreground rounded-2xl text-[11px] font-black transition-all active:scale-95 shadow-sm uppercase tracking-widest"
                        >
                            تـعديل
                        </button>
                        <button
                            onClick={() => onEdit(product)}
                            className="w-14 h-14 bg-secondary hover:bg-primary/5 text-muted-foreground hover:text-primary rounded-2xl transition-all shadow-inner border border-border/50 active:scale-90 flex items-center justify-center shrink-0"
                        >
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
