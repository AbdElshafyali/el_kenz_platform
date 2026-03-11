'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SECTIONS, PRESETS, PermissionsMap, mergePermissions } from './permissions';

interface Props {
    value: PermissionsMap;
    onChange: (v: PermissionsMap) => void;
    activePreset: string;
    onPresetChange: (id: string) => void;
}

export default function PermissionsEditor({ value, onChange, activePreset, onPresetChange }: Props) {
    const handlePreset = (presetId: string) => {
        onPresetChange(presetId);
        const preset = PRESETS.find(p => p.id === presetId);
        if (!preset) return;
        if (presetId === 'custom') return;
        onChange(mergePermissions({}, preset.permissions));
    };

    const toggleAction = (sectionId: string, actionId: string) => {
        onPresetChange('custom');
        const current = value[sectionId] || {};
        const updated = { ...value, [sectionId]: { ...current, [actionId]: !current[actionId] } };
        onChange(updated);
    };

    const toggleSection = (sectionId: string, allOn: boolean) => {
        onPresetChange('custom');
        const section = SECTIONS.find(s => s.id === sectionId)!;
        const updated = { ...value, [sectionId]: Object.fromEntries(section.actions.map(a => [a.id, !allOn])) };
        onChange(updated);
    };

    return (
        <div className="space-y-6 transition-colors duration-300">
            {/* Presets */}
            <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 px-2 italic opacity-60">صلاحيات سريعة مختارة بعناية</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PRESETS.map(p => (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => handlePreset(p.id)}
                            className={cn(
                                "relative flex flex-col items-start gap-1 px-4 py-4 rounded-2xl border text-right transition-all group active:scale-95 shadow-sm",
                                activePreset === p.id 
                                ? "bg-primary text-primary-foreground border-primary shadow-md" 
                                : "bg-secondary/40 border-border text-muted-foreground hover:border-primary/30 hover:bg-secondary/60"
                            )}
                        >
                            <span className="text-[11px] font-black uppercase tracking-tight">{p.label}</span>
                            <span className={cn(
                                "text-[9px] font-bold leading-tight opacity-70 italic",
                                activePreset === p.id ? "text-primary-foreground" : "text-muted-foreground/60"
                            )}>{p.desc}</span>
                            {activePreset === p.id && (
                                <span className="absolute top-3 left-3 bg-primary-foreground/20 rounded-full p-0.5">
                                    <Check size={10} />
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Granular Table */}
            <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 px-2 italic opacity-60">إدارة الصلاحيات التفصيلية</p>
                <div className="space-y-2 rounded-2xl overflow-hidden border border-border bg-secondary/10 p-2 shadow-inner">
                    {SECTIONS.map((section, si) => {
                        const sectionPerms = value[section.id] || {};
                        const allOn = section.actions.every(a => sectionPerms[a.id]);
                        return (
                            <div key={section.id} className={cn(
                                "rounded-xl border border-border/30 transition-colors",
                                si % 2 === 0 ? 'bg-secondary/20' : 'bg-background/20'
                            )}>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-3">
                                    <div className="flex items-center gap-3 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => toggleSection(section.id, allOn)}
                                            className={cn(
                                                "w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all shadow-sm active:scale-90",
                                                allOn ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-border hover:border-primary/50'
                                            )}
                                        >
                                            {allOn && <Check size={12} className="stroke-[3]" />}
                                        </button>
                                        <span className="text-[11px] font-black text-foreground w-32 shrink-0 flex items-center gap-2">
                                            <span className="text-primary">{section.icon}</span> {section.label}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 flex-wrap flex-1">
                                        {section.actions.map(action => {
                                            const active = !!sectionPerms[action.id];
                                            return (
                                                <button
                                                    key={action.id}
                                                    type="button"
                                                    onClick={() => toggleAction(section.id, action.id)}
                                                    className={cn(
                                                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black transition-all shadow-sm active:scale-95 group/btn",
                                                        active 
                                                        ? "bg-primary/10 border-primary/30 text-primary shadow-inner" 
                                                        : "bg-background border-border text-muted-foreground/60 hover:border-primary/30 hover:text-primary"
                                                    )}
                                                >
                                                    {active && <Check size={10} className="stroke-[3]" />}
                                                    {action.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

