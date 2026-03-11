'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingBag, Plus, MoreVertical, Store, ArrowUpRight, Loader2 } from 'lucide-react';
import { AX_DataService } from '@/services/data-service';

export default function StoresPage() {
    const [stores, setStores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStores = async () => {
            try {
                const data = await AX_DataService.getStores();
                setStores(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadStores();

        const subscription = AX_DataService.subscribeToStores(() => {
            loadStores();
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-6 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter">المتاجر</h1>
                    <p className="text-zinc-500 text-xs md:text-sm font-medium mt-1">إدارة ومتابعة أداء المتاجر المشتركة في كنزك.</p>
                </div>
                <button className="bg-amber-500 hover:bg-amber-400 text-black font-black px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all active:scale-95 text-xs md:text-sm shadow-lg shadow-amber-500/10">
                    <Plus size={18} />
                    متجر جديد
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map((store) => (
                    <div key={store.id} className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6 hover:border-amber-500/30 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[60px] -z-10" />

                        <div className="flex items-start justify-between mb-6">
                            <div className="w-14 h-14 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-inner overflow-hidden text-amber-500">
                                <Store size={24} />
                            </div>
                            <button className="p-2 text-zinc-600 hover:text-white transition-colors">
                                <MoreVertical size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-black text-white group-hover:text-amber-500 transition-colors">{store.name}</h3>
                                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">{store.subscription_plan} • {store.commission_rate}% عمولة</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-zinc-800/50">
                                <div>
                                    <p className="text-[10px] text-zinc-600 font-black uppercase">رقم الهاتف</p>
                                    <p className="text-sm font-black text-white">{store.phone}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-zinc-600 font-black uppercase">الحالة</p>
                                    <p className={`text-sm font-black ${store.is_active ? 'text-green-500' : 'text-red-500'}`}>
                                        {store.is_active ? 'نشط' : 'متوقف'}
                                    </p>
                                </div>
                            </div>

                            <button className="w-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white py-3 rounded-2xl flex items-center justify-center gap-2 transition-all text-xs font-black">
                                عرض التفاصيل
                                <ArrowUpRight size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {stores.length === 0 && (
                <div className="py-20 text-center opacity-20 border-2 border-dashed border-zinc-800 rounded-[2.5rem]">
                    <ShoppingBag size={48} className="mx-auto mb-4" />
                    <p className="font-black text-lg">بانتظار إضافة المزيد من المتاجر</p>
                </div>
            )}
        </div>
    );
}
