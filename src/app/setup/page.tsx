'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Mail, Lock, User, Phone, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { AX_AuthService } from '@/services/auth-service';

function SetupContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'verifying' | 'valid' | 'invalid' | 'success'>('verifying');
    const [inviteData, setInviteData] = useState<any>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            setStatus('invalid');
            return;
        }

        const verifyToken = async () => {
            try {
                const data = await AX_AuthService.checkToken(token);
                setInviteData(data);
                setFullName(data.full_name || '');
                setStatus('valid');
            } catch (err) {
                setStatus('invalid');
            }
        };

        verifyToken();
    }, [token]);

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        if (password !== confirmPassword) {
            setError('كلمات المرور غير متطابقة');
            return;
        }

        if (password.length < 6) {
            setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await AX_AuthService.signUpWithToken({
                token,
                email,
                password,
                fullName,
                phone
            });
            setStatus('success');
            setTimeout(() => router.push('/login'), 3000);
        } catch (err: any) {
            setError(err.message || 'فشل إكمال إعداد الحساب');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'verifying') {
        return (
            <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
                <p className="text-zinc-400 font-medium">جاري التحقق من نظام الكنز...</p>
            </div>
        );
    }

    if (status === 'invalid') {
        return (
            <div className="max-w-md w-full p-8 bg-zinc-900/50 backdrop-blur-xl border border-red-500/20 rounded-2xl text-center space-y-6">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">رابط غير صالح</h2>
                    <p className="text-zinc-500">عذراً، هذا الرابط منتهي الصلاحية أو تم استخدامه مسبقاً.</p>
                </div>
                <button onClick={() => router.push('/login')} className="text-amber-500 hover:underline">العودة للرئيسية</button>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="max-w-md w-full p-8 bg-zinc-900/50 backdrop-blur-xl border border-green-500/20 rounded-2xl text-center space-y-6">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto animate-bounce" />
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">تم تفعيل حسابك!</h2>
                    <p className="text-zinc-500 leading-relaxed">أهلاً بك في منصة الكنز ستور. جاري تحويلك لصفحة الدخول خلال لحظات...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-lg w-full p-8 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl -z-10" />

            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 rounded-xl mb-4 text-amber-500">
                    <User className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight">إكمال الانضمام للكنز</h1>
                <p className="text-zinc-500 mt-2">يرجى تأكيد بياناتك وإعداد كلمة المرور الخاصة بك</p>
            </div>

            <form onSubmit={handleSetup} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 text-right">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider pr-1">الاسم الكامل</label>
                        <div className="relative">
                            <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pr-10 pl-4 text-white text-right focus:border-amber-500 outline-none transition-all"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2 text-right">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider pr-1">رقم الهاتف</label>
                        <div className="relative">
                            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pr-10 pl-4 text-white text-right focus:border-amber-500 outline-none transition-all"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2 text-right">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider pr-1">البريد الإلكتروني (الحقيقي)</label>
                    <div className="relative">
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pr-10 pl-4 text-white text-right focus:border-amber-500 outline-none transition-all placeholder:text-zinc-700"
                            placeholder="your@email.com"
                            required
                        />
                    </div>
                    <p className="text-[10px] text-zinc-600 pr-1">هذا الإيميل سيستخدم لاستعادة كلمة المرور وإشعارات المنصة</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 text-right">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider pr-1">تأكيد كلمة المرور</label>
                        <div className="relative">
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pr-10 pl-4 text-white text-right focus:border-amber-500 outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2 text-right">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider pr-1">تعيين كلمة المرور</label>
                        <div className="relative">
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pr-10 pl-11 text-white text-right focus:border-amber-500 outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-amber-500"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs text-center font-medium">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3.5 rounded-xl shadow-lg shadow-amber-500/10 mt-4 leading-none transition-all active:scale-95 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'تفعيل الحساب والانضمام'}
                </button>
            </form>
        </div>
    );
}

export default function SetupPage() {
    return (
        <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
            <Suspense fallback={<Loader2 className="w-12 h-12 text-amber-500 animate-spin" />}>
                <SetupContent />
            </Suspense>
        </main>
    );
}
