'use client';

import React, { useState, useEffect } from 'react';
import { Settings, User, Share2, CreditCard } from 'lucide-react';
import { AX_AccountSection } from '@/features/settings/components/AX_AccountSection';
import AX_SocialLinks from '@/app/dashboard/products/AX_SocialLinks';
import AX_PaymentSettings from './AX_PaymentSettings';
import { AX_DataService } from '@/services/data-service';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('account');
    const [store, setStore] = useState<any>(null);

    useEffect(() => {
        AX_DataService.getMyStore().then(data => setStore(data));

        const sub = AX_DataService.subscribeToStores(() => {
            AX_DataService.getMyStore().then(data => setStore(data));
        });

        return () => {
            sub.unsubscribe();
        };
    }, []);

    const refreshStore = () => {
        AX_DataService.getMyStore().then(data => setStore(data));
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'account':
                return <AX_AccountSection />;
            case 'payment':
                return <AX_PaymentSettings store={store} onUpdate={refreshStore} />;
            case 'social':
                return <AX_SocialLinks store={store} onUpdate={refreshStore} />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/20 border border-zinc-800 rounded-3xl animate-in fade-in duration-500">
                        <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 mb-4">
                            <Settings size={32} />
                        </div>
                        <h3 className="text-xl font-black text-white">قريباً جداً</h3>
                        <p className="text-zinc-500 text-sm mt-2">هذه المنطقة قيد التطوير حالياً في منصة كنزك.</p>
                    </div>
                );
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="border-b border-zinc-800 pb-6">
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter">الإعدادات</h1>
                <p className="text-zinc-500 text-xs md:text-sm font-medium mt-1">تخصيص حسابك وإدارة صلاحيات منصة كنزك.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Navigation Menu */}
                <div className="space-y-2 lg:sticky lg:top-28 h-fit">
                    <SettingsMenu
                        active={activeTab === 'account'}
                        onClick={() => setActiveTab('account')}
                        icon={<User size={18} />}
                        label="حسابي"
                    />
                    <SettingsMenu
                        active={activeTab === 'payment'}
                        onClick={() => setActiveTab('payment')}
                        icon={<CreditCard size={18} />}
                        label="طرق الدفع والتحصيل"
                    />
                    <SettingsMenu
                        active={activeTab === 'social'}
                        onClick={() => setActiveTab('social')}
                        icon={<Share2 size={18} />}
                        label="التواصل الاجتماعي"
                    />
                </div>

                {/* Content Area */}
                <div className="lg:col-span-2">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}

function SettingsMenu({
    icon,
    label,
    active = false,
    onClick
}: {
    icon: React.ReactNode,
    label: string,
    active?: boolean,
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-sm text-right ${active ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}
