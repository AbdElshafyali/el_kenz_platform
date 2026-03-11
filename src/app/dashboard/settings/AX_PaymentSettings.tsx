'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Wallet, Smartphone, Landmark, CheckCircle2, Loader2, Plus, Trash2, ToggleLeft, ToggleRight, Info } from 'lucide-react';
import { AX_DataService } from '@/services/data-service';

interface AX_PaymentSettingsProps {
    store: any;
    onUpdate: () => void;
}

interface PaymentEntry {
    id: string;
    label: string; // اسم داخلي للأدمن
    value: string; // الرقم أو الحساب
    active: boolean;
}

export default function AX_PaymentSettings({ store, onUpdate }: AX_PaymentSettingsProps) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // الإعدادات العامة
    const [settings, setSettings] = useState({
        pay_cod_enabled: true,
        pay_prepayment_enabled: false,
        pay_prepayment_percent: 0,
        pay_whatsapp_confirm: true,
        pay_upload_confirm: true,
        pay_whatsapp_number: '',
    });

    // القوائم الديناميكية
    const [methods, setMethods] = useState<{
        wallets: PaymentEntry[];
        bank_accounts: PaymentEntry[];
        instapay: PaymentEntry[];
    }>({
        wallets: [],
        bank_accounts: [],
        instapay: []
    });

    useEffect(() => {
        if (store) {
            setSettings({
                pay_cod_enabled: store.pay_cod_enabled ?? true,
                pay_prepayment_enabled: store.pay_prepayment_enabled ?? false,
                pay_prepayment_percent: store.pay_prepayment_percent || 0,
                pay_whatsapp_confirm: store.pay_whatsapp_confirm ?? true,
                pay_upload_confirm: store.pay_upload_confirm ?? true,
                pay_whatsapp_number: store.pay_whatsapp_number || '',
            });

            if (store.payment_config) {
                setMethods(store.payment_config);
            }
        }
    }, [store]);

    const handleSave = async () => {
        if (!store?.id) return;
        setLoading(true);
        setStatus('idle');
        try {
            await AX_DataService.updateStore(store.id, {
                ...settings,
                payment_config: methods
            });
            setStatus('success');
            onUpdate();
            setTimeout(() => setStatus('idle'), 3000);
        } catch (err) {
            console.error(err);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const addEntry = (category: keyof typeof methods) => {
        const newEntry: PaymentEntry = {
            id: Date.now().toString(),
            label: '',
            value: '',
            active: true
        };
        setMethods(prev => ({
            ...prev,
            [category]: [...prev[category], newEntry]
        }));
    };

    const removeEntry = (category: keyof typeof methods, id: string) => {
        setMethods(prev => ({
            ...prev,
            [category]: prev[category].filter(e => e.id !== id)
        }));
    };

    const updateEntry = (category: keyof typeof methods, id: string, updates: Partial<PaymentEntry>) => {
        setMethods(prev => ({
            ...prev,
            [category]: prev[category].map(e => e.id === id ? { ...e, ...updates } : e)
        }));
    };

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const renderSection = (category: keyof typeof methods, title: string, icon: React.ReactNode, placeholder: string) => (
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2rem] p-6 space-y-4">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <div className="text-amber-500">{icon}</div>
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">{title}</h4>
                </div>
                <button
                    onClick={() => addEntry(category)}
                    className="p-2 bg-amber-500/10 text-amber-500 rounded-xl hover:bg-amber-500 hover:text-black transition-all"
                >
                    <Plus size={16} />
                </button>
            </div>

            <div className="space-y-3">
                {methods[category].length === 0 ? (
                    <p className="text-[10px] text-zinc-700 text-center py-4 font-bold italic">لا يوجد {title} مضافة حالياً</p>
                ) : (
                    methods[category].map((entry) => (
                        <div key={entry.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-black/40 p-4 rounded-2xl border border-zinc-800 group animate-in slide-in-from-right-2 duration-300">
                            <div className="sm:col-span-4">
                                <input
                                    type="text"
                                    value={entry.label}
                                    onChange={(e) => updateEntry(category, entry.id, { label: e.target.value })}
                                    placeholder="اسم داخلي (مثلاً: رقمي الأساسي)"
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs font-bold text-white outline-none focus:border-amber-500/50"
                                />
                            </div>
                            <div className="sm:col-span-5">
                                <input
                                    type="text"
                                    value={entry.value}
                                    onChange={(e) => updateEntry(category, entry.id, { value: e.target.value })}
                                    placeholder={placeholder}
                                    dir="ltr"
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs font-mono text-amber-500 outline-none focus:border-amber-500/50"
                                />
                            </div>
                            <div className="sm:col-span-3 flex items-center justify-end gap-3">
                                <button onClick={() => updateEntry(category, entry.id, { active: !entry.active })}>
                                    {entry.active ? <ToggleRight className="text-amber-500" size={28} /> : <ToggleLeft className="text-zinc-700" size={28} />}
                                </button>
                                <button
                                    onClick={() => removeEntry(category, entry.id)}
                                    className="p-2 text-zinc-700 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Global Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-5 rounded-3xl border transition-all ${settings.pay_cod_enabled ? 'bg-amber-500/5 border-amber-500/20' : 'bg-zinc-900/30 border-zinc-800'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${settings.pay_cod_enabled ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                                <CreditCard size={18} />
                            </div>
                            <h4 className="font-black text-white px-2">الدفع عند الاستلام</h4>
                        </div>
                        <button onClick={() => toggleSetting('pay_cod_enabled')}>
                            {settings.pay_cod_enabled ? <ToggleRight className="text-amber-500" size={32} /> : <ToggleLeft className="text-zinc-700" size={32} />}
                        </button>
                    </div>
                </div>

                <div className={`p-5 rounded-3xl border transition-all ${settings.pay_prepayment_enabled ? 'bg-blue-500/5 border-blue-500/20' : 'bg-zinc-900/30 border-zinc-800'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${settings.pay_prepayment_enabled ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                                <Wallet size={18} />
                            </div>
                            <h4 className="font-black text-white px-2">تفعيل الدفع المقدم</h4>
                        </div>
                        <button onClick={() => toggleSetting('pay_prepayment_enabled')}>
                            {settings.pay_prepayment_enabled ? <ToggleRight className="text-blue-500" size={32} /> : <ToggleLeft className="text-zinc-700" size={32} />}
                        </button>
                    </div>
                    {settings.pay_prepayment_enabled && (
                        <div className="mt-3 flex items-center gap-3 animate-in zoom-in-95">
                            <span className="text-[10px] font-black text-zinc-400">نسبة المقدم:</span>
                            <div className="flex items-center bg-black rounded-lg px-2 border border-zinc-800">
                                <input
                                    type="number"
                                    value={settings.pay_prepayment_percent}
                                    onChange={(e) => setSettings({ ...settings, pay_prepayment_percent: parseInt(e.target.value) || 0 })}
                                    className="w-12 bg-transparent py-1 text-center font-black text-blue-500 outline-none text-xs"
                                />
                                <span className="text-[10px] font-bold text-zinc-600">%</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Dynamic Sections */}
            {renderSection('wallets', 'المحافظ الإلكترونية', <Smartphone size={18} />, 'رقم المحفظة (010xxxxxxx)')}
            {renderSection('instapay', 'إنستا باي (InstaPay)', <CheckCircle2 size={18} />, 'رقم الموبايل أو IPA')}
            {renderSection('bank_accounts', 'الحسابات البنكية', <Landmark size={18} />, 'رقم الحساب أو IBAN')}

            {/* Confirmation Methods */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2rem] p-6">
                <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4 px-2">تأكيد الدفع الإلكتروني</h4>
                <div className="flex flex-wrap gap-8">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <button onClick={() => toggleSetting('pay_upload_confirm')}>
                            {settings.pay_upload_confirm ? <ToggleRight className="text-green-500" size={28} /> : <ToggleLeft className="text-zinc-700" size={28} />}
                        </button>
                        <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors">رفع صورة الإيصال</span>
                    </label>
                    <div className="flex flex-col gap-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <button onClick={() => toggleSetting('pay_whatsapp_confirm')}>
                                {settings.pay_whatsapp_confirm ? <ToggleRight className="text-[#25D366]" size={28} /> : <ToggleLeft className="text-zinc-700" size={28} />}
                            </button>
                            <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors">تأكيد عبر واتساب</span>
                        </label>

                        {settings.pay_whatsapp_confirm && (
                            <div className="animate-in slide-in-from-right-2 duration-300 flex flex-col gap-2 mr-10">
                                <span className="text-[10px] font-black text-zinc-500 uppercase px-1">رقم الواتساب للتأكيد:</span>
                                <input
                                    type="text"
                                    value={settings.pay_whatsapp_number}
                                    onChange={(e) => setSettings({ ...settings, pay_whatsapp_number: e.target.value })}
                                    placeholder="010xxxxxxx"
                                    dir="ltr"
                                    className="max-w-[200px] bg-black border border-zinc-800 rounded-xl px-4 py-2 text-xs font-bold text-[#25D366] outline-none focus:border-[#25D366]/50 shadow-lg shadow-[#25D366]/5"
                                />
                                <p className="text-[9px] text-zinc-600 font-medium px-1 italic">ده الرقم اللي العميل هيبعتله الإيصال.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-4">
                {status === 'success' && (
                    <span className="text-[10px] font-black text-green-500 animate-pulse">تم الحفظ بنجاح!</span>
                )}
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className={`px-10 py-4 rounded-2xl text-xs font-black transition-all active:scale-95 flex items-center gap-2 ${loading ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-white text-black hover:bg-zinc-200'
                        }`}
                >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    حفظ كل الإعدادات
                </button>
            </div>
        </div>
    );
}
