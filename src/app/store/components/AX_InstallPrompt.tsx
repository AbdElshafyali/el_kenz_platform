'use client';

import React, { useState, useEffect } from 'react';
import { Share, Download, Bell, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

type Platform = 'ios' | 'android' | 'windows' | 'other' | null;
type Step = 'install' | 'notifications' | 'done';

export function AX_InstallPrompt({ isMandatory = false }: { isMandatory?: boolean }) {
    const [isVisible, setIsVisible] = useState(false);
    const [platform, setPlatform] = useState<Platform>(null);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [step, setStep] = useState<Step>('install');
    const [notifGranted, setNotifGranted] = useState(false);

    useEffect(() => {
        const ua = window.navigator.userAgent;
        const ios = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
        const android = /Android/.test(ua);
        const windows = /Win/.test(ua);

        if (ios) setPlatform('ios');
        else if (android) setPlatform('android');
        else if (windows) setPlatform('windows');
        else setPlatform('other');

        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

        if (isStandalone) {
            // Already installed: only ask for notifications
            const notifDone = localStorage.getItem('ax_notifications_asked');
            if (!notifDone) {
                setTimeout(() => { setStep('notifications'); setIsVisible(true); }, 2000);
            }
            return;
        }

        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);

        const seen = localStorage.getItem('ax_install_prompt_seen');
        if (!seen) {
            setTimeout(() => setIsVisible(true), 2500);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (platform === 'ios') {
            setStep('notifications');
            return;
        }
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            setDeferredPrompt(null);
            if (outcome === 'accepted') {
                setStep('notifications');
            } else {
                closePrompt();
            }
        } else {
            setStep('notifications');
        }
    };

    const requestNotifications = async () => {
        if (!('Notification' in window)) {
            setIsVisible(false);
            localStorage.setItem('ax_notifications_asked', 'true');
            return;
        }
        const permission = await Notification.requestPermission();
        localStorage.setItem('ax_notifications_asked', 'true');
        if (permission === 'granted') {
            setNotifGranted(true);
        }
        setTimeout(() => {
            setStep('done');
            setIsVisible(false);
        }, 1200);
    };

    const skipNotifications = () => {
        localStorage.setItem('ax_notifications_asked', 'true');
        setIsVisible(false);
    };

    const closePrompt = () => {
        setIsVisible(false);
        localStorage.setItem('ax_install_prompt_seen', 'true');
    };

    if (!isVisible || step === 'done') return null;

    return (
        <div className={cn(
            "fixed inset-x-4 bottom-24 z-[9000] md:left-auto md:right-8 md:bottom-12 md:w-80 animate-in slide-in-from-bottom-8 duration-500",
            isMandatory && "bottom-8"
        )}>
            <div className="relative bg-background/75 backdrop-blur-2xl border border-primary/25 rounded-[2rem] p-5 shadow-2xl overflow-hidden ring-1 ring-black/5">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent" />

                {!isMandatory && step === 'install' && (
                    <button onClick={closePrompt} className="absolute top-3 left-3 p-1.5 bg-secondary/50 rounded-lg text-muted-foreground hover:text-foreground z-10">
                        <X size={14} />
                    </button>
                )}

                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-background border border-primary/20 rounded-xl flex items-center justify-center shadow-xl relative overflow-hidden p-1.5">
                            <img src="/logo.png" alt="الكنز" className="w-full h-full object-contain" />
                            <div className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-black tracking-tight">تطبيق <span className="text-primary italic">الكنز</span></h3>
                            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest leading-none mt-1">
                                {step === 'install' ? 'ثبّت التطبيق مجاناً على جهازك' : 'فعّل الإشعارات عشان متفوتكش ديل'}
                            </p>
                        </div>
                    </div>

                    {step === 'install' && (
                        <>
                            {platform === 'ios' ? (
                                <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 space-y-3">
                                    <h4 className="text-[9px] font-black text-primary uppercase tracking-[0.2em] text-center">للتثبيت على الأيفون</h4>
                                    <div className="flex items-center justify-center gap-6 text-[11px] font-black">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="w-9 h-9 flex items-center justify-center bg-secondary rounded-xl border border-border shadow-inner">
                                                <Share size={16} className="text-primary" />
                                            </span>
                                            <span className="text-[9px] text-muted-foreground">مشاركة</span>
                                        </div>
                                        <span className="text-muted-foreground/30 text-lg">›</span>
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="w-9 h-9 flex items-center justify-center bg-secondary rounded-xl border border-border shadow-inner">
                                                <Plus size={16} className="text-primary" />
                                            </span>
                                            <span className="text-[9px] text-muted-foreground">إضافة للشاشة</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleInstall}
                                        className="w-full bg-primary text-primary-foreground font-black py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all text-xs mt-2"
                                    >
                                        ثبّت ومشي →
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleInstall}
                                    className="w-full bg-primary text-primary-foreground font-black py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm"
                                >
                                    <Download size={16} />
                                    تثبيت التطبيق الآن
                                </button>
                            )}

                            <button
                                onClick={closePrompt}
                                className="w-full text-[10px] font-black text-muted-foreground/50 hover:text-muted-foreground transition-colors py-1"
                            >
                                مش دلوقتي
                            </button>
                        </>
                    )}

                    {step === 'notifications' && (
                        <>
                            <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 text-center space-y-2">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                                    <Bell size={22} className="text-primary animate-bounce" />
                                </div>
                                <p className="text-xs font-black text-foreground">خليك أول واحد يعرف بالعروض والجديد!</p>
                                <p className="text-[10px] font-black text-muted-foreground/60">وعدنا مش هنضايقك بإشعارات كتير</p>
                            </div>

                            <button
                                onClick={requestNotifications}
                                className="w-full bg-primary text-primary-foreground font-black py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm"
                            >
                                <Bell size={16} />
                                تفعيل الإشعارات
                            </button>

                            <button
                                onClick={skipNotifications}
                                className="w-full text-[10px] font-black text-muted-foreground/50 hover:text-muted-foreground transition-colors py-1"
                            >
                                لا شكراً
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
