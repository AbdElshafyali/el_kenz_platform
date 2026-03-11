import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="w-full h-[calc(100vh-80px)] flex flex-col items-center justify-center p-8 overflow-hidden">
            <div className="relative">
                <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full animate-pulse" />
                <Loader2 className="w-12 h-12 text-amber-500 animate-spin relative z-10" />
            </div>
            <p className="mt-4 text-xs font-bold text-amber-500/70 tracking-widest uppercase animate-pulse">جاري التحميل...</p>
        </div>
    );
}
