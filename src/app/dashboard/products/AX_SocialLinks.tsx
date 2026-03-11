'use client';

import React, { useState, useEffect } from 'react';
import { Share2, Facebook, Instagram, Youtube, CheckCircle2, AlertCircle, Loader2, MapPin } from 'lucide-react';
import { AX_DataService } from '@/services/data-service';

interface AX_SocialLinksProps {
    store: any;
    onUpdate: () => void;
}

const SOCIALS = [
    {
        key: 'social_facebook',
        label: 'فيسبوك',
        hint: 'الزوار هيروحوا لصفحتك ويعملوا Follow',
        icon: <Facebook size={16} />,
        placeholder: 'https://facebook.com/yourpage',
        color: 'focus:border-[#1877F2]/50',
        dot: 'bg-[#1877F2]'
    },
    {
        key: 'social_instagram',
        label: 'إنستجرام',
        hint: 'هيروحوا لبروفايلك ويعملوا Follow',
        icon: <Instagram size={16} />,
        placeholder: 'https://instagram.com/yourpage',
        color: 'focus:border-pink-500/50',
        dot: 'bg-gradient-to-br from-purple-600 to-pink-400'
    },
    {
        key: 'social_tiktok',
        label: 'تيك توك',
        hint: 'هيروحوا لصفحتك ويعملوا Follow',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
            </svg>
        ),
        placeholder: 'https://tiktok.com/@yourpage',
        color: 'focus:border-zinc-400/50',
        dot: 'bg-zinc-300'
    },
    {
        key: 'social_whatsapp',
        label: 'واتساب',
        hint: 'هيفتح المحادثة مباشرة في التطبيق',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
        ),
        placeholder: '0501234567 (أو رقم بالكود الدولي)',
        color: 'focus:border-[#25D366]/50',
        dot: 'bg-[#25D366]'
    },
    {
        key: 'social_twitter',
        label: 'X (تويتر)',
        hint: 'هيروحوا لبروفايلك ويعملوا Follow',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
        placeholder: 'https://x.com/yourhandle',
        color: 'focus:border-white/30',
        dot: 'bg-white'
    },
    {
        key: 'social_youtube',
        label: 'يوتيوب',
        hint: 'هيروحوا لقناتك ويعملوا Subscribe',
        icon: <Youtube size={16} />,
        placeholder: 'https://youtube.com/@yourchannel',
        color: 'focus:border-red-500/50',
        dot: 'bg-[#FF0000]'
    },
    {
        key: 'social_maps',
        label: 'خرائط جوجل',
        hint: 'هيفتح الموقع على خرائط جوجل ويقدر يحط تقييم أو يفتح التطبيق',
        icon: <MapPin size={16} />,
        placeholder: 'https://maps.app.goo.gl/xxxxxx (نسخ لينك "مشاركة" من خرائط جوجل)',
        color: 'focus:border-[#4285F4]/50',
        dot: 'bg-[#4285F4]'
    },
];

export default function AX_SocialLinks({ store, onUpdate }: AX_SocialLinksProps) {
    const [links, setLinks] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        const init: Record<string, string> = {};
        SOCIALS.forEach(s => { init[s.key] = store?.[s.key] || ''; });
        setLinks(init);
    }, [store]);

    const handleSave = async () => {
        if (!store?.id) return;
        setLoading(true);
        setStatus('idle');
        try {
            const updates: any = {};
            SOCIALS.forEach(s => {
                updates[s.key] = links[s.key]?.trim() || null;
            });
            await AX_DataService.updateStore(store.id, updates);
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

    return (
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2rem] p-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Share2 className="text-amber-500" size={20} />
                        <h3 className="text-lg font-black text-white">روابط التواصل الاجتماعي</h3>
                    </div>
                    <p className="text-zinc-500 text-xs font-medium">
                        الروابط دي هتظهر في الاستور — الزوار يدوسوا وينتقلوا للتطبيق مباشرة.
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading || !store?.id}
                    className={`px-6 py-2 rounded-xl text-xs font-black transition-all active:scale-95 flex items-center gap-2 ${loading || !store?.id ? 'opacity-50 cursor-not-allowed bg-zinc-800 text-zinc-400' :
                            status === 'success' ? 'bg-green-500 text-white' :
                                'bg-white text-black hover:bg-zinc-200'
                        }`}
                >
                    {loading ? <Loader2 size={14} className="animate-spin" /> :
                        status === 'success' ? <CheckCircle2 size={14} /> : null}
                    {loading ? 'جاري الحفظ...' : status === 'success' ? 'تم الحفظ' : 'حفظ الروابط'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {SOCIALS.map((social) => (
                    <div key={social.key} className="space-y-1.5">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2 px-1">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${social.dot}`} />
                            {social.label}
                        </label>
                        <div className="relative">
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600">
                                {social.icon}
                            </div>
                            <input
                                type="text"
                                dir="ltr"
                                value={links[social.key] || ''}
                                onChange={(e) => setLinks(prev => ({ ...prev, [social.key]: e.target.value }))}
                                placeholder={social.placeholder}
                                className={`w-full bg-zinc-900 border border-zinc-800 rounded-2xl pr-11 pl-5 py-3 outline-none text-sm font-medium text-white placeholder:text-zinc-700 transition-all ${social.color}`}
                            />
                        </div>
                        <p className="text-[9px] text-zinc-600 font-medium px-2">{social.hint}</p>
                    </div>
                ))}
            </div>

            {status === 'error' && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                    <AlertCircle size={14} className="text-red-500" />
                    <p className="text-[10px] text-red-500/80 font-bold">حدث خطأ أثناء الحفظ. حاول مرة أخرى.</p>
                </div>
            )}

            <div className="mt-5 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                <p className="text-[10px] text-amber-500/70 font-bold leading-relaxed">
                    📌 نصيحة: روابط اليوتيوب والتيك توك والإنستجرام — لو حطيت لينك البروفايل مباشرة، الزوار هيروحوا يعملوا Subscribe/Follow. الواتساب بيفتح المحادثة مباشرة في التطبيق على الموبايل. خرائط جوجل بتفتح الموقع وبيقدر يراجع ويحط تقييم.
                </p>
            </div>
        </div>
    );
}
