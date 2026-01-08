"use client";
import { useRouter } from "next/navigation";
import { ROUTES } from "../../shared/core/routes";

export type MarketplaceListing = {
    id: string;
    title: string;
    price: number;
    currency?: "MXN" | "USD";
    image?: string;
    badge?: "Verified" | "Hot" | "New";
    sellerId?: string;
};

export default function MarketplaceCard({ item }: { item: MarketplaceListing }) {
    const router = useRouter();

    const badge = item.badge || "Verified";
    const badgeClass =
        badge === "Verified"
            ? "bg-emerald-400 text-black"
            : badge === "Hot"
                ? "bg-amber-400 text-black"
                : "bg-white/20 text-white";

    return (
        <button
            onClick={() => router.push(ROUTES.listing("marketplace", item.id))}
            className="w-full text-left rounded-2xl overflow-hidden ring-1 ring-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] backdrop-blur-xl hover:translate-y-[-2px] transition"
        >
            <div className="relative h-40 bg-gradient-to-b from-black/10 to-transparent">
                <div className="absolute top-3 left-3 z-10">
                    <span className={`${badgeClass} text-[10px] px-2 py-1 rounded-full font-black tracking-widest uppercase`}>{badge}</span>
                </div>

                {/* image */}
                <div className="absolute inset-0">
                    {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt={item.title} className="h-full w-full object-cover opacity-90" />
                    ) : (
                        <div className="h-full w-full bg-white/10" />
                    )}
                </div>
            </div>

            <div className="p-4">
                <div className="text-sm font-semibold text-[var(--fg)] line-clamp-2">{item.title}</div>
                <div className="mt-2 text-xs opacity-80 text-[var(--fg)]">
                    {(item.currency || "MXN")} ${item.price?.toLocaleString?.() ?? item.price}
                </div>
                <div className="mt-3 text-[11px] opacity-60 text-[var(--fg)]">Tap to view • Secure checkout ready</div>
            </div>
        </button>
    );
}
