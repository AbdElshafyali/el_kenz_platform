'use client';

import React, { useState } from 'react';
import { Tag, Plus, Edit2, ChevronRight, ChevronDown, Layers, Search, Ghost } from 'lucide-react';
import { cn } from '@/lib/utils';
import CategoryModal from './CategoryModal';
import { motion, AnimatePresence } from 'framer-motion';

interface CategoriesManagerProps {
    categories: any[];
}

export default function CategoriesManager({ categories }: CategoriesManagerProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
    const [expandedIds, setExpandedIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const toggleExpand = (id: string) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const openModal = (category: any = null) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const filteredCategories = categories.filter(c =>
        c.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const parents = filteredCategories.filter(c => !c.parent_id).sort((a, b) => a.display_order - b.display_order);
    const getChildren = (parentId: string) => categories.filter(c => c.parent_id === parentId).sort((a, b) => a.display_order - b.display_order);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20">
            {/* Header Area */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 pb-4 border-b-2 border-border/30">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-background border-2 border-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-xl shadow-primary/5 -rotate-3 hover:rotate-0 transition-all duration-500">
                        <Layers size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase leading-none">هيكلية الاقسام</h2>
                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-2 opacity-60 leading-none">تنظيم أقسام الكنز بشكل شجري متطور</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                    <div className="relative group w-full sm:w-[350px]">
                        <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                            <Search className="text-muted-foreground group-focus-within:text-primary transition-all duration-300" size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="بحث في الأقسام..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-14 bg-secondary/30 border-2 border-border/50 rounded-2xl pr-14 pl-6 outline-none focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/5 transition-all text-sm font-black text-foreground shadow-sm placeholder:text-muted-foreground/30"
                        />
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black px-10 rounded-2xl flex items-center gap-4 transition-all active:scale-95 text-xs shadow-xl shadow-primary/20 hover:shadow-primary/40 group whitespace-nowrap"
                    >
                        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                        إضافة قسم
                    </button>
                </div>
            </div>

            {/* Tree View Container */}
            <div className="bg-background border-2 border-border/50 rounded-[2.5rem] overflow-hidden shadow-xl shadow-primary/5 transition-all duration-500">
                {parents.length === 0 ? (
                    <div className="p-32 flex flex-col items-center justify-center text-center opacity-30 select-none">
                        <Ghost size={64} className="mb-6 animate-bounce-slow" />
                        <h3 className="font-black text-2xl uppercase tracking-widest">لا توجد أقسام مطابقة</h3>
                        <p className="text-xs font-black mt-2 uppercase opacity-60">حاول تغيير كلمات البحث أو أضف قسماً جديداً</p>
                    </div>
                ) : (
                    <div className="divide-y-2 divide-border/20">
                        {parents.map((parent, idx) => (
                            <CategoryRow
                                key={parent.id}
                                category={parent}
                                children={getChildren(parent.id)}
                                isExpanded={expandedIds.includes(parent.id) || !!searchQuery}
                                onToggle={() => toggleExpand(parent.id)}
                                onEdit={() => openModal(parent)}
                                openModal={openModal}
                                idx={idx}
                            />
                        ))}
                    </div>
                )}
            </div>

            <CategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                category={selectedCategory}
                allCategories={categories}
            />
        </div>
    );
}

function CategoryRow({ category, children, isExpanded, onToggle, onEdit, openModal, idx }: any) {
    const hasChildren = children.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group transition-all duration-500"
        >
            <div className={cn(
                "p-8 flex items-center justify-between transition-all duration-500 relative overflow-hidden",
                isExpanded ? 'bg-primary/5' : 'hover:bg-secondary/40'
            )}>
                {isExpanded && <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-primary rounded-l-full shadow-[0_0_15px_rgba(var(--primary),0.3)] animate-in fade-in duration-700" />}

                <div className="flex items-center gap-8 relative z-10">
                    <button
                        onClick={hasChildren ? onToggle : undefined}
                        className={cn(
                            "w-12 h-12 rounded-2xl transition-all duration-500 shadow-sm flex items-center justify-center border-2",
                            hasChildren
                                ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white"
                                : "bg-secondary text-muted-foreground/30 border-border/50 cursor-default"
                        )}
                    >
                        {isExpanded ? <ChevronDown size={22} className="animate-in fade-in" /> : <ChevronRight size={22} className="rotate-180 animate-in fade-in" />}
                    </button>

                    <div className="w-16 h-16 bg-background rounded-3xl flex items-center justify-center border-2 border-border group-hover:border-primary/30 transition-all duration-700 shadow-inner p-1">
                        <div className="w-full h-full bg-secondary/30 rounded-[1.2rem] flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                            <Tag size={24} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-black text-foreground tracking-tighter group-hover:text-primary transition-colors duration-500 uppercase leading-none">{category.name_ar}</h3>
                        <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-2 px-3 py-1 bg-background border border-border/50 rounded-xl shadow-sm">
                                <span className="text-[9px] font-black text-muted-foreground uppercase opacity-40">الترتيب:</span>
                                <span className="text-[10px] font-black text-primary uppercase">{category.display_order}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-background border border-border/50 rounded-xl shadow-sm">
                                <span className="text-[9px] font-black text-muted-foreground uppercase opacity-40">المسار:</span>
                                <span className="text-[10px] font-black text-foreground/60 italic lowercase tracking-tight">/{category.slug}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 relative z-10 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                    <button
                        onClick={onEdit}
                        className="h-14 px-8 text-[11px] font-black uppercase tracking-widest text-primary hover:text-white bg-primary/5 hover:bg-primary border-2 border-primary/10 hover:border-primary rounded-2xl transition-all shadow-sm active:scale-95"
                    >
                        تعديل البيانات
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && hasChildren && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-secondary/10 border-t border-border/30 pr-24 overflow-hidden"
                    >
                        <div className="divide-y-2 divide-border/10 py-4">
                            {children.map((child: any, cidx: number) => (
                                <motion.div
                                    key={child.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: cidx * 0.05 }}
                                    className="p-6 flex items-center justify-between hover:bg-background/80 transition-all duration-500 group/child rounded-[1.5rem] my-2 mx-4 border border-transparent hover:border-border/50 hover:shadow-2xl hover:shadow-primary/5"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-10 h-10 rounded-xl bg-background border border-border/50 flex items-center justify-center text-muted-foreground/20 group-hover/child:text-primary/40 group-hover/child:border-primary/20 transition-all duration-500">
                                            <Tag size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="text-base font-black text-muted-foreground/80 group-hover/child:text-foreground transition-all duration-500 uppercase tracking-tight leading-none">{child.name_ar}</h4>
                                            <p className="text-[9px] font-black text-muted-foreground opacity-30 mt-2 uppercase tracking-widest leading-none">تـصنيف فرعي</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 opacity-0 group-hover/child:opacity-100 transition-all duration-500 translate-x-5 group-hover/child:translate-x-0">
                                        <button
                                            onClick={() => openModal(child)}
                                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-background border border-border hover:border-primary hover:text-primary transition-all active:scale-90"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
