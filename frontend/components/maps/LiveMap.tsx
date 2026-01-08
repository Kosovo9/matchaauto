'use client';

import dynamic from 'next/dynamic';

const LiveMapContent = dynamic(() => import('./LiveMapContent'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-900 animate-pulse flex items-center justify-center text-slate-500">Initializing Satellite Uplink...</div>
});

export default function LiveMap(props: any) {
    return <LiveMapContent {...props} />;
}
