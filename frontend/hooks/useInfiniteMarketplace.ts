
"use client";
import { useEffect, useState, useCallback } from "react";
import { actions } from "../shared/core/actions";

export function useInfiniteMarketplace(filters: Record<string, any>) {
    const [items, setItems] = useState<any[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const resetKey = JSON.stringify(filters);

    const loadFirst = useCallback(async () => {
        setLoading(true);
        setErr(null);
        try {
            // Usamos el buscador RAG para el feed inicial si hay query, o search normal
            const data: any = await actions.data.search("marketplace", filters.q || "", {
                ...filters,
                limit: 12,
            });

            // Manejo de respuesta flexible (array directo o {items, nextCursor})
            const results = Array.isArray(data) ? data : (data.items || []);
            setItems(results);
            setNextCursor(data.nextCursor || null);
        } catch (e: any) {
            setErr(e.message || "Failed to load marketplace data");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const loadMore = useCallback(async () => {
        if (!nextCursor || loadingMore) return;
        setLoadingMore(true);
        try {
            const data: any = await actions.data.search("marketplace", filters.q || "", {
                ...filters,
                cursor: nextCursor,
                limit: 12,
            });
            const more = Array.isArray(data) ? data : (data.items || []);
            setItems((prev) => [...prev, ...more]);
            setNextCursor(data.nextCursor || null);
        } catch (e) {
            console.error("Failed to load more items", e);
        } finally {
            setLoadingMore(false);
        }
    }, [nextCursor, loadingMore, filters]);

    useEffect(() => {
        loadFirst();
    }, [resetKey, loadFirst]);

    return { items, nextCursor, loading, loadingMore, err, loadMore, reload: loadFirst };
}
