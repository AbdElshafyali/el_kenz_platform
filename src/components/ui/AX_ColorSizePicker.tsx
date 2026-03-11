'use client';

import React, { useState } from 'react';
import { Plus, X, Check, Palette, Ruler } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRESET_COLORS = [
    { hex: '#000000', label: 'أسود' },
    { hex: '#FFFFFF', label: 'أبيض' },
    { hex: '#ef4444', label: 'أحمر' },
    { hex: '#f97316', label: 'برتقالي' },
    { hex: '#eab308', label: 'أصفر' },
    { hex: '#22c55e', label: 'أخضر' },
    { hex: '#3b82f6', label: 'أزرق' },
    { hex: '#8b5cf6', label: 'بنفسجي' },
    { hex: '#ec4899', label: 'وردي' },
    { hex: '#14b8a6', label: 'تركوازي' },
    { hex: '#f59e0b', label: 'ذهبي' },
    { hex: '#6b7280', label: 'رمادي' },
    { hex: '#92400e', label: 'بني' },
    { hex: '#1e293b', label: 'نيفي' },
    { hex: '#fde68a', label: 'كريم' },
    { hex: '#fca5a5', label: 'سلموني' },
];

interface ColorEntry {
    hex: string;
    label: string;
    available: boolean;
}

interface SizeEntry {
    label: string;
    available: boolean;
}

interface AX_ColorSizePickerProps {
    colors: ColorEntry[];
    sizes: SizeEntry[];
    onColorsChange: (colors: ColorEntry[]) => void;
    onSizesChange: (sizes: SizeEntry[]) => void;
}

