'use client';

import dynamic from 'next/dynamic';

const AppWithNoSSR = dynamic(() => import('@/App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex items-center justify-center font-sans">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Loading MidRoll Protocol...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return <AppWithNoSSR />;
}
