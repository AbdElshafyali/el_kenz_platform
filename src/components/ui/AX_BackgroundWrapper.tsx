'use client';

import dynamic from 'next/dynamic';

const AX_AnimatedBackground = dynamic(() => import('./AX_AnimatedBackground'), {
    ssr: false,
});

export default function AX_BackgroundWrapper() {
    return <AX_AnimatedBackground />;
}
