'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Database, Image as ImageIcon, HardDrive, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { AX_DataService } from '@/services/data-service';

export default function SystemMetricsPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<{ db_size: number, storage_size: number } | null>(null);

    // Hardcoded Limits (Free Tiers)
    const DB_LIMIT_MB = 500;
    const STORAGE_LIMIT_MB = 1000; // 1GB
    const IMAGEKIT_LIMIT_MB = 20 * 1024; // 20GB

    useEffect(() => {
        // Strict Protection Check
        if (user && user.email !== 'abdalshafybakr@gmail.com') {
            router.push('/dashboard');
            return;
        }

        const fetchMetrics = async () => {
            try {
                const data = await AX_DataService.getSystemMetrics();
                setMetrics({
                    db_size: parseInt(data.db_size || '0', 10),
                    storage_size: parseInt(data.storage_size || '0', 10),
                });
            } catch (error) {
                console.error("Failed to load metrics:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.email === 'abdalshafybakr@gmail.com') {
            fetchMetrics();
        }
    }, [user, router]);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
            </div>
        );
    }

    if (!user || user.email !== 'abdalshafybakr@gmail.com') {
        return null;
    }

    const formatBytesToMB = (bytes: number) => {
        return (bytes / (1024 * 1024)).toFixed(2);
    };

    const getPercentage = (usedMB: number, limitMB: number) => {
        const percent = (usedMB / limitMB) * 100;
        return Math.min(percent, 100);
    };

    const getProgressColor = (percent: number) => {
        if (percent > 85) return 'bg-red-500';
        if (percent > 60) return 'bg-orange-500';
        return 'bg-amber-500';
    };

    const dbUsedMB = metrics ? parseFloat(formatBytesToMB(metrics.db_size)) : 0;
    const storageUsedMB = metrics ? parseFloat(formatBytesToMB(metrics.storage_size)) : 0;

    const dbPercent = getPercentage(dbUsedMB, DB_LIMIT_MB);
    const storagePercent = getPercentage(storageUsedMB, STORAGE_LIMIT_MB);

    return (
        <div className="p-4 md:p-8 space-y-8 select-none">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter text-white flex items-center gap-3">
                        <ShieldAlert className="text-amber-500" />
                        نظام المراقبة والاستهلاك (Admin Only)
                    </h1>
                    <p className="text-sm text-zinc-400 mt-1 font-bold">
                        تتبع حدود وباقات التخزين المجانية في قواعد البيانات ومصادر الصور.
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Supabase Database */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 rounded-full bg-blue-500 h-full opacity-50"></div>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Database className="text-blue-500 w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">قاعدة البيانات (Supabase)</h2>
                            <p className="text-xs font-bold text-zinc-500">النصوص والمحتوى، الحد الأقصى للنظام 500 ميجا</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-bold">
                            <span className="text-zinc-300">مُستهلك: <span className="text-blue-400">{dbUsedMB} MB</span></span>
                            <span className="text-zinc-500">السعة: 500 MB</span>
                        </div>
                        <div className="h-3 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(dbPercent)}`}
                                style={{ width: `${dbPercent}%` }}
                            />
                        </div>
                        <p className="text-[10px] text-zinc-500 text-left mt-1">{dbPercent.toFixed(1)}%</p>
                    </div>
                </div>

                {/* Supabase Storage */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 rounded-full bg-green-500 h-full opacity-50"></div>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <HardDrive className="text-green-500 w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">مساحة التخزين (Supabase)</h2>
                            <p className="text-xs font-bold text-zinc-500">استهلاك الملفات المرفوعة مؤخراً، السعة 1 جيجا مجاناً</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-bold">
                            <span className="text-zinc-300">مُستهلك: <span className="text-green-400">{storageUsedMB} MB</span></span>
                            <span className="text-zinc-500">السعة: 1000 MB</span>
                        </div>
                        <div className="h-3 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(storagePercent)}`}
                                style={{ width: `${storagePercent}%` }}
                            />
                        </div>
                        <p className="text-[10px] text-zinc-500 text-left mt-1">{storagePercent.toFixed(1)}%</p>
                    </div>
                </div>

                {/* ImageKit Bandwidth & Storage */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group lg:col-span-2">
                    <div className="absolute top-0 left-0 w-1 rounded-full bg-amber-500 h-full opacity-50"></div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                <ImageIcon className="text-amber-500 w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">تحسين ورفع الصور (ImageKit)</h2>
                                <p className="text-xs font-bold text-zinc-500">جميع الصور اللي في السيستم تستهلك من باقة 20 جيجا باندويث مجانية</p>
                            </div>
                        </div>
                        <a
                            href="https://imagekit.io/dashboard"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-xs font-bold text-amber-500 hover:text-white transition-colors bg-amber-500/10 px-3 py-1.5 rounded-lg"
                        >
                            <span>لوحة تحكم ImageKit</span>
                            <ArrowRight size={14} className="rotate-180" />
                        </a>
                    </div>

                    <div className="p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-xl space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-bold text-white mb-1">إزاي تحسب الاستهلاك بتاع صورك؟</h3>
                                <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl font-bold">
                                    عشان تعرف استهلاك الصور الفعلي وتشوف فاضلك قد إيه من باقة الـ 20 جيجا الشهرية من غير ما تعدى الحد المجاني. يفضل تراجع داشبورد ImageKit بشكل مباشر، لأن التوقع بتاع حجم استهلاك الصور بيكون من لوحتهم هما عشان الـ Traffic بتاع المستخدم نفسه.
                                </p>
                            </div>
                            <div className="hidden sm:block text-left p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 shrink-0">
                                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Monthly Bandwidth</p>
                                <p className="text-2xl font-black text-amber-500 italic">20 GB</p>
                            </div>
                        </div>

                        <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 relative">
                            {/* Mock Progress Animation indicating "Check Dashboard" */}
                            <div className="h-full bg-gradient-to-r from-amber-500/50 via-amber-400 to-amber-500/50 absolute left-0 top-0 w-full opacity-50 mix-blend-screen" />
                        </div>
                        <p className="text-[10px] text-zinc-500 text-center font-bold">لا يمكن الوصول للإستهلاك الحي إلا من حساب ImageKit مباشرة</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
