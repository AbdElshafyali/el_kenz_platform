'use client';

import React, { useState } from 'react';
import { Tag, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AX_DataService } from '@/services/data-service';

interface AX_PricingPolicyProps {
    store: any;
    onUpdate: () => void;
}

export default function AX_PricingPolicy({ store, onUpdate }: AX_PricingPolicyProps) {
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState(store?.pricing_mode || 'variable');
    const [unifiedPrice, setUnifiedPrice] = useState(store?.unified_price || '');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSave = async () => {
        if (!store?.id) {
            console.error('No store ID found');
            setStatus('error');
            return;
        }

        setLoading(true);
        setStatus('idle');
        try {
            await AX_DataService.updateStore(store.id, {
                pricing_mode: mode,
                unified_price: mode === 'unified' ? (parseFloat(unifiedPrice) || 0) : null
            });
            setStatus('success');
            onUpdate();
        } catch (err) {
            console.error('Update failed:', err);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-secondary/20 border border-border rounded-[2rem] p-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-500 transition-colors duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Tag className="text-primary" size={20} />
                        <h3 className="text-lg font-black text-foreground">سياسة التسعير</h3>
                    </div>
                    <p className="text-muted-foreground text-xs font-bold opacity-60">تحكم في كيفية عرض أسعار المنتجات لعملائك.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex p-1 bg-secondary border border-border rounded-2xl shadow-inner">
                        <button
                            onClick={() => setMode('variable')}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${mode === 'variable' ? 'bg-background text-foreground shadow-lg border border-border/50' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            سعر متغير
                        </button>
                        <button
                            onClick={() => setMode('unified')}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${mode === 'unified' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            سعر موحد
                        </button>
                    </div>

                    {mode === 'unified' && (
                        <div className="relative group animate-in zoom-in-95 duration-200">
                            <input
                                type="number"
                                value={unifiedPrice}
                                onChange={(e) => setUnifiedPrice(e.target.value)}
                                placeholder="السعر الموحد"
                                className="w-32 bg-background border border-border rounded-2xl px-4 py-2 text-sm font-bold text-foreground outline-none focus:border-primary/50 transition-all text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-inner"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-black pointer-events-none group-focus-within:text-primary transition-colors">ج.م</span>
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={loading || (mode === 'unified' && !unifiedPrice)}
                        className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 flex items-center gap-2 shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${status === 'success' ? 'bg-emerald-500 text-white' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
                    >
                        {loading ? 'جاري الحفظ...' : status === 'success' ? (
                            <>
                                <CheckCircle2 size={16} />
                                تم الحفظ
                            </>
                        ) : 'تطبيق السياسة'}
                    </button>
                </div>
            </div>

            {mode === 'unified' && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-primary/5 border border-primary/10 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Sparkles size={14} className="text-primary animate-pulse" />
                    <p className="text-[10px] text-primary/80 font-black italic">
                        تنبيه: سيتم عرض السعر الموحد ({unifiedPrice || '0'} ج.م) لجميع المنتجات حالياً.
                    </p>
                </div>
            )}

            {status === 'error' && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-destructive/5 border border-destructive/10 rounded-xl">
                    <AlertCircle size={14} className="text-destructive" />
                    <p className="text-[10px] text-destructive/80 font-black italic">عذراً، حدث خطأ أثناء الحفظ. حاول مرة أخرى.</p>
                </div>
            )}
        </div>
    );
}

