'use client';

import dynamic from 'next/dynamic';

const AppWithNoSSR = dynamic(() => import('@/App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#f8faf7] text-[#17211b] flex items-center justify-center font-sans">
      <div className="text-center space-y-4 animate-pulse">
        <div className="w-12 h-12 rounded-2xl bg-[#17211b] border border-[#dfe5df] shadow-lg flex items-center justify-center mx-auto relative">
          <div className="w-3 h-3 rounded-full bg-[#d7ff65] animate-ping absolute" />
          <div className="w-3 h-3 rounded-full bg-[#d7ff65]" />
        </div>
        <div>
          <h3 className="font-extrabold text-lg tracking-tight text-[#17211b]">Midroll Protocol</h3>
          <p className="text-[11px] text-[#718077] uppercase tracking-widest font-mono mt-1">
            Loading Zero-Knowledge Workspace...
          </p>
        </div>
      </div>
    </div>
  ),
});

export default function Home() {
  return <AppWithNoSSR />;
}
