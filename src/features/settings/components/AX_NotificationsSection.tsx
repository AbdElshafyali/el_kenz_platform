'use client';

import React from 'react';
import { Bell } from 'lucide-react';

export function AX_NotificationsSection() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6 md:p-8 space-y-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
                        <Bell size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white">إعدادات التنبيهات</h3>
                        <p className="text-zinc-500 text-sm">تحكم في كيفية وصول التحديثات إليك.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <NotificationToggle
                        title="تنبيهات الطلبات الجديدة"
                        description="تلقي إشعار فور وصول طلب جديد لمتاجرك."
                        defaultChecked={true}
                    />
                    <NotificationToggle
                        title="تحديثات المحفظة"
                        description="إشعارات عند شحن المحفظة أو سحب الرصيد."
                        defaultChecked={true}
                    />
                    <NotificationToggle
                        title="العروض والخصومات"
                        description="تلقي إشعارات عن حملات إعلانية جديدة."
                    />
                    <NotificationToggle
                        title="تنبيهات البريد الإلكتروني"
                        description="إرسال ملخص أسبوعي للنشاط على البريد."
                    />
                </div>

                <div className="pt-4 flex justify-end gap-4">
                    <button className="px-6 py-3 rounded-2xl text-zinc-500 font-black text-sm hover:bg-zinc-800 transition-all">إعادة ضبط</button>
                    <button
                        onClick={() => alert('تم حفظ إعدادات التنبيهات')}
                        className="px-8 py-3 bg-white text-black font-black rounded-2xl text-sm hover:bg-zinc-200 transition-all shadow-xl active:scale-95"
                    >حفظ التفضيلات</button>
                </div>
            </div>
        </div>
    );
}

function NotificationToggle({ title, description, defaultChecked = false }: { title: string, description: string, defaultChecked?: boolean }) {
    return (
        <div className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-2xl hover:border-zinc-700 transition-all group">
            <div className="space-y-1">
                <h4 className="text-sm font-black text-white">{title}</h4>
                <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">{description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-black"></div>
            </label>
        </div>
    );
}
