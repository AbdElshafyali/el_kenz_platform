'use client';

import React from 'react';
import { Shield, Key, Eye, EyeOff } from 'lucide-react';

export function AX_SecuritySection() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6 md:p-8 space-y-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white">الأمان والخصوصية</h3>
                        <p className="text-zinc-500 text-sm">إدارة كلمة المرور وحماية حسابك.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-4">
                        <h4 className="text-sm font-black text-zinc-400 uppercase tracking-widest px-1">تغيير كلمة المرور</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <PasswordField label="كلمة المرور الحالية" />
                            <PasswordField label="كلمة المرور الجديدة" />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-zinc-800/50">
                        <h4 className="text-sm font-black text-zinc-400 uppercase tracking-widest px-1">المصادقة الثنائية (2FA)</h4>
                        <div className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-2xl">
                            <div className="space-y-1">
                                <h4 className="text-sm font-black text-white">تفعيل 2FA</h4>
                                <p className="text-xs text-zinc-500">إضافة طبقة أمان إضافية لعمليات تسجيل الدخول.</p>
                            </div>
                            <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-black rounded-xl transition-all">تفعيل الآن</button>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-4">
                    <button
                        onClick={() => alert('تم تحديث إعدادات الأمان')}
                        className="px-8 py-3 bg-amber-500 text-black font-black rounded-2xl text-sm hover:bg-amber-400 transition-all shadow-xl active:scale-95"
                    >تحديث البيانات</button>
                </div>
            </div>
        </div>
    );
}

function PasswordField({ label }: { label: string }) {
    const [show, setShow] = React.useState(false);
    return (
        <div className="space-y-2">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest px-1">{label}</label>
            <div className="relative">
                <input
                    type={show ? 'text' : 'password'}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-3.5 outline-none focus:border-red-500/40 focus:ring-4 focus:ring-red-500/5 transition-all text-sm font-medium text-white"
                />
                <button
                    onClick={() => setShow(!show)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        </div>
    );
}
