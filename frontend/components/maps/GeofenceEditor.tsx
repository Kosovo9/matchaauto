'use client';

import dynamic from 'next/dynamic';

const GeofenceEditorContent = dynamic(() => import('./GeofenceEditorContent'), {
    ssr: false
});

export default function GeofenceEditor(props: any) {
    return <GeofenceEditorContent {...props} />;
}
