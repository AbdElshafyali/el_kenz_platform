'use client';

import React, { useState, useEffect } from 'react';
import { Star, Heart, ShoppingBag, Plus, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StoreProductCardProps {
    product: any;
    viewMode: string;
    pricingType: string;
    unifiedPrice?: number;
    categories: any[];
    onSelect: () => void;
    onAdd: (product: any) => void;
    onRequest: (product: any) => void;
    isLiked: boolean;
    likesCount: number;
    onLike: () => void;
}

const AX_StoreProductCard = ({ 
    product, 
    viewMode, 
    pricingType, 
    unifiedPrice, 
    categories, 
    onSelect, 
    onAdd, 
    onRequest, 
    isLiked, 
    likesCount, 
    onLike 
}: StoreProductCardProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [currentImgIndex, setCurrentImgIndex] = useState(0);

    const isOutOfStock = product.is_available === false;
    const isUnified = pricingType === 'unified';
    const hasDiscount = !isUnified && product.discount_price && product.discount_price < product.price;
    const displayPrice = isUnified ? unifiedPrice : (hasDiscount ? product.discount_price : product.price);
    const totalLikes = (product.base_likes || 0) + (likesCount || 0);

    const productColors: any[] = Array.isArray(product.colors) ? product.colors : [];
    const productSizes: any[] = Array.isArray(product.sizes) ? product.sizes : [];
    const hasColors = productColors.length > 0;
    const hasSizes = productSizes.length > 0;

    const images = Array.isArray(product.images) && product.images.length > 0 
        ? product.images.filter((img: string) => img && img.trim() !== '')
        : [product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'];

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
        <div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                "group bg-secondary/40 backdrop-blur-md border border-border rounded-[1.5rem] overflow-hidden hover:border-primary/40 transition-all duration-700 flex flex-col relative shadow-sm",
                isOutOfStock && 'grayscale opacity-70'
            )}
        >
            {/* Badges */}
            <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
                {isOutOfStock ? (
                    <span className="bg-destructive text-destructive-foreground px-3 py-1 rounded-xl text-[8px] font-black uppercase shadow-lg border border-destructive/20 backdrop-blur-md">
                        نفذ
                    </span>
                ) : product.is_best_seller && (
                    <div className="bg-primary text-primary-foreground px-3 py-1 rounded-xl text-[8px] font-black uppercase shadow-xl shadow-primary/30 flex items-center gap-1.5 animate-pulse">
                        <Star size={10} fill="currentColor" />
                        مميز
                    </div>
                )}
            </div>

            {/* Media Container */}
            <div className="relative aspect-square overflow-hidden bg-background cursor-pointer" onClick={onSelect}>
                <AnimatePresence mode="wait">
                    <motion.img
                        key={images[currentImgIndex]}
                        src={images[currentImgIndex]}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        alt={product.name_ar}
                    />
                </AnimatePresence>
                
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Pagination Dots for multi-image */}
                {images.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                        {images.map((_: any, i: number) => (
                            <div 
                                key={i} 
                                className={cn(
                                    "h-1 rounded-full transition-all duration-500",
                                    i === currentImgIndex ? "bg-primary w-3" : "bg-white/40 w-1"
                                )} 
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Details */}
            <div className="p-4 flex flex-col flex-1 min-w-0 text-right group/details bg-background/20">
                <div className="flex-1 space-y-1 cursor-pointer mb-3" onClick={onSelect}>
                    <p className="text-[9px] text-primary/80 font-black uppercase tracking-[0.1em] leading-none opacity-60">
                        {categories.find((c: any) => c.id === product.category_id)?.name_ar || 'عام'}
                    </p>
                    <h3 className="text-sm md:text-base font-black text-foreground leading-tight group-hover/details:text-primary transition-colors line-clamp-1 truncate">
                        {product.name_ar}
                    </h3>

                    {/* Color & Size Mini Badges */}
                    {(hasColors || hasSizes) && (
                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                            {hasColors && (
                                <div className="flex items-center gap-1">
                                    {productColors.filter((c: any) => c.available).slice(0, 5).map((color: any) => (
                                        <div
                                            key={color.hex}
                                            title={color.label}
                                            className="w-4 h-4 rounded-full border-2 border-background shadow-sm ring-1 ring-border/30"
                                            style={{ backgroundColor: color.hex }}
                                        />
                                    ))}
                                    {productColors.filter((c: any) => c.available).length > 5 && (
                                        <span className="text-[8px] font-black text-muted-foreground/50">+{productColors.filter((c: any) => c.available).length - 5}</span>
                                    )}
                                </div>
                            )}
                            {hasColors && hasSizes && <div className="w-px h-3 bg-border/50" />}
                            {hasSizes && (
                                <div className="flex items-center gap-1 flex-wrap">
                                    {productSizes.filter((s: any) => s.available).slice(0, 4).map((size: any) => (
                                        <span key={size.label} className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded-md bg-secondary border border-border text-muted-foreground">
                                            {size.label}
                                        </span>
                                    ))}
                                    {productSizes.filter((s: any) => s.available).length > 4 && (
                                        <span className="text-[8px] font-black text-muted-foreground/50">+{productSizes.filter((s: any) => s.available).length - 4}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between gap-3 mt-auto">
                    <div className="flex flex-col">
                        {hasDiscount && (
                            <span className="text-[9px] text-muted-foreground/50 line-through decoration-destructive/30 mb-0">{product.price} ج.م</span>
                        )}
                        <div className="flex items-baseline gap-0.5">
                            <span className={cn(
                                "text-lg md:text-xl font-black tracking-tighter",
                                hasDiscount ? 'text-emerald-500' : 'text-primary'
                            )}>
                                {displayPrice}
                            </span>
                            <span className="text-[9px] font-black opacity-40 uppercase">ج.م</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={(e) => { e.stopPropagation(); onLike(); }}
                            className={cn(
                                "w-9 h-9 flex items-center justify-center rounded-xl border transition-all active:scale-90 shadow-sm",
                                isLiked ? "bg-destructive/10 border-destructive/30 text-destructive" : "bg-background/50 border-border text-muted-foreground/30 hover:text-primary hover:border-primary/30"
                            )}
                        >
                            <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); isOutOfStock ? onRequest(product) : onAdd(product); }}
                            className="h-9 px-3 md:px-4 bg-primary text-primary-foreground rounded-xl transition-all active:scale-90 shadow-lg shadow-primary/20 hover:brightness-110 flex items-center justify-center gap-1.5"
                        >
                            {isOutOfStock ? <ShoppingBag size={14} /> : <Plus size={14} />}
                            <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">
                                {isOutOfStock ? 'طلب' : 'شراء'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AX_StoreProductCard;
