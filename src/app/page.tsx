import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background text-primary relative overflow-hidden transition-colors duration-300">
      {/* تأثير الإضاءة الخلفية */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full" />

      <div className="relative z-10 text-center space-y-6">
        <div className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium tracking-wide mb-4">
          تطور اللوجستيات
        </div>
        <h1 className="text-7xl font-black tracking-tighter leading-none text-foreground">
          منصة <span className="text-primary italic">الكنز ستور</span>
        </h1>
        <p className="text-muted-foreground text-xl max-w-lg mx-auto leading-relaxed">
          النظام المتطور لإدارة العمليات والتجارة <br />
          لمنصة <span className="text-primary font-bold uppercase tracking-widest text-2xl">الكنز</span>.
        </p>
        <div className="pt-10 flex gap-6 justify-center transition-all">
          <Link href="/login" className="px-8 py-4 bg-primary text-primary-foreground font-extrabold rounded-xl hover:bg-primary/90 hover:scale-105 transition-all shadow-xl shadow-primary/20">
            دخول لوحة التحكم
          </Link>
          <button className="px-8 py-4 border border-border text-foreground font-semibold rounded-xl hover:bg-secondary transition-all">
            حالة المنصة
          </button>
        </div>
      </div>

      <footer className="absolute bottom-8 text-muted-foreground text-sm font-medium tracking-widest uppercase">
        © 2026 AXONID CORE • الكنز ستور
      </footer>
    </main>
  );
}

