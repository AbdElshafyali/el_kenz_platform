'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialLink {
    icon: React.ReactNode;
    href: string;
    label: string;
    color: string;
    bg: string;
}

interface AX_FloatingDockProps {
    cartCount: number;
    onCartOpen: () => void;
    store: any;
}

const FacebookIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
);

const TikTokIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
);

const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

const TwitterIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const YouTubeIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
);

const MapsIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
);

export default function AX_FloatingDock({ cartCount, onCartOpen, store }: AX_FloatingDockProps) {
    const [dockOpen, setDockOpen] = useState(false);
    const dockRef = useRef<HTMLDivElement>(null);

    const socialLinks: SocialLink[] = [
        store?.social_facebook && {
            icon: <FacebookIcon />, href: store.social_facebook,
            label: 'Facebook', color: 'text-white', bg: 'bg-[#1877F2]'
        },
        store?.social_instagram && {
            icon: <InstagramIcon />, href: store.social_instagram,
            label: 'Instagram', color: 'text-white',
            bg: 'bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45]'
        },
        store?.social_tiktok && {
            icon: <TikTokIcon />, href: store.social_tiktok,
            label: 'TikTok', color: 'text-white', bg: 'bg-black'
        },
        store?.social_whatsapp && {
            icon: <WhatsAppIcon />, href: `https://wa.me/${store.social_whatsapp.replace(/\D/g, '')}`,
            label: 'WhatsApp', color: 'text-white', bg: 'bg-[#25D366]'
        },
        store?.social_twitter && {
            icon: <TwitterIcon />, href: store.social_twitter,
            label: 'Twitter', color: 'text-white', bg: 'bg-black'
        },
        store?.social_youtube && {
            icon: <YouTubeIcon />, href: store.social_youtube,
            label: 'YouTube', color: 'text-white', bg: 'bg-[#FF0000]'
        },
        store?.social_maps && {
            icon: <MapsIcon />, href: store.social_maps,
            label: 'Google Maps', color: 'text-white', bg: 'bg-[#4285F4]'
        },
    ].filter(Boolean) as SocialLink[];

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dockRef.current && !dockRef.current.contains(e.target as Node)) {
                setDockOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const radius = Math.max(80, 70 + socialLinks.length * 12);

    return (
        <>
            {/* Cart Float - Right Side */}
            <div className="fixed left-6 bottom-32 z-[100] md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-auto md:right-8 flex flex-col items-center gap-2 group pointer-events-none">
                <button
                    onClick={onCartOpen}
                    className="pointer-events-auto relative w-16 h-16 bg-background border border-border rounded-[2rem] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:border-primary/50 shadow-2xl group active:scale-95"
                >
                    <ShoppingBag size={28} className="text-foreground group-hover:text-primary transition-colors" />
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[11px] font-black w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-4 border-background animate-in zoom-in-50">
                            {cartCount > 99 ? '99' : cartCount}
                        </span>
                    )}
                </button>
                <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase opacity-0 group-hover:opacity-100 transition-opacity">السلة</span>
            </div>

            {socialLinks.length > 0 && (
                <div
                    ref={dockRef}
                    className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[150]"
                    onMouseEnter={() => setDockOpen(true)}
                    onMouseLeave={() => setDockOpen(false)}
                >
                    <div className="relative flex items-end justify-center transition-all duration-500"
                        style={{ width: `${(radius * 2) + 120}px`, height: dockOpen ? `${radius + 80}px` : '40px' }}
                    >
                        {socialLinks.map((link, i) => {
                            const total = socialLinks.length;
                            const maxAngle = 70;
                            const angle = total === 1 ? 0 : -maxAngle + (i / (total - 1)) * (2 * maxAngle);
                            const rad = (angle * Math.PI) / 180;
                            const x = radius * Math.sin(rad);
                            const y = radius * Math.cos(rad) - (radius * Math.cos(maxAngle * Math.PI / 180));

                            return (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        position: 'absolute',
                                        bottom: `${y + 60}px`,
                                        left: `calc(50% + ${x}px - 24px)`,
                                        transitionDelay: dockOpen ? `${i * 50}ms` : `${(total - i - 1) * 30}ms`,
                                        transform: dockOpen ? 'scale(1) translateY(0)' : 'scale(0) translateY(100px)',
                                        opacity: dockOpen ? 1 : 0,
                                        transitionDuration: '0.5s',
                                        transitionTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    }}
                                    className="group/icon"
                                    title={link.label}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center shadow-2xl border-2 border-background hover:scale-125 transition-all duration-300",
                                        link.bg, link.color
                                    )}>
                                        {link.icon}
                                    </div>
                                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-4 py-2 bg-background border border-border text-[10px] font-black text-foreground rounded-2xl shadow-2xl opacity-0 group-hover/icon:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                        {link.label}
                                    </span>
                                </a>
                            );
                        })}

                        {/* Trigger Handle */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 group/handle cursor-pointer">
                            <div className={cn(
                                "w-20 h-10 rounded-t-[2.5rem] flex items-center justify-center transition-all duration-500 border-t border-x border-border shadow-2xl",
                                dockOpen ? "bg-primary border-primary h-12" : "bg-secondary/80 backdrop-blur-xl hover:bg-secondary"
                            )}>
                                <Share2 
                                    size={18} 
                                    className={cn(
                                        "transition-all duration-500",
                                        dockOpen ? "text-primary-foreground rotate-180 scale-125" : "text-primary group-hover/handle:scale-110"
                                    )} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
