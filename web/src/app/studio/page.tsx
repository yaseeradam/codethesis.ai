'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudioRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/tool/thesis');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white text-xs">
      <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/80 px-5 py-3 rounded-2xl shadow-xl">
        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span>Redirecting to 5-Chapter Thesis Generator...</span>
      </div>
    </div>
  );
}
