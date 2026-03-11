'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle, ShieldCheck, Package, Truck, ClipboardCheck, Lock, Mail, User, Phone } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const ROLE_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    confirm: { label: 'مؤكد طلبات', icon: <ClipboardCheck size={13} />, color: 'text-amber-400' },
    prepare: { label: 'مجهز طلبات', icon: <Package size={13} />, color: 'text-blue-400' },
    deliver: { label: 'مستلم / مندوب', icon: <Truck size={13} />, color: 'text-green-400' },
};

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = React.use(params);
    const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'used' | 'expired' | 'done'>('loading');
    const [staff, setStaff] = useState<any>(null);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const check = async () => {
            try {
                const res = await fetch(`/api/staff/invite/${token}`);
                const data = await res.json();
                if (!res.ok) {
                    setStatus(data.error === 'used' ? 'used' : data.error === 'expired' ? 'expired' : 'invalid');
                } else {
                    setStaff(data.staff);
                    setStatus('valid');
                }
            } catch {
                setStatus('invalid');
            }
        };
        check();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name.trim()) { setError('ادخل الاسم'); return; }
        if (!phone.trim()) { setError('ادخل رقم التليفون'); return; }
        if (!email.trim()) { setError('ادخل الإيميل'); return; }
        if (password.length < 8) { setError('الباسورد أقل حد 8 حروف'); return; }
        if (password !== confirm) { setError('الباسورد مش متطابق'); return; }

        setSubmitting(true);
        try {
            const res = await fetch('/api/staff/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, name, phone, email, password }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'حدث خطأ'); return; }

            const supabase = createClient();
            await supabase.auth.signInWithPassword({ email, password });
            setStatus('done');
        } catch {
            setError('حدث خطأ، حاول تاني');
        } finally {
            setSubmitting(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
        );
    }

    if (status === 'done') {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-black text-white">تم التسجيل بنجاح!</h1>
                    <p className="text-zinc-500 text-sm">حسابك جاهز. يمكنك الدخول على لوحة التحكم.</p>
                    <a
                        href="/dashboard"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-2xl transition-all active:scale-95"
                    >
                        الدخول للوحة التحكم
                    </a>
                </div>
            </div>
        );
    }

    if (status === 'used' || status === 'expired' || status === 'invalid') {
        const msgs: Record<string, string> = {
            used: 'تم استخدام هذا الرابط من قبل',
            expired: 'انتهت صلاحية هذا الرابط',
            invalid: 'الرابط غير صالح',
        };
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                        <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-black text-white">{msgs[status]}</h1>
                    <p className="text-zinc-500 text-sm">تواصل مع مدير المتجر للحصول على رابط جديد.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
                        <ShieldCheck className="w-8 h-8 text-amber-500" />
                    </div>
                    <h1 className="text-2xl font-black text-white">دعوة انضمام للفريق</h1>
                    {staff && (
                        <p className="text-zinc-400 text-sm">
                            أهلاً <span className="font-black text-white">{staff.name}</span> — أنشئ حسابك للدخول على لوحة التحكم
                        </p>
                    )}
                </div>

                {/* Roles Card */}
                {staff && (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 space-y-2">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">صلاحياتك</p>
                        <div className="flex gap-2 flex-wrap">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black ${staff.permission_level === 'admin' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
                                <ShieldCheck size={11} />
                                {staff.permission_level === 'admin' ? 'مدير' : 'موظف'}
                            </span>
                            {(staff.roles || []).map((r: string) => {
                                const rl = ROLE_LABELS[r];
                                if (!rl) return null;
                                return (
                                    <span key={r} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black bg-zinc-900 border-zinc-800 ${rl.color}`}>
                                        {rl.icon} {rl.label}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">الاسم الكامل</label>
                        <div className="relative">
                            <User size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="الاسم"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pr-10 pl-4 py-3 text-sm font-bold text-white outline-none focus:border-amber-500/40 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">رقم التليفون</label>
                        <div className="relative">
                            <Phone size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                            <input
                                type="text"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="01xxxxxxxxx"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pr-10 pl-4 py-3 text-sm font-bold text-white outline-none focus:border-amber-500/40 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">الإيميل</label>
                        <div className="relative">
                            <Mail size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="email@example.com"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pr-10 pl-4 py-3 text-sm font-bold text-white outline-none focus:border-amber-500/40 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">كلمة السر</label>
                        <div className="relative">
                            <Lock size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                            <input
                                type={showPass ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="8 حروف على الأقل"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pr-10 pl-10 py-3 text-sm font-bold text-white outline-none focus:border-amber-500/40 transition-colors"
                            />
                            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
                                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">تأكيد كلمة السر</label>
                        <div className="relative">
                            <Lock size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                            <input
                                type={showPass ? 'text' : 'password'}
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                placeholder="أعد كتابة كلمة السر"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pr-10 pl-4 py-3 text-sm font-bold text-white outline-none focus:border-amber-500/40 transition-colors"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                            <XCircle size={14} />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-2xl transition-all active:scale-95 disabled:opacity-50"
                    >
                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                        إنشاء الحساب
                    </button>
                </form>

                <p className="text-center text-[10px] text-zinc-700 font-bold">
                    هذا الرابط صالح لمرة واحدة فقط لمدة 7 أيام
                </p>
            </div>
        </div>
    );
}
