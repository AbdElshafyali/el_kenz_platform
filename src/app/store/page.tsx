'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search, Loader2, Tag, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/features/cart/useCartStore';
import { AX_DataService } from '@/services/data-service';
import { axToast } from '@/hooks/use-toast';
import AX_FloatingDock from './components/AX_FloatingDock';
import StoreCheckoutModal from './components/StoreCheckoutModal';
import AX_RequestModal from './components/AX_RequestModal';
import AX_StoreHeader from './components/AX_StoreHeader';
import AX_StoreProductCard from './components/AX_StoreProductCard';
import AX_StoreQuickView from './components/AX_StoreQuickView';
import { cn } from '@/lib/utils';
import { AX_InstallPrompt } from './components/AX_InstallPrompt';

export default function StoreFrontPage() {
    const [store, setStore] = useState<any>({ name: 'متجر الكنز', pricing_mode: 'variable' });
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [likes, setLikes] = useState<Record<string, number>>({});
    const [userLikes, setUserLikes] = useState<string[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPath, setCurrentPath] = useState<any[]>([]);
    const [requestProduct, setRequestProduct] = useState<any>(null);

    const { addItem, totalCount } = useCartStore();

    useEffect(() => {
        const loadData = async () => {
            try {
                const [storesData, productsData, categoriesData, session] = await Promise.all([
                    AX_DataService.getStores(),
                    AX_DataService.getProducts(),
                    AX_DataService.getCategories(),
                    AX_DataService.getCurrentSession()
                ]);
                setStore(storesData[0] || { name: 'متجر الكنز', pricing_mode: 'variable' });
                setProducts(productsData);
                setCategories(categoriesData);
                if (session?.user) {
                    setCurrentUser(session.user);
                    const [myLikes, globalLikes] = await Promise.all([AX_DataService.getUserLikes(session.user.id), AX_DataService.getProductLikesCount()]);
                    setUserLikes(myLikes); setLikes(globalLikes);
                } else {
                    const globalLikes = await AX_DataService.getProductLikesCount();
                    setLikes(globalLikes);
                }
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        loadData();
        const subs = [
            AX_DataService.subscribeToProducts(() => AX_DataService.getProducts().then(setProducts)),
            AX_DataService.subscribeToCategories(() => AX_DataService.getCategories().then(setCategories)),
            AX_DataService.subscribeToStores(() => AX_DataService.getStores().then(res => res[0] && setStore(res[0]))),
            AX_DataService.subscribeToLikes(() => AX_DataService.getProductLikesCount().then(setLikes))
        ];
        return () => subs.forEach(s => s.unsubscribe());
    }, []);

    const toggleLike = async (productId: string) => {
        if (!currentUser) { axToast.info('سجل دخولك عشان تعمل لايك'); return; }
        const isLiked = userLikes.includes(productId);
        try {
            if (isLiked) {
                await AX_DataService.unlikeProduct(currentUser.id, productId);
                setUserLikes(prev => prev.filter(id => id !== productId));
                setLikes(prev => ({ ...prev, [productId]: Math.max(0, (prev[productId] || 0) - 1) }));
            } else {
                await AX_DataService.likeProduct(currentUser.id, productId);
                setUserLikes(prev => [...prev, productId]);
                setLikes(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
            }
        } catch (err) { console.error(err); }
    };

    const categoryHasProducts = (catId: string): boolean => products.some(p => p.category_id === catId) || categories.filter(c => c.parent_id === catId).some(sub => categoryHasProducts(sub.id));
    const currentCategoryId = currentPath[currentPath.length - 1]?.id || null;
    const filteredProducts = products.filter(p => p.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) && (!currentCategoryId || p.category_id === currentCategoryId));

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 transition-colors duration-500 pb-32" dir="rtl">
            <AX_StoreHeader totalCount={totalCount()} onCartOpen={() => setIsCheckoutOpen(true)} />

            <main className="pt-24 px-4 md:px-8 max-w-[1600px] mx-auto flex flex-col">
                <div className="mb-8 text-center space-y-4">
                    <div className="flex items-center justify-between">
                        {currentPath.length > 0 && (
                            <button onClick={() => setCurrentPath(prev => prev.slice(0, -1))} className="p-3 bg-secondary border border-border rounded-xl text-primary hover:bg-primary hover:text-white transition-all active:scale-95 shadow-sm">
                                <ChevronLeft size={20} className="rotate-180" />
                            </button>
                        )}
                        <h2 className="text-2xl md:text-3xl font-black tracking-tighter flex-1 text-center uppercase">
                            {currentPath.length === 0 ? <>استكشف <span className="text-primary italic">الـكـنـز</span></> : currentPath[currentPath.length - 1].name_ar}
                        </h2>
                        {currentPath.length > 0 && <div className="w-10 h-10" />}
                    </div>

                    <div className="relative max-w-2xl mx-auto group">
                        <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                        <input type="text" placeholder="ابحث عن منتجك المفضل..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-secondary/50 border-2 border-border/50 rounded-[1.5rem] py-3.5 pr-14 pl-6 outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all text-sm font-black shadow-inner placeholder:opacity-30" />
                    </div>
                </div>

                {currentPath.length === 0 && !searchQuery ? (
                    <div className="space-y-16">
                        {categories.filter(c => !c.parent_id && categoryHasProducts(c.id)).map((parentCat) => (
                            <div key={parentCat.id} className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 text-primary"><Tag size={24} /></div>
                                    <h3 className="text-2xl md:text-3xl font-black text-foreground tracking-tighter uppercase">{parentCat.name_ar}</h3>
                                </div>
                                <div className="space-y-8 pr-4 md:pr-10 border-r-2 border-primary/10">
                                    {/* Products directly in Parent Category */}
                                    {(() => {
                                        const directProd = products.filter(p => p.category_id === parentCat.id).slice(0, 10);
                                        if (directProd.length === 0) return null;
                                        return (
                                            <div className="space-y-5">
                                                <div className="flex gap-6 overflow-x-auto pb-6 ax-scrollbar no-scrollbar scroll-smooth">
                                                    {directProd.map(p => (
                                                        <div key={p.id} className="w-[200px] md:w-[240px] shrink-0">
                                                            <AX_StoreProductCard product={p} viewMode="grid" pricingType={store.pricing_mode} unifiedPrice={store.unified_price} categories={categories} isLiked={userLikes.includes(p.id)} likesCount={likes[p.id] || 0} onLike={() => toggleLike(p.id)} onSelect={() => setSelectedProduct(p)} onAdd={(prod: any, color?: any, size?: any) => addItem(prod, store.pricing_mode === 'unified' ? store.unified_price : (prod.discount_price || prod.price), color, size)} onRequest={(prod: any) => setRequestProduct(prod)} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Products in Sub Categories */}
                                    {categories.filter(sc => sc.parent_id === parentCat.id && categoryHasProducts(sc.id)).map((subCat) => {
                                        const subProd = products.filter(p => p.category_id === subCat.id).slice(0, 10);
                                        if (subProd.length === 0) return null;
                                        return (
                                            <div key={subCat.id} className="space-y-5 mt-8">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-lg font-black text-foreground/80 flex items-center gap-3"><div className="w-1.5 h-6 bg-primary/30 rounded-full" /> {subCat.name_ar}</h4>
                                                    <button onClick={() => setCurrentPath(prev => [...prev, subCat])} className="text-[9px] font-black text-primary hover:text-white hover:bg-primary transition-all uppercase tracking-widest bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10">الكل</button>
                                                </div>
                                                <div className="flex gap-6 overflow-x-auto pb-6 ax-scrollbar no-scrollbar scroll-smooth">
                                                    {subProd.map(p => (
                                                        <div key={p.id} className="w-[200px] md:w-[240px] shrink-0">
                                                            <AX_StoreProductCard product={p} viewMode="grid" pricingType={store.pricing_mode} unifiedPrice={store.unified_price} categories={categories} isLiked={userLikes.includes(p.id)} likesCount={likes[p.id] || 0} onLike={() => toggleLike(p.id)} onSelect={() => setSelectedProduct(p)} onAdd={(prod: any, color?: any, size?: any) => addItem(prod, store.pricing_mode === 'unified' ? store.unified_price : (prod.discount_price || prod.price), color, size)} onRequest={(prod: any) => setRequestProduct(prod)} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                        {filteredProducts.map(p => (
                            <AX_StoreProductCard 
                                key={p.id} 
                                product={p} 
                                viewMode="grid" 
                                pricingType={store.pricing_mode} 
                                unifiedPrice={store.unified_price} 
                                categories={categories} 
                                isLiked={userLikes.includes(p.id)} 
                                likesCount={likes[p.id] || 0} 
                                onLike={() => toggleLike(p.id)} 
                                onSelect={() => setSelectedProduct(p)} 
                                onAdd={(prod: any, color?: any, size?: any) => addItem(prod, store.pricing_mode === 'unified' ? store.unified_price : (prod.discount_price || prod.price), color, size)} 
                                onRequest={(prod: any) => setRequestProduct(prod)} 
                            />
                        ))}
                    </div>
                )}
            </main>

            <AX_FloatingDock cartCount={totalCount()} onCartOpen={() => setIsCheckoutOpen(true)} store={store} />
            <AX_StoreQuickView product={selectedProduct} onClose={() => setSelectedProduct(null)} pricingType={store.pricing_mode} unifiedPrice={store.unified_price} categories={categories} onAdd={(p: any, color?: any, size?: any) => addItem(p, store.pricing_mode === 'unified' ? store.unified_price : (p.discount_price || p.price), color, size)} onRequest={(p: any) => setRequestProduct(p)} isLiked={userLikes.includes(selectedProduct?.id)} onLike={() => toggleLike(selectedProduct?.id)} likesCount={likes[selectedProduct?.id] || 0} />
            <StoreCheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} items={useCartStore.getState().items} totalAmount={useCartStore.getState().totalAmount()} store={store} onSuccess={() => { setIsCheckoutOpen(false); useCartStore.getState().clearCart(); }} />
            <AX_RequestModal product={requestProduct} isOpen={!!requestProduct} onClose={() => setRequestProduct(null)} store={store} />
            <AX_InstallPrompt />
        </div>
    );
}
