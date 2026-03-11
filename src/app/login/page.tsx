import { LoginForm } from '@/features/auth/components/LoginForm';

export default function LoginPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
            {/* عناصر خلفية زخرفية */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 w-full flex flex-col items-center">
                <div className="mb-8 text-center">
                    <h1 className="text-5xl font-black tracking-tighter text-white">
                        الكنز<span className="text-amber-500">.</span>
                    </h1>
                </div>
                <LoginForm />
            </div>
        </main>
    );
}
