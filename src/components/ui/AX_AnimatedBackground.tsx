'use client';

import React, { useMemo, useEffect, useState } from 'react';
import {
    Sparkles, Star, Zap, ShoppingBag, Heart, Gem, Trophy, Gift,
    Coins, Package, Clock, Crown, Fingerprint, MapPin,
    MessageCircle, Send, Bell, Rocket, Shield, Target
} from 'lucide-react';
import { useTheme } from 'next-themes';

const ICONS = [
    Sparkles, Star, Zap, ShoppingBag, Heart, Gem, Trophy, Gift,
    Coins, Package, Clock, Crown, Fingerprint, MapPin,
    MessageCircle, Send, Bell, Rocket, Shield, Target
];

export default function AX_AnimatedBackground() {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const particles = useMemo(() => {
        if (!mounted) return [];
        const isDark = theme === 'dark';
        
        return Array.from({ length: 45 }).map((_, i) => {
            const Icon = ICONS[Math.floor(Math.random() * ICONS.length)];
            const size = Math.floor(Math.random() * 15) + 12;
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            const duration = Math.random() * 30 + 20;
            const delay = Math.random() * -30;
            const opacity = isDark ? (Math.random() * 0.12 + 0.03) : (Math.random() * 0.08 + 0.02);
            const color = isDark ? 'white' : '#B4944C'; // Gold ish for light mode

            return {
                id: i,
                Icon,
                style: {
                    position: 'absolute' as const,
                    left: `${left}%`,
                    top: `${top}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    color: color,
                    opacity: opacity,
                    filter: 'blur(0.5px)',
                    animation: `ax-float-${i % 3} ${duration}s linear infinite`,
                    animationDelay: `${delay}s`,
                    pointerEvents: 'none' as const,
                    zIndex: 0,
                }
            };
        });
    }, [mounted, theme]);


    if (!mounted) return null;

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0">
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes ax-float-0 {
                    0% { transform: translate(0, 0) rotate(0deg) scale(1); }
                    33% { transform: translate(40px, -60px) rotate(120deg) scale(1.1); }
                    66% { transform: translate(-30px, 30px) rotate(240deg) scale(0.9); }
                    100% { transform: translate(0, 0) rotate(360deg) scale(1); }
                }
                @keyframes ax-float-1 {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    50% { transform: translate(-50px, -30px) rotate(-180deg); }
                    100% { transform: translate(0, 0) rotate(-360deg); }
                }
                @keyframes ax-float-2 {
                    0% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(20px, 20px) scale(1.2); }
                    75% { transform: translate(-20px, -20px) scale(0.8); }
                    100% { transform: translate(0, 0) scale(1); }
                }
            `}} />
            {particles.map((p) => (
                <div key={p.id} style={p.style}>
                    <p.Icon strokeWidth={1} />
                </div>
            ))}
        </div>
    );
}
