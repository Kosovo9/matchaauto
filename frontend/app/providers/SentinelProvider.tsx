'use client';

import { createContext, useContext, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface SentinelContextType {
    logEvent: (event: SentinelEvent) => void;
    getTraceId: () => string;
}

interface SentinelEvent {
    type: 'page_view' | 'api_call' | 'user_action' | 'error';
    action: string;
    metadata?: Record<string, any>;
    severity?: 'low' | 'medium' | 'high' | 'critical';
}

const SentinelContext = createContext<SentinelContextType | undefined>(undefined);

export function SentinelProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Generate a unique trace ID for this session
    const generateTraceId = (): string => {
        if (typeof window === 'undefined') return '';

        const sessionId = sessionStorage.getItem('sentinel_session_id') ||
            `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('sentinel_session_id', sessionId);

        return `${sessionId}_${Date.now()}`;
    };

    // Log events to Sentinel-X backend
    const logEvent = async (event: SentinelEvent) => {
        try {
            const traceId = generateTraceId();

            await fetch('/api/sentinel/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Trace-ID': traceId,
                },
                body: JSON.stringify({
                    ...event,
                    timestamp: new Date().toISOString(),
                    path: pathname,
                    userAgent: navigator.userAgent,
                    referrer: document.referrer,
                }),
            });
        } catch (error) {
            console.error('Failed to log Sentinel event:', error);
        }
    };

    // Track page views
    useEffect(() => {
        logEvent({
            type: 'page_view',
            action: `view_${pathname}`,
            metadata: {
                searchParams: Object.fromEntries(searchParams.entries()),
            },
            severity: 'low',
        });
    }, [pathname, searchParams]);

    // Error boundary for global errors
    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            logEvent({
                type: 'error',
                action: 'client_error',
                metadata: {
                    message: event.message,
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    error: event.error?.toString(),
                },
                severity: 'high',
            });
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            logEvent({
                type: 'error',
                action: 'unhandled_rejection',
                metadata: {
                    reason: event.reason?.toString(),
                },
                severity: 'high',
            });
        };

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, []);

    const value = {
        logEvent,
        getTraceId: generateTraceId,
    };

    return (
        <SentinelContext.Provider value={value}>
            {children}
        </SentinelContext.Provider>
    );
}

export const useSentinel = () => {
    const context = useContext(SentinelContext);
    if (context === undefined) {
        throw new Error('useSentinel must be used within a SentinelProvider');
    }
    return context;
};