export const AX_ColorSizePicker = ({ colors, sizes, onColorsChange, onSizesChange }: AX_ColorSizePickerProps) => {
    const [customHex, setCustomHex] = useState('#000000');
    const [customLabel, setCustomLabel] = useState('');
    const [newSize, setNewSize] = useState('');

    const toggleColor = (hex: string, label: string) => {
        const exists = colors.find(c => c.hex === hex);
        if (exists) {
            onColorsChange(colors.filter(c => c.hex !== hex));
        } else {
            onColorsChange([...colors, { hex, label, available: true }]);
        }
    };

    const toggleColorAvailability = (hex: string) => {
        onColorsChange(colors.map(c => c.hex === hex ? { ...c, available: !c.available } : c));
    };

    const addCustomColor = () => {
        if (!customLabel.trim()) return;
        if (colors.find(c => c.hex === customHex)) return;
        onColorsChange([...colors, { hex: customHex, label: customLabel.trim(), available: true }]);
        setCustomLabel('');
    };

    const addSize = () => {
        const label = newSize.trim().toUpperCase();
        if (!label) return;
        if (sizes.find(s => s.label === label)) return;
        onSizesChange([...sizes, { label, available: true }]);
        setNewSize('');
    };

    const removeSize = (label: string) => {
        onSizesChange(sizes.filter(s => s.label !== label));
    };

    const toggleSizeAvailability = (label: string) => {
        onSizesChange(sizes.map(s => s.label === label ? { ...s, available: !s.available } : s));
    };

    return (
        <div className="space-y-8">

            {/* --- Colors Section --- */}
            <div className="p-6 rounded-[2rem] bg-secondary/20 border border-border/50 space-y-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20">
                        <Palette size={18} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-foreground uppercase tracking-tight">ألوان المنتج</h4>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">اختر الألوان المتاحة — اضغط مرة ثانية لتعطيلها</p>
                    </div>
                </div>

                {/* Preset Colors */}
                <div className="flex flex-wrap gap-3">
                    {PRESET_COLORS.map(({ hex, label }) => {
                        const selected = colors.find(c => c.hex === hex);
                        const isAvailable = selected?.available ?? true;
                        return (
                            <button
                                key={hex}
                                type="button"
                                title={label}
                                onClick={() => selected ? toggleColorAvailability(hex) : toggleColor(hex, label)}
                                onDoubleClick={() => toggleColor(hex, label)}
                                className={cn(
                                    "relative w-10 h-10 rounded-full border-4 transition-all duration-300 shadow-sm group",
                                    selected
                                        ? isAvailable
                                            ? "border-primary scale-110 shadow-lg shadow-primary/30 ring-2 ring-primary/20"
                                            : "border-muted-foreground/30 scale-100 opacity-40"
                                        : "border-border hover:scale-110 hover:border-primary/50"
                                )}
                                style={{ backgroundColor: hex }}
                            >
                                {selected && isAvailable && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Check size={14} className={cn("font-black", hex === '#FFFFFF' || hex === '#fde68a' || hex === '#fca5a5' ? "text-black" : "text-white")} strokeWidth={3} />
                                    </div>
                                )}
                                {selected && !isAvailable && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <X size={14} className={cn("font-black", hex === '#FFFFFF' ? "text-black" : "text-white/80")} strokeWidth={3} />
                                    </div>
                                )}
                                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[8px] font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border rounded px-1.5 py-0.5 pointer-events-none shadow-sm z-10">
                                    {label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Custom Color */}
                <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                    <input
                        type="color"
                        value={customHex}
                        onChange={e => setCustomHex(e.target.value)}
                        className="w-12 h-12 rounded-2xl border-2 border-border cursor-pointer bg-transparent p-1"
                    />
                    <input
                        type="text"
                        value={customLabel}
                        onChange={e => setCustomLabel(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomColor())}
                        placeholder="اسم اللون المخصص..."
                        className="flex-1 bg-background border border-border rounded-2xl px-5 py-3 text-sm font-black text-foreground outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/30"
                    />
                    <button
                        type="button"
                        onClick={addCustomColor}
                        className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                {/* Selected Colors Preview */}
                {colors.length > 0 && (
                    <div className="pt-3 border-t border-border/30">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-3 opacity-60">الألوان المحددة:</p>
                        <div className="flex flex-wrap gap-2">
                            {colors.map(c => (
                                <div key={c.hex} className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black transition-all",
                                    c.available ? "border-primary/30 bg-primary/5 text-foreground" : "border-border bg-secondary/30 text-muted-foreground opacity-50 line-through"
                                )}>
                                    <div className="w-4 h-4 rounded-full border border-border/50" style={{ backgroundColor: c.hex }} />
                                    {c.label}
                                    <button type="button" onClick={() => toggleColor(c.hex, c.label)}>
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* --- Sizes Section --- */}
            <div className="p-6 rounded-[2rem] bg-secondary/20 border border-border/50 space-y-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-500 border border-sky-500/20">
                        <Ruler size={18} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-foreground uppercase tracking-tight">مقاسات المنتج</h4>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">اضغط على المقاس لتعطيله — دبل كليك للحذف</p>
                    </div>
                </div>

                {/* Sizes Input */}
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={newSize}
                        onChange={e => setNewSize(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSize())}
                        placeholder="مثلاً: S أو M أو 42 أو XL..."
                        className="flex-1 bg-background border border-border rounded-2xl px-5 py-3 text-sm font-black text-foreground outline-none focus:border-sky-500/50 transition-all placeholder:text-muted-foreground/30 uppercase"
                    />
                    <button
                        type="button"
                        onClick={addSize}
                        className="p-3 rounded-2xl bg-sky-500/10 text-sky-500 border border-sky-500/20 hover:bg-sky-500 hover:text-white transition-all"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                {/* Quick Size Presets */}
                <div className="flex flex-wrap gap-2">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', '38', '39', '40', '41', '42', '43', '44'].map(preset => {
                        const exists = sizes.find(s => s.label === preset);
                        return (
                            <button
                                key={preset}
                                type="button"
                                onClick={() => exists ? toggleSizeAvailability(preset) : onSizesChange([...sizes, { label: preset, available: true }])}
                                onDoubleClick={() => removeSize(preset)}
                                className={cn(
                                    "min-w-[44px] h-10 px-3 rounded-xl border-2 text-[11px] font-black transition-all duration-200",
                                    exists
                                        ? exists.available
                                            ? "border-sky-500 bg-sky-500/10 text-sky-600 scale-105 shadow-md shadow-sky-500/20"
                                            : "border-muted-foreground/20 bg-secondary/30 text-muted-foreground opacity-40"
                                        : "border-border text-muted-foreground hover:border-sky-500/40 hover:text-sky-500 hover:scale-105"
                                )}
                            >
                                {preset}
                            </button>
                        );
                    })}
                </div>

                {/* Selected Sizes Preview */}
                {sizes.length > 0 && (
                    <div className="pt-3 border-t border-border/30">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-3 opacity-60">المقاسات المحددة:</p>
                        <div className="flex flex-wrap gap-2">
                            {sizes.map(s => (
                                <div key={s.label} className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black transition-all",
                                    s.available ? "border-sky-500/30 bg-sky-500/5 text-foreground" : "border-border bg-secondary/30 text-muted-foreground opacity-50 line-through"
                                )}>
                                    {s.label}
                                    <button type="button" onClick={() => removeSize(s.label)}>
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
