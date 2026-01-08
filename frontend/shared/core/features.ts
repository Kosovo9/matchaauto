
export type FeatureStatus = 'stable' | 'beta' | 'disabled';

export interface FeatureDefinition {
    id: string;
    name: string;
    domain: 'auto' | 'marketplace' | 'assets' | 'common';
    status: FeatureStatus;
    description: string;
}

export const FEATURE_REGISTRY: FeatureDefinition[] = [
    // Core
    { id: 'auth.auth0', name: 'Auth0 Integration', domain: 'common', status: 'stable', description: 'Unified authentication system.' },
    { id: 'rag.search', name: 'RAG Smart Search', domain: 'common', status: 'beta', description: 'Vector-based intelligent search.' },

    // Auto
    { id: 'auto.vin_decoder', name: 'VIN Decoder', domain: 'auto', status: 'disabled', description: 'Automated vehicle data from VIN.' },
    { id: 'auto.plate_ocr', name: 'Plate OCR', domain: 'auto', status: 'disabled', description: 'Detect vehicle plate from image.' },

    // Assets
    { id: 'assets.map_libre', name: 'MapLibre Real Maps', domain: 'assets', status: 'beta', description: 'High-performance interactive maps.' },
    { id: 'assets.vr_tour', name: 'VR 360 Tours', domain: 'assets', status: 'disabled', description: 'Virtual reality interior tours.' },

    // Marketplace
    { id: 'market.infinite_scroll', name: 'Infinite Scroll', domain: 'marketplace', status: 'stable', description: 'Smooth feed pagination.' },
    { id: 'market.moderation', name: 'AI Moderation', domain: 'marketplace', status: 'disabled', description: 'Auto-scan for illicit content.' },

    // Social/Communication
    { id: 'comm.messaging', name: 'Quantum Messaging', domain: 'common', status: 'disabled', description: 'Real-time trader chat.' },
];

export const isFeatureEnabled = (id: string): boolean => {
    const feature = FEATURE_REGISTRY.find(f => f.id === id);
    if (!feature) return false;

    // En desarrollo local, permitimos betas. En prod, solo stable.
    const isProd = process.env.NODE_ENV === 'production';
    if (feature.status === 'disabled') return false;
    if (isProd && feature.status === 'beta') return false;

    return true;
};
