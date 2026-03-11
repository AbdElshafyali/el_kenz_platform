'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import {
    ShoppingBag,
    ShoppingCart,
    Users,
    Wallet,
    Truck,
    Package,
    ArrowUpRight,
    Loader2,
    Zap,
    Database
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { AX_DataService } from '@/services/data-service';
import { AX_StatCard } from '@/features/dashboard/components/AX_StatCard';
import { AX_SalesChart } from '@/features/dashboard/components/AX_SalesChart';
import { AX_CategoryPie } from '@/features/dashboard/components/AX_CategoryPie';
import { AX_ActivityList } from '@/features/dashboard/components/AX_ActivityList';
import { AX_ProductInsights } from '@/features/dashboard/components/AX_ProductInsights';
import { AX_ProductRequests } from '@/features/dashboard/components/AX_ProductRequests';
import { AX_PerformanceBar } from '@/features/dashboard/components/AX_PerformanceBar';
import { AX_DashboardFilters } from '@/features/dashboard/components/AX_DashboardFilters';
import { motion } from 'framer-motion';
import { AX_TopCustomers } from '@/features/dashboard/components/AX_TopCustomers';

export default function DashboardPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        orders: { current: 0, change: 0, trend: 'up' as 'up' | 'down' },
        sales: { current: 0, change: 0, trend: 'up' as 'up' | 'down' },
        stores: { current: 0, change: 0, trend: 'up' as 'up' | 'down' },
        delivery: { current: 0, change: 0, trend: 'up' as 'up' | 'down' },
        requests: { current: 0, change: 0, trend: 'up' as 'up' | 'down' }
    });
    const [chartData, setChartData] = useState<any[]>([]);
    const [performanceData, setPerformanceData] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [pieData, setPieData] = useState<any[]>([]);
    const [productRequests, setProductRequests] = useState<any[]>([]);
    const [topCustomers, setTopCustomers] = useState<any[]>([]);
    const [allStores, setAllStores] = useState<any[]>([]);
    const [productInsights, setProductInsights] = useState<{
        bestSellers: any[],
        lowStock: any[],
        outOfStock: any[],
        hidden: any[]
    }>({
        bestSellers: [],
        lowStock: [],
        outOfStock: [],
        hidden: []
    });

    const loadDashboardData = async (filters: any = {}) => {
        try {
            const now = new Date();
            let startDate: string | undefined;
            const endDate = now.toISOString();

            let prevStartDate: string | undefined;
            let prevEndDate: string | undefined;

            if (filters.timeRange) {
                if (filters.timeRange === 'today') {
                    const d = new Date();
                    d.setHours(0, 0, 0, 0);
                    startDate = d.toISOString();

                    const pStart = new Date(d);
                    pStart.setDate(pStart.getDate() - 1);
                    prevStartDate = pStart.toISOString();
                    prevEndDate = d.toISOString();
                } else if (filters.timeRange === '7d') {
                    const d = new Date();
                    d.setDate(d.getDate() - 7);
                    startDate = d.toISOString();

                    const pStart = new Date(d);
                    pStart.setDate(pStart.getDate() - 7);
                    prevStartDate = pStart.toISOString();
                    prevEndDate = startDate;
                } else if (filters.timeRange === '30d') {
                    const d = new Date();
                    d.setDate(d.getDate() - 30);
                    startDate = d.toISOString();

                    const pStart = new Date(d);
                    pStart.setDate(pStart.getDate() - 30);
                    prevStartDate = pStart.toISOString();
                    prevEndDate = startDate;
                } else if (filters.timeRange === '1y') {
                    const d = new Date();
                    d.setFullYear(d.getFullYear() - 1);
                    startDate = d.toISOString();

                    const pStart = new Date(d);
                    pStart.setFullYear(pStart.getFullYear() - 1);
                    prevStartDate = pStart.toISOString();
                    prevEndDate = startDate;
                } else if (filters.timeRange.startsWith('custom:')) {
                    const [, start, end] = filters.timeRange.split(':');
                    startDate = new Date(start).toISOString();
                    const sDt = new Date(start);
                    const eDt = end ? new Date(end) : now;
                    const diff = eDt.getTime() - sDt.getTime();
                    prevEndDate = sDt.toISOString();
                    prevStartDate = new Date(sDt.getTime() - diff).toISOString();
                }
            }

            const [allOrders, products, allStoresArr, allProfiles, allTransactions, recentLikes] = await Promise.all([
                AX_DataService.getOrders(filters.storeId === 'all' ? undefined : filters.storeId),
                AX_DataService.getProducts(),
                AX_DataService.getStores(),
                AX_DataService.getProfiles(),
                AX_DataService.getTransactions(10000),
                AX_DataService.getRecentLikes()
            ]);

            setAllStores(allStoresArr);

            const filterFlowItems = (items: any[], start?: string, end?: string) => {
                if (!start) return items;
                return items.filter(item => {
                    const dt = new Date(item.created_at || new Date()).getTime();
                    return dt >= new Date(start).getTime() && dt <= new Date(end || now).getTime();
                });
            };

            const filterStateItems = (items: any[], end?: string) => {
                if (!end) return items;
                return items.filter(item => {
                    const dt = new Date(item.created_at || new Date()).getTime();
                    return dt <= new Date(end).getTime();
                });
            };

            const currentOrders = filterFlowItems(allOrders, startDate, endDate);
            const prevOrders = filterFlowItems(allOrders, prevStartDate, prevEndDate);

            const currentTransactions = filterFlowItems(allTransactions, startDate, endDate);
            const prevTransactions = filterFlowItems(allTransactions, prevStartDate, prevEndDate);

            const currentStores = filterStateItems(allStoresArr, endDate);
            const prevStores = filterStateItems(allStoresArr, prevEndDate);

            const currentProfiles = filterStateItems(allProfiles, endDate);
            const prevProfiles = filterStateItems(allProfiles, prevEndDate);

            const calculateRequests = (ordersList: any[]) => {
                return ordersList
                    .filter((o: any) => o.status === 'request')
                    .flatMap((o: any) => (o.items || []).filter((i: any) => i.is_backorder).map((item: any) => ({
                        id: o.id + item.id,
                        product_id: item.product_id,
                        product_name: item.name_ar || item.name,
                        customer_name: o.customer_name,
                        customer_phone: o.customer_phone,
                        customer_address: o.customer_address,
                        quantity: item.quantity,
                        created_at: o.created_at,
                        image_url: item.image_url
                    })));
            };

            const currentRequests = calculateRequests(currentOrders);
            const prevRequests = calculateRequests(prevOrders);

            setProductRequests(currentRequests);

            // VIP Customers Logic
            const customerMap: Record<string, any> = {};
            allOrders.forEach((o: any) => {
                if (o.status !== 'request' && o.customer_phone) {
                    if (!customerMap[o.customer_phone]) {
                        customerMap[o.customer_phone] = {
                            name: o.customer_name,
                            phone: o.customer_phone,
                            totalSpent: 0,
                            orderCount: 0,
                            lastLocation: o.customer_address?.split(',')[0]
                        };
                    }
                    customerMap[o.customer_phone].totalSpent += Number(o.total_amount || 0);
                    customerMap[o.customer_phone].orderCount += 1;
                }
            });
            const liveVIPs = Object.values(customerMap)
                .sort((a: any, b: any) => b.totalSpent - a.totalSpent)
                .slice(0, 5);
            setTopCustomers(liveVIPs);

            const getChange = (curr: number, prev: number) => {
                if (prev === 0) return { change: curr > 0 ? 100 : 0, trend: 'up' as const };
                const diff = curr - prev;
                return {
                    change: Math.round(Math.abs(diff / prev) * 100),
                    trend: diff >= 0 ? 'up' as const : 'down' as const
                };
            };

            const cSales = currentTransactions.reduce((acc: number, t: any) => t.type === 'deposit' ? acc + Number(t.amount) : acc, 0);
            const pSales = prevTransactions.reduce((acc: number, t: any) => t.type === 'deposit' ? acc + Number(t.amount) : acc, 0);

            const cOrders = currentOrders.filter((o: any) => o.status !== 'request').length;
            const pOrders = prevOrders.filter((o: any) => o.status !== 'request').length;

            const cStores = currentStores.length;
            const pStores = prevStores.length;

            const cDelivery = currentProfiles.filter((p: any) => p.role === 'delivery').length;
            const pDelivery = prevProfiles.filter((p: any) => p.role === 'delivery').length;

            const cReq = currentRequests.length;
            const pReq = prevRequests.length;

            setStats({
                sales: { current: cSales, ...getChange(cSales, pSales) },
                orders: { current: cOrders, ...getChange(cOrders, pOrders) },
                stores: { current: cStores, ...getChange(cStores, pStores) },
                delivery: { current: cDelivery, ...getChange(cDelivery, pDelivery) },
                requests: { current: cReq, ...getChange(cReq, pReq) }
            });

            // Performance Bar Data (Top Stores by Sales)
            const storeSalesMap: Record<string, number> = {};
            currentOrders.forEach((o: any) => {
                if (o.status !== 'request' && o.store_id) {
                    storeSalesMap[o.store_id] = (storeSalesMap[o.store_id] || 0) + Number(o.total_amount || 0);
                }
            });

            const liveStorePerf = allStoresArr
                .filter(s => storeSalesMap[s.id])
                .map(s => ({
                    name: s.name,
                    value: storeSalesMap[s.id]
                }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 5);

            setPerformanceData(liveStorePerf);

            const getSalesCount = (productId: string) => {
                let count = 0;
                allOrders.forEach((o: any) => {
                    if (o.status !== 'request' && o.items) {
                        o.items.forEach((item: any) => {
                            if (item.product_id === productId) {
                                count += item.quantity || 1;
                            }
                        });
                    }
                });
                return count;
            };

            const processedProducts = products.map(p => ({
                id: p.id,
                name: p.name,
                image: p.image_url,
                stock: p.stock || 0,
                sales: getSalesCount(p.id),
                price: p.price,
                status: p.is_hidden ? 'hidden' : (p.stock === 0 ? 'out_of_stock' : 'active')
            }));

            setProductInsights({
                bestSellers: [...processedProducts].sort((a, b) => b.sales - a.sales).filter(p => p.sales > 0).slice(0, 5),
                lowStock: processedProducts.filter(p => p.stock > 0 && p.stock < 10).slice(0, 5),
                outOfStock: processedProducts.filter(p => p.stock === 0).slice(0, 5),
                hidden: processedProducts.filter(p => p.status === 'hidden')
            });

            // Compile Chart Data based on current flow
            const salesByDate: Record<string, number> = {};
            currentTransactions.forEach((t: any) => {
                if (t.type === 'deposit') {
                    // Extract only the date part YYYY-MM-DD
                    const dateStr = new Date(t.created_at).toISOString().split('T')[0];
                    salesByDate[dateStr] = (salesByDate[dateStr] || 0) + Number(t.amount);
                }
            });

            const liveChartData = [];

            // Loop over the last 7 days from endDate
            for (let i = 6; i >= 0; i--) {
                const d = new Date(endDate);
                d.setDate(d.getDate() - i);
                const dateKey = d.toISOString().split('T')[0];
                const dayName = new Intl.DateTimeFormat('ar-EG', { weekday: 'long' }).format(d);
                liveChartData.push({
                    name: dayName,
                    sales: salesByDate[dateKey] || 0
                });
            }

            setChartData(liveChartData);

            // Compute Categories Data dynamically from products array
            const categoryMap: Record<string, number> = {};
            products.forEach(p => {
                const cat = p.category && p.category.trim() !== '' ? p.category : 'أخرى';
                categoryMap[cat] = (categoryMap[cat] || 0) + 1;
            });

            const totalProds = products.length || 1;
            const colors = ['#f59e0b', '#0ea5e9', '#10b981', '#6366f1', '#ec4899', '#8b5cf6', '#14b8a6', '#f43f5e'];

            const livePieData = Object.keys(categoryMap).map((key, idx) => ({
                name: key,
                value: Math.round((categoryMap[key] / totalProds) * 100),
                rawCount: categoryMap[key],
                color: colors[idx % colors.length]
            }));

            setPieData(livePieData);

            const orderActivities = currentOrders.slice(0, 15).map((o: any) => {
                const isRequest = o.status === 'request';
                return {
                    id: o.id,
                    type: isRequest ? 'request' : 'order',
                    title: isRequest ? 'طلب توفر جديد' : 'طلب جديد',
                    desc: `طلب للعميل: ${o.customer_name || 'غير معروف'}`,
                    time: new Date(o.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
                    timestamp: new Date(o.created_at).getTime(),
                    amount: o.total_amount ? Number(o.total_amount) : undefined
                };
            });

            const transactionActivities = currentTransactions.slice(0, 15).map((t: any) => ({
                id: t.id,
                type: t.type === 'deposit' ? 'deposit' : 'payout',
                title: t.type === 'deposit' ? 'إيداع جديد' : 'طلب سحب أرباح',
                desc: t.description || 'عملية في المحفظة',
                time: new Date(t.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
                timestamp: new Date(t.created_at).getTime(),
                amount: Number(t.amount)
            }));

            const likeActivities = (recentLikes || []).map((l: any, idx: number) => {
                const prodName = products.find((p: any) => p.id === l.product_id)?.name_ar || 'منتج غير معروف';
                let userName = 'عضو جديد';
                if (l.profiles && l.profiles.full_name) userName = l.profiles.full_name;

                return {
                    id: l.user_id + '_' + l.product_id + '_' + idx,
                    type: 'like',
                    title: 'إعجاب جديد',
                    desc: `${userName} أبدى إعجابه بـ ${prodName}`,
                    time: new Date(l.created_at || Date.now()).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
                    timestamp: new Date(l.created_at || Date.now()).getTime(),
                };
            });

            const mergedActivities = [...orderActivities, ...transactionActivities, ...likeActivities]
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 7);

            setActivities(mergedActivities);

        } catch (err) {
            console.error('AX_Dashboard_Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();

        const subs = [
            AX_DataService.subscribeToOrders(() => loadDashboardData()),
            AX_DataService.subscribeToTransactions(() => loadDashboardData()),
            AX_DataService.subscribeToProducts(() => loadDashboardData()),
            AX_DataService.subscribeToLikes(() => loadDashboardData())
        ];

        return () => subs.forEach(s => s.unsubscribe());
    }, []);

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4">
                <div className="relative">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
                </div>
                <p className="text-muted-foreground text-xs font-black uppercase tracking-[0.2em] italic">جاري تحميل الكنز...</p>
            </div>
        );
    }

    // We're calculating pieData dynamically now

    return (
        <div className="p-4 md:p-10 space-y-10 max-w-[1600px] mx-auto min-h-screen transition-all duration-500 overflow-x-hidden">
            
            {/* --- Header Section --- */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter uppercase flex items-center gap-3">
                            لوحة التحكم 
                            <span className="text-muted-foreground/30 text-xl font-thin">/</span> 
                            <span className="text-primary/80">الرئيسية</span>
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-xs md:text-sm font-medium tracking-tight opacity-70">
                        مرحباً <span className="text-foreground font-black underline decoration-primary/30 decoration-2 underline-offset-4">{user?.full_name}</span>. إليك ملخص ذكي لأداء متجرك اليوم.
                    </p>
                </div>

                <div className="shrink-0">
                    <AX_DashboardFilters
                        onTimeChange={(val) => loadDashboardData({ timeRange: val })}
                        onStoreChange={() => { }}
                        stores={[]}
                    />
                </div>
            </div>

            {/* --- Stats Grid (5 Columns) --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <AX_StatCard
                    label="إجمالي المبيعات"
                    value={`${stats.sales.current.toLocaleString()} ج.م`}
                    change={`${stats.sales.change}%`}
                    trend={stats.sales.trend}
                    icon={<Wallet />}
                    color="amber"
                />
                <AX_StatCard
                    label="الطلبات الكلية"
                    value={stats.orders.current}
                    change={`${stats.orders.change}%`}
                    trend={stats.orders.trend}
                    icon={<ShoppingCart />}
                    color="sky"
                />
                <AX_StatCard
                    label="طلبات التوفر"
                    value={stats.requests.current}
                    change={`${stats.requests.change}%`}
                    trend={stats.requests.trend}
                    icon={<ShoppingBag />}
                    color="rose"
                />
                <AX_StatCard
                    label="المتاجر"
                    value={stats.stores.current}
                    change={`${stats.stores.change}%`}
                    trend={stats.stores.trend}
                    icon={<Package />}
                    color="zinc"
                />
                <AX_StatCard
                    label="فريق التوصيل"
                    value={stats.delivery.current}
                    change={`${stats.delivery.change}%`}
                    trend={stats.delivery.trend}
                    icon={<Truck />}
                    color="emerald"
                />
            </div>

            {/* --- Main Dashboard Content Layout --- */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Flow & Content (Charts/Insights) */}
                <div className="xl:col-span-8 space-y-8">
                    
                    {/* Full Width Sales Performance */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        <AX_SalesChart data={chartData} title="مؤشر أداء المبيعات" />
                    </div>

                    {/* Secondary Visual (Performance Bar) - Shifted here for better balance */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                             <AX_CategoryPie data={pieData} />
                        </div>
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                            <AX_PerformanceBar data={performanceData} title="توزيع مبيعات المتاجر" />
                        </div>
                    </div>

                    {/* VIP Customers Section - NEW */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-350">
                        <AX_TopCustomers customers={topCustomers} />
                    </div>

                    {/* Dynamic Sections */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-400">
                        <AX_ProductRequests requests={productRequests} />
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
                        <AX_ProductInsights
                            bestSellers={productInsights.bestSellers}
                            lowStock={productInsights.lowStock}
                            outOfStock={productInsights.outOfStock}
                            hidden={productInsights.hidden}
                        />
                    </div>
                </div>

                {/* Right Column: Activity & Side Intelligence */}
                <div className="xl:col-span-4 space-y-8 h-full sticky top-32">
                    <div className="animate-in fade-in slide-in-from-right-4 duration-1000 delay-300">
                        <AX_ActivityList activities={activities} />
                    </div>
                    
                    {/* System Health / AI Insight */}
                    <div className="p-8 rounded-[2.5rem] bg-background border-2 border-border shadow-2xl shadow-primary/5 relative overflow-hidden group transition-all hover:border-primary/30">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
                            <Zap size={100} className="text-primary" />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <Database size={20} />
                            </div>
                            <h4 className="text-[12px] font-black uppercase tracking-[0.2em]">ذكاء الكنز (BI)</h4>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed font-bold">
                            بناءً على نشاط اليوم، لديك <span className="text-primary">{topCustomers.length}</span> عملاء VIP نشطين.
                            المخزون يحتاج لمراجعة لـ <span className="text-foreground font-black">{productInsights.lowStock.length}</span> منتجات أوشكت على النفاد.
                        </p>
                        <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-muted-foreground opacity-40">صحة النظام: 98%</span>
                            <div className="flex gap-1">
                                {[1,2,3,4,5].map(i => <div key={i} className="w-3 h-1 rounded-full bg-primary/30" />)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

