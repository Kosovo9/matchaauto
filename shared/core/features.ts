// shared/core/features.ts
export interface FeatureDefinition {
    id: string;
    name: string;
    domain: 'auto' | 'marketplace' | 'assets' | 'common';
    status: 'alpha' | 'beta' | 'stable';
    description: string;
    enabled: boolean;
}

export const FEATURE_REGISTRY: FeatureDefinition[] = [
    {
        id: 'F-IMG-ZOOM',
        name: 'Hyper-Zoom Media',
        domain: 'common',
        status: 'stable',
        description: 'Ultra-high resolution image and video zoom for detailed product inspection.',
        enabled: true,
    },
    {
        id: 'F-GEO-NEARBY',
        name: 'Intent-Based Spatial Match',
        domain: 'common',
        status: 'beta',
        description: 'Advanced geolocalization and nearby search with real-time distance matrix.',
        enabled: true,
    },
    {
        id: 'F-AR-PASS',
        name: 'AR Passive Viewer',
        domain: 'common',
        status: 'alpha',
        description: 'Passive augmented reality viewer for 3D model interaction without dedicated apps.',
        enabled: true,
    }
];
