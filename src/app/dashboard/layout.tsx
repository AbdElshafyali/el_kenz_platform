'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    LogOut,
    User,
    Package,
    Truck,
    Wallet,
    Bell,
    Settings,
    Loader2,
    Menu,
    X,
    Shield,
    Users,
    Activity,
    Box
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AX_AuthService } from '@/services/auth-service';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { AX_ThemeToggle } from '@/components/ui/AX_ThemeToggle';
import { cn } from '@/lib/utils';
import { AX_InstallPrompt } from '../store/components/AX_InstallPrompt';
import { useMyPermissions } from '@/features/staff/hooks/useMyPermissions';
import { useUIStore } from '@/hooks/use-ui-store';

const PROTECTED_ROUTES: Record<string, { section: string; action: string }> = {
    '/dashboard/products': { section: 'products', action: 'view' },
    '/dashboard/orders': { section: 'orders', action: 'view' },
    '/dashboard/customers': { section: 'customers', action: 'view' },
    '/dashboard/staff': { section: 'staff', action: 'view' },
    '/dashboard/settings': { section: 'orders', action: 'view' },
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, setAuth, logout } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { loading: permsLoading, isOwner, can } = useMyPermissions();

    const [isNavVisible, setIsNavVisible] = useState(true);
    const isModalOpen = useUIStore((state) => state.isModalOpen);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY.current + 15) {
                setIsNavVisible(false); // Scrolling down
            } else if (currentScrollY < lastScrollY.current - 15) {
                setIsNavVisible(true); // Scrolling up
            }
            lastScrollY.current = currentScrollY;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        if (user) {
            setLoading(false);
            return;
        }

        const checkSession = async () => {
            try {
                const session = await AX_AuthService.getCurrentSession();
                if (!session) {
                    router.push('/login');
                    return;
                }

                const { data: profile } = await AX_AuthService['supabase']
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .maybeSingle();

                if (profile) {
                    setAuth(profile);
                } else {
                    setAuth({
                        id: session.user.id,
                        full_name: session.user.user_metadata?.full_name || 'مستخدم جديد',
                        email: session.user.email || '',
                        phone: session.user.user_metadata?.phone || '',
                        role: session.user.user_metadata?.role || 'customer'
                    });
                }
            } catch (error) {
                console.error('Session check failed:', error);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, []);

    useEffect(() => {
        if (loading || permsLoading) return;
        if (isOwner) return;
        const matched = Object.entries(PROTECTED_ROUTES).find(([route]) => pathname.startsWith(route));
        if (!matched) return;
        const [, { section, action }] = matched;
        if (!can(section, action)) {
            router.replace('/dashboard');
        }
    }, [pathname, loading, permsLoading, isOwner]);

    const handleLogout = async () => {
        await AX_AuthService.signOut();
        logout();
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                    <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
                </div>
                <p className="text-sm font-black text-primary uppercase tracking-[0.3em] animate-pulse">جاري المصادقة</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden font-sans selection:bg-primary/20" dir="rtl">
            
            {/* Main Content Area */}
            <main className="flex-1 min-h-screen flex flex-col w-full transition-all duration-700 overflow-x-hidden pb-32">
                
                {/* Navbar */}
                <header className="h-20 border-b border-border flex items-center justify-between px-6 md:px-12 bg-background/40 backdrop-blur-3xl sticky top-0 z-[80]">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-12 h-12 bg-background border-2 border-primary/20 rounded-2xl flex items-center justify-center relative z-10 shadow-sm group-hover:border-primary/50 transition-all overflow-hidden p-1">
                                    <div className="w-full h-full bg-primary/5 rounded-xl flex items-center justify-center">
                                        <User className="text-primary" size={24} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <h2 className="font-black text-base text-foreground tracking-tight leading-none">{user?.full_name}</h2>
                                <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1.5 opacity-80">{user?.role === 'admin' ? 'مدير النظام' : 'عضو الفريق'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link href="/dashboard" className="group flex items-center gap-3">
                            <img 
                                src="/logo.png" 
                                alt="الكنز ستور" 
                                className="w-10 h-10 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500" 
                            />
                            <h1 className="text-xl font-black tracking-tighter leading-none hidden sm:block">
                                الكنز<span className="text-primary italic">.</span>
                            </h1>
                        </Link>
                        
                        <div className="flex items-center gap-3">
                            <AX_ThemeToggle />
                            <button className="p-3 bg-secondary/40 border border-border rounded-2xl text-muted-foreground hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all relative group shadow-sm">
                                <Bell size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                                <span className="absolute top-2 left-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
                            </button>
                            <button 
                                onClick={handleLogout}
                                className="p-3 bg-destructive/5 border border-destructive/20 text-destructive hover:bg-destructive/10 rounded-2xl transition-all active:scale-90"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-4 md:p-8 lg:p-12 pb-12 animate-in fade-in duration-700">
                        {children}
                    </div>
                </div>
                <AX_InstallPrompt isMandatory={true} />
            </main>

            {/* Floating Navigation Bar */}
            <div className={cn(
                "fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] w-fit max-w-[95vw] transition-all duration-500",
                isModalOpen || !isNavVisible ? "opacity-0 translate-y-24 pointer-events-none" : "opacity-100 translate-y-0"
            )}>
                <nav className="bg-background/80 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[2.5rem] p-2 flex items-center gap-1 overflow-x-auto no-scrollbar ring-1 ring-black/5">
                    <FloatingNavItem icon={<LayoutDashboard />} label="نظرة عامة" href="/dashboard" active={pathname === '/dashboard'} />
                    
                    {(isOwner || can('products', 'view')) && (
                        <FloatingNavItem icon={<Package />} label="المنتجات" href="/dashboard/products" active={pathname.startsWith('/dashboard/products')} />
                    )}
                    {(isOwner || can('orders', 'view')) && (
                        <FloatingNavItem icon={<Truck />} label="الطلبات" href="/dashboard/orders" active={pathname === '/dashboard/orders'} />
                    )}
                    {(isOwner || can('customers', 'view')) && (
                        <FloatingNavItem icon={<Users />} label="العملاء" href="/dashboard/customers" active={pathname.startsWith('/dashboard/customers')} />
                    )}
                    {(isOwner || can('staff', 'view')) && (
                        <FloatingNavItem icon={<Shield />} label="الفريق" href="/dashboard/staff" active={pathname === '/dashboard/staff'} />
                    )}
                    
                    <div className="w-[1px] h-8 bg-border/50 mx-2 shrink-0" />
                    
                    <FloatingNavItem icon={<Settings />} label="الإعدادات" href="/dashboard/settings" active={pathname === '/dashboard/settings'} />
                </nav>
            </div>
        </div>
    );
}

function FloatingNavItem({ icon, label, href, active = false }: {
    icon: React.ReactNode;
    label: string;
    href: string;
    active?: boolean;
}) {
    return (
        <Link 
            href={href} 
            prefetch={true}
            className={cn(`
                relative flex flex-col items-center justify-center min-w-[64px] h-[64px] rounded-[2rem] transition-all duration-500 group
                ${active ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'hover:bg-secondary/80 text-muted-foreground hover:text-foreground'}
            `)}
        >
            <div className={cn("transition-transform duration-300", active ? "scale-110" : "group-hover:scale-110")}>
                {React.cloneElement(icon as React.ReactElement<any>, { size: 24, strokeWidth: active ? 2.5 : 2 })}
            </div>
            <span className={cn(
                "text-[9px] font-black uppercase tracking-tighter mt-1 transition-all duration-300", 
                active ? "opacity-100 text-primary-foreground" : "opacity-0 group-hover:opacity-100 text-foreground"
            )}>
                {label}
            </span>
            {active && (
                <motion.div 
                    layoutId="activeDot"
                    className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-primary-foreground shadow-[0_0_10px_white]" 
                />
            )}
        </Link>
    );
}
