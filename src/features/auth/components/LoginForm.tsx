'use client';

import React, { useState } from 'react';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { AX_AuthService } from '@/services/auth-service';
import { useAuthStore } from '../useAuthStore';
import { useRouter } from 'next/navigation';

export const LoginForm = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const setAuth = useAuthStore((state) => state.setAuth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const user = await AX_AuthService.signIn(email, password);
            if (user) {
                // Redirect to dashboard after login
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-8 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white tracking-tight italic">مرحباً بعودتك</h2>
                <p className="text-zinc-500 mt-2">أدخل بياناتك للوصول إلى منصة <span className="text-amber-500 font-semibold">الكنز ستور</span></p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    {/* Email Field */}
                    <div className="space-y-2 text-right">
                        <label className="text-sm font-medium text-zinc-400 block tracking-wide">البريد الإلكتروني</label>
                        <div className="relative group">
                            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-amber-500 transition-colors" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 pr-11 pl-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-right"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2 text-right">
                        <div className="flex justify-between items-center mb-1">
                            <a href="#" className="text-[11px] text-amber-500/70 hover:text-amber-500 transition-colors decoration-amber-500/30 underline underline-offset-4">نسيت كلمة السر؟</a>
                            <label className="text-sm font-medium text-zinc-400 block tracking-wide">كلمة المرور</label>
                        </div>
                        <div className="relative group">
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-amber-500 transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 pr-11 pl-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-right"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-amber-500/10"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            دخول للمنصة
                            <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform rotate-180" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-zinc-800/50 text-center">
                <p className="text-[10px] text-zinc-600 uppercase tracking-[0.3em] font-medium">
                    الكنز ستور • AXONID CORE
                </p>
            </div>
        </div>
    );
};
