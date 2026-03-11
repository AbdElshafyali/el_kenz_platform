'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { Package, Plus, Filter, Loader2, Star, CheckCircle2, Tag, ShoppingBag } from 'lucide-react';
import { AX_DataService } from '@/services/data-service';
import ProductModal from './ProductModal';
import CategoriesManager from './CategoriesManager';
import AX_PricingPolicy from './AX_PricingPolicy';
import { AX_InventoryStat } from './AX_InventoryStats';
import { AX_ProductCard } from './AX_ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [stores, setStores] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const [activeTab, setActiveTab] = useState<'inventory' | 'categories'>('inventory');

    const loadInitialData = async () => {
        try {
            const [productsData, myStoreData, categoriesData] = await Promise.all([
                AX_DataService.getProducts(),
                AX_DataService.getMyStore(),
                AX_DataService.getCategories()
            ]);
            setProducts(productsData);
            setStores(myStoreData ? [myStoreData] : []);
            setCategories(categoriesData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInitialData();
        const productSub = AX_DataService.subscribeToProducts(() => AX_DataService.getProducts().then(setProducts));
        const categorySub = AX_DataService.subscribeToCategories(() => AX_DataService.getCategories().then(setCategories));
        const storeSub = AX_DataService.subscribeToStores(() => AX_DataService.getMyStore().then(data => setStores(data ? [data] : [])));
        return () => {
            if (productSub) productSub.unsubscribe();
            if (categorySub) categorySub.unsubscribe();
            if (storeSub) storeSub.unsubscribe();
        };
    }, []);

    const openModal = (product: any = null) => {
        setSelectedProduct(product ? JSON.parse(JSON.stringify(product)) : null);
        setIsModalOpen(true);
    };

    const currentStore = stores[0];

    const getDisplayPrice = (product: any) => {
        if (currentStore?.pricing_mode === 'unified' && currentStore?.unified_price) {
            return { final: currentStore.unified_price, original: product.price, isUnified: true };
        }
        return { final: product.discount_price || product.price, original: product.discount_price ? product.price : null, isUnified: false };
    };

    if (loading) return (
        <div className="flex-1 flex flex-col items-center justify-center p-24 gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 italic">جاري جرد المخازن...</p>
        </div>
    );

    return (
        <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-700 pb-20" dir="rtl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-4 border-b-2 border-border/30">
                <div className="flex items-center gap-10">
                    <TabButton active={activeTab === 'inventory'} label="المخزون" onClick={() => setActiveTab('inventory')} />
                    <TabButton active={activeTab === 'categories'} label="الاقسام" onClick={() => setActiveTab('categories')} />
                </div>
                <div className="flex items-center gap-4">
                    {activeTab === 'inventory' && (
                        <button onClick={() => openModal()} className="h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black px-10 rounded-[1.5rem] flex items-center gap-4 transition-all active:scale-95 text-sm shadow-2xl shadow-primary/20 hover:shadow-primary/40 group">
                            <Plus size={22} className="group-hover:rotate-90 transition-transform duration-500" />
                            إضافة منتج
                        </button>
                    )}
                    <button className="w-16 h-16 bg-secondary/50 border-2 border-border rounded-[1.5rem] text-muted-foreground hover:text-primary hover:border-primary/30 transition-all flex items-center justify-center shadow-inner group active:scale-90">
                        <Filter size={24} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </div>

            {activeTab === 'inventory' ? (
                <>
                    <AX_PricingPolicy store={currentStore} onUpdate={loadInitialData} />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <AX_InventoryStat label="إجمالي المخزون" value={products.length} color="amber" icon={<Package size={18} />} />
                        <AX_InventoryStat label="المنتجات النشطة" value={products.filter(p => p.is_available).length} color="green" icon={<CheckCircle2 size={18} />} />
                        <AX_InventoryStat label="الأكثر مبيعاً" value={products.filter(p => p.is_best_seller).length} color="blue" icon={<Star size={18} />} />
                        <AX_InventoryStat label="أقسام مفعلة" value={categories.length} color="zinc" icon={<Tag size={18} />} />
                    </div>

                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            <AnimatePresence mode="popLayout">
                                {products.map((product, idx) => (
                                    <AX_ProductCard
                                        key={product.id}
                                        product={product}
                                        catName={categories.find(c => c.id === product.category_id)?.name_ar || 'بدون قسم'}
                                        pricing={getDisplayPrice(product)}
                                        onEdit={openModal}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : <EmptyState onAdd={() => openModal()} />}

                    <ProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={loadInitialData} product={selectedProduct} stores={stores} categories={categories} />
                </>
            ) : <CategoriesManager categories={categories} />}
        </div>
    );
}

function TabButton({ active, label, onClick }: any) {
    return (
        <button onClick={onClick} className={cn("flex items-center gap-4 text-3xl md:text-5xl font-black tracking-tighter transition-all duration-500 uppercase group", active ? 'text-foreground' : 'text-muted-foreground/30 hover:text-muted-foreground')}>
            {label}
            <div className={cn("w-2.5 h-2.5 rounded-full bg-primary transition-all duration-500", active ? 'scale-100 opacity-100' : 'scale-0 opacity-0')} />
        </button>
    );
}

function EmptyState({ onAdd }: any) {
    return (
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="py-40 flex flex-col items-center justify-center border-4 border-dashed border-border/50 rounded-[4rem] bg-secondary/10 group hover:border-primary/30 hover:bg-primary/5 transition-all duration-700">
            <div className="w-32 h-32 bg-background border-2 border-border rounded-[2.5rem] flex items-center justify-center shadow-xl mb-10 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                <ShoppingBag size={56} className="text-muted-foreground/20 group-hover:text-primary/30" />
            </div>
            <h3 className="font-black text-3xl text-foreground tracking-tighter uppercase opacity-30 mb-4">لا توجد منتجات مسجلة</h3>
            <button onClick={onAdd} className="h-14 px-10 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-[1.2rem] font-black text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95">إبدأ بإضافة منتجك الأول</button>
        </motion.div>
    );
}
