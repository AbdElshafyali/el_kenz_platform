'use client';

import React, { useEffect, useState } from 'react';
import { Wallet, ArrowDownRight, ArrowUpLeft, History, CreditCard, Landmark, DollarSign, Loader2 } from 'lucide-react';
import { AX_DataService } from '@/services/data-service';

export default function WalletPage() {
    const [balance, setBalance] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const [walletData, transData] = await Promise.all([
                AX_DataService.getWalletBalance(),
                AX_DataService.getTransactions(10)
            ]);
            setBalance(walletData);
            setTransactions(transData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();

        const subs = [
            AX_DataService.subscribeToWallets(loadData),
            AX_DataService.subscribeToTransactions(loadData)
        ];

        return () => {
            subs.forEach(s => s.unsubscribe());
        };
    }, []);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
        );
    }

    const currentBalance = balance?.balance || 0;

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="border-b border-zinc-800 pb-6">
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter">المحفظة المالية</h1>
                <p className="text-zinc-500 text-xs md:text-sm font-medium mt-1">متابعة الأرصدة، الأرباح، وعمليات السحب والتسوية.</p>
            </div>

            {/* Wallet Overview Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] -z-10" />
                    <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-zinc-400 text-xs font-black uppercase tracking-[0.2em] mb-2">الرصيد المتاح</p>
                                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
                                    {currentBalance.toLocaleString()} <span className="text-xl md:text-2xl text-amber-500">ج.م</span>
                                </h2>
                            </div>
                            <div className="p-4 bg-white/5 backdrop-blur-md rounded-[1.5rem] border border-white/10">
                                <Wallet className="text-amber-500" size={32} />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <button className="flex-1 bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all active:scale-95 text-sm md:text-base">
                                <ArrowUpLeft size={20} />
                                طلب سحب أرباح
                            </button>
                            <button className="flex-1 bg-zinc-900 border border-zinc-800 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all active:scale-95 text-sm md:text-base">
                                <CreditCard size={20} />
                                طرق الدفع
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <BalanceSmallCard label="أرباح الشهر" value={`${(currentBalance * 0.2).toLocaleString()} ج.م`} trend="+15%" icon={<DollarSign size={18} />} />
                    <BalanceSmallCard label="معلق للتسوية" value="3,150 ج.م" trend="0%" icon={<ClockIcon />} />
                    <BalanceSmallCard label="تسويات مكتملة" value="128 عملية" trend="" icon={<Landmark size={18} />} />
                </div>
            </div>

            {/* Transactions History */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                        <History size={20} className="text-amber-500" />
                        آخر العمليات
                    </h3>
                    <button className="text-xs font-black text-zinc-500 hover:text-amber-500 transition-colors uppercase tracking-widest">عرض السجل الكامل</button>
                </div>

                <div className="bg-zinc-900/20 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
                    <div className="divide-y divide-zinc-800/50">
                        {transactions.length > 0 ? transactions.map(t => (
                            <TransactionItem
                                key={t.id}
                                title={t.description || (t.amount > 0 ? 'إيداع رصيد' : 'سحب أرباح')}
                                date={new Date(t.created_at).toLocaleString('ar-EG', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                amount={t.amount}
                                status="completed"
                                type={t.amount > 0 ? 'in' : 'out'}
                            />
                        )) : (
                            <div className="p-10 text-center text-zinc-700 text-xs font-black uppercase tracking-widest">لا توجد عمليات مسجلة</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function BalanceSmallCard({ label, value, trend, icon }: any) {
    return (
        <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-[2rem] flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-start">
                <div className="p-2 bg-zinc-800 rounded-xl text-zinc-400">{icon}</div>
                {trend && <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md">{trend}</span>}
            </div>
            <div>
                <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">{label}</p>
                <p className="text-lg font-black text-white">{value}</p>
            </div>
        </div>
    );
}

function TransactionItem({ title, date, amount, status, type }: any) {
    return (
        <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-all group">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${type === 'in' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {type === 'in' ? <ArrowDownRight size={20} /> : <ArrowUpLeft size={20} />}
                </div>
                <div>
                    <h4 className="text-sm font-black text-white group-hover:text-amber-500 transition-colors">{title}</h4>
                    <p className="text-[10px] font-medium text-zinc-500 mt-0.5">{date}</p>
                </div>
            </div>
            <div className="text-left">
                <p className={`text-sm font-black ${type === 'in' ? 'text-green-500' : 'text-white'}`}>{amount} ج.م</p>
                <span className={`text-[9px] font-black uppercase tracking-tighter ${status === 'completed' ? 'text-zinc-600' : 'text-amber-500'}`}>
                    {status === 'completed' ? 'مكتمل' : 'قيد المعالجة'}
                </span>
            </div>
        </div>
    );
}

function ClockIcon() {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
}
