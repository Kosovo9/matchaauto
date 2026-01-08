export default function MarketplaceSkeleton() {
    return (
        <div className="rounded-2xl overflow-hidden ring-1 ring-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)]">
            <div className="h-40 bg-white/10 animate-pulse" />
            <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 bg-white/10 animate-pulse rounded" />
                <div className="h-3 w-1/3 bg-white/10 animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-white/10 animate-pulse rounded" />
            </div>
        </div>
    );
}
