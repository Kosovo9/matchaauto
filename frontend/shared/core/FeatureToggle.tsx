"use client";

import { FEATURE_REGISTRY, isFeatureEnabled } from "./features";

/**
 * Hook to check if a feature is enabled.
 */
export function useFeature(id: string) {
    const isEnabled = isFeatureEnabled(id);
    const definition = FEATURE_REGISTRY.find(f => f.id === id);

    return {
        isEnabled,
        definition
    };
}

/**
 * Component wrapper that only renders children if a feature is enabled.
 */
export function FeatureFlag({ id, children, fallback = null }: { id: string, children: React.ReactNode, fallback?: React.ReactNode }) {
    const { isEnabled } = useFeature(id);

    if (!isEnabled) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
