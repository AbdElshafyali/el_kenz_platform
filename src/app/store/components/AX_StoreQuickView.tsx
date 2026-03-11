'use client';

import React, { useState, useEffect } from 'react';
import { X, Star, Info, ShoppingBag, Plus, Heart, Package, Palette, Ruler, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/features/cart/useCartStore';

interface StoreQuickViewProps {
    product: any;
    onClose: () => void;
    pricingType: string;
    unifiedPrice?: number;
    categories: any[];
    onAdd: (product: any, selectedColor?: any, selectedSize?: any) => void;
    onRequest: (product: any) => void;
    isLiked: boolean;
    onLike: () => void;
    likesCount: number;
}

const AX_StoreQuickView = ({ 
    product, 
    onClose, 
    pricingType, 
    unifiedPrice, 
    categories, 
    onAdd, 
    onRequest, 
    isLiked, 
    onLike, 
    likesCount 
}: StoreQuickViewProps) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedColor, setSelectedColor] = useState<any>(null);
    const [selectedSize, setSelectedSize] = useState<any>(null);
    const [isJustAdded, setIsJustAdded] = useState(false);
    const cartItems = useCartStore(state => state.items);

    useEffect(() => {
        if (product) {
            setCurrentImageIndex(0);
            setSelectedColor(null);
            setSelectedSize(null);
            setIsJustAdded(false);
        }
    }, [product]);

    if (!product) return null;

    const isUnified = pricingType === 'unified';
    const hasDiscount = !isUnified && product.discount_price && product.discount_price < product.price;
    const displayPrice = isUnified ? unifiedPrice : (hasDiscount ? product.discount_price : product.price);
    const productImages = Array.isArray(product.images) ? product.images.filter((img: string) => img && img.trim() !== '') : [];
    const allImages = productImages.length > 0 ? productImages : (product.image_url ? [product.image_url] : []);

    const productColors: any[] = Array.isArray(product.colors) ? product.colors : [];
    const productSizes: any[] = Array.isArray(product.sizes) ? product.sizes : [];
    const hasColors = productColors.length > 0;
    const hasSizes = productSizes.length > 0;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8" dir="rtl">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />
            <div className="bg-background border border-border rounded-[3rem] w-full max-w-5xl max-h-[90vh] overflow-hidden relative animate-in fade-in zoom-in-95 duration-500 shadow-3xl flex flex-col md:flex-row">
                
                <button 
                    onClick={onClose} 
                    className="absolute top-6 left-6 w-12 h-12 flex items-center justify-center bg-background/80 backdrop-blur-xl rounded-2xl text-foreground hover:bg-primary hover:text-primary-foreground transition-all z-20 border border-border shadow-lg active:scale-95"
                >
                    <X size={24} />
                </button>

                {/* Media Slider */}
                <div className="w-full md:w-1/2 aspect-square md:aspect-auto h-80 md:h-full relative bg-secondary/30 flex items-center justify-center border-b md:border-b-0 md:border-l border-border group overflow-hidden p-8 md:p-14">
                    <AnimatePresence mode="wait">
                        {allImages.length > 0 ? (
                            <motion.img 
                                key={allImages[currentImageIndex]}
                                src={allImages[currentImageIndex]} 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                transition={{ duration: 0.5 }}
                                className="w-full h-full object-contain drop-shadow-2xl" 
                                alt="" 
                            />
                        ) : (
                            <Package size={80} className="text-muted-foreground/10" />
                        )}
                    </AnimatePresence>
                    
                    {allImages.length > 1 && (
                        <div className="absolute bottom-10 inset-x-0 flex justify-center gap-3 z-30">
                            {allImages.map((_: any, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={cn(
                                        "h-2 rounded-full border-2 border-primary/20 transition-all", 
                                        idx === currentImageIndex ? "bg-primary w-10 border-primary shadow-lg shadow-primary/20" : "bg-white/40 w-2 hover:bg-primary/50"
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar flex flex-col justify-between">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                {product.is_best_seller && (
                                    <span className="bg-primary text-primary-foreground px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20">الأكثر مبيعاً</span>
                                )}
                                <span className="bg-secondary/50 text-primary px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20">{categories.find((c: any) => c.id === product.category_id)?.name_ar || 'عام'}</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter leading-tight uppercase hover:text-primary transition-colors duration-500">{product.name_ar}</h2>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="flex flex-col">
                                {hasDiscount && (
                                    <span className="text-sm font-black text-muted-foreground/30 line-through mb-1 italic">{product.price} ج.م</span>
                                )}
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl md:text-6xl font-black text-primary tracking-tighter drop-shadow-sm">{displayPrice}</span>
                                    <small className="text-xl font-black opacity-30 uppercase tracking-widest text-foreground">ج.م</small>
                                </div>
                            </div>
                            {hasDiscount && (
                                <div className="bg-emerald-500 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase shadow-2xl shadow-emerald-500/30 animate-in slide-in-from-right-10 duration-700">وفر {Math.round((1 - product.discount_price / product.price) * 100)}% الآن</div>
                            )}
                        </div>

                        {/* Colors Section */}
                        {hasColors && (
                            <div className="space-y-3 pt-6 border-t-2 border-border/50">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-muted-foreground">
                                    <Palette size={16} className="text-primary" />
                                    اختر اللون
                                    {selectedColor && (
                                        <span className="text-primary font-black normal-case tracking-normal">— {selectedColor.label}</span>
                                    )}
                                </h4>
                                <div className="flex flex-wrap gap-3">
                                    {productColors.map((color: any) => (
                                        <button
                                            key={color.hex}
                                            onClick={() => color.available && setSelectedColor(selectedColor?.hex === color.hex ? null : color)}
                                            title={color.label}
                                            disabled={!color.available}
                                            className={cn(
                                                "relative w-12 h-12 rounded-full border-4 transition-all duration-300 shadow-md",
                                                !color.available && "opacity-30 cursor-not-allowed",
                                                color.available && selectedColor?.hex === color.hex
                                                    ? "border-primary scale-115 ring-4 ring-primary/20 shadow-xl"
                                                    : color.available
                                                    ? "border-border hover:scale-110 hover:border-primary/50 cursor-pointer"
                                                    : ""
                                            )}
                                            style={{ backgroundColor: color.hex }}
                                        >
                                            {!color.available && (
                                                <div className="absolute inset-0 rounded-full flex items-center justify-center">
                                                    <div className="w-full h-0.5 bg-white/60 rotate-45 absolute" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sizes Section */}
                        {hasSizes && (
                            <div className="space-y-3">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-muted-foreground">
                                    <Ruler size={16} className="text-sky-500" />
                                    اختر المقاس
                                    {selectedSize && (
                                        <span className="text-sky-500 font-black normal-case tracking-normal">— {selectedSize.label}</span>
                                    )}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {productSizes.map((size: any) => (
                                        <button
                                            key={size.label}
                                            onClick={() => size.available && setSelectedSize(selectedSize?.label === size.label ? null : size)}
                                            disabled={!size.available}
                                            className={cn(
                                                "min-w-[48px] h-12 px-4 rounded-2xl border-2 text-sm font-black transition-all duration-200",
                                                !size.available && "opacity-30 line-through cursor-not-allowed border-dashed",
                                                size.available && selectedSize?.label === size.label
                                                    ? "border-sky-500 bg-sky-500/10 text-sky-600 scale-105 shadow-md shadow-sky-500/20"
                                                    : size.available
                                                    ? "border-border text-muted-foreground hover:border-sky-500/50 hover:text-sky-500 hover:scale-105 cursor-pointer"
                                                    : "border-border text-muted-foreground/30"
                                            )}
                                        >
                                            {size.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div className="space-y-3 pt-4 border-t-2 border-border/50">
                            <h4 className="text-primary text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3 leading-none">
                                <Info size={16} />
                                بطاقة مواصفات المنتج
                            </h4>
                            <p className="text-foreground/70 leading-relaxed text-base font-medium italic opacity-80">{product.description || 'لا يوجد وصف متاح لهذا المنتج حالياً.'}</p>
                        </div>
                    </div>

                    <div className="pt-8 flex items-center gap-5">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                if (product.is_available === false) {
                                    onRequest(product);
                                } else {
                                    onAdd(product, selectedColor, selectedSize);
                                    setIsJustAdded(true);
                                    setTimeout(() => {
                                        setIsJustAdded(false);
                                        onClose();
                                    }, 800);
                                }
                            }}
                            className={cn(
                                "flex-1 h-20 font-black rounded-[2.5rem] flex items-center justify-center gap-5 transition-all shadow-xl group active:shadow-inner relative overflow-hidden",
                                isJustAdded 
                                    ? "bg-emerald-500 text-white shadow-emerald-500/30" 
                                    : "bg-primary hover:bg-primary/95 text-primary-foreground shadow-primary/30"
                            )}
                        >
                            {isJustAdded && (
                                <motion.div 
                                    initial={{ scale: 0, opacity: 0 }} 
                                    animate={{ scale: 1, opacity: 1 }} 
                                    className="absolute inset-0 bg-emerald-500 flex items-center justify-center gap-3 z-10"
                                >
                                    <CheckCircle2 size={32} />
                                    <span className="text-xl">تمت الإضافة بنجاح!</span>
                                </motion.div>
                            )}

                            {product.is_available === false ? (
                                <><ShoppingBag size={28} /> طلب مخصص فوراً</>
                            ) : (
                                <>
                                    <Plus size={28} className="group-hover:rotate-90 transition-transform duration-500" />
                                    {(() => {
                                        const qty = cartItems.find(i => i.product_id === product?.id)?.quantity || 0;
                                        if (qty > 0) return `أضف المزيد (لديك ${qty} بالقائمة)`;
                                        return 'أضف إلى قائمة مشترياتي';
                                    })()}
                                </>
                            )}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onLike}
                            className={cn(
                                "w-20 h-20 rounded-[2.5rem] border-2 flex items-center justify-center transition-all shadow-xl",
                                isLiked ? "bg-rose-500 border-rose-500 text-white shadow-rose-500/30" : "bg-secondary/40 border-border text-muted-foreground/30 hover:border-primary/40 hover:text-primary"
                            )}
                        >
                            <Heart size={32} fill={isLiked ? "currentColor" : "none"} />
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AX_StoreQuickView;
