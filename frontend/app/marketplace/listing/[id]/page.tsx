"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { actions } from "../../../shared/core/actions";
import { ROUTES } from "../../../shared/core/routes";

export default function MarketplaceListingPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const d = await actions.data.listing("marketplace", String(id));
                setData(d);
            } catch (e) {
                console.error("Error loading listing", e);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) return <div className="p-20 text-center animate-pulse text-[var(--fg)]">Loading Listing...</div>;
    if (!data) return <div className="p-20 text-center text-red-500">Listing not found.</div>;

    const title = data.title ?? "Listing";
    const price = Number(data.price ?? 0);
    const sellerId = data.sellerId ?? "seller-demo";

    return (
        <main className="mx-auto max-w-4xl px-6 py-20 text-[var(--fg)]">
            <button onClick={() => router.back()} className="text-sm opacity-70 hover:opacity-100 mb-8 transition-opacity">← Back to Marketplace</button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)] overflow-hidden">
                {/* Gallery Placeholder */}
                <div className="aspect-square bg-white/5 flex items-center justify-center relative">
                    <img
                        src={data.attrs?.image || `https://placehold.co/600x600/1a1a1a/FFF?text=${title.split(' ')[0]}`}
                        className="w-full h-full object-cover"
                        alt={title}
                    />
                    <div className="absolute top-4 left-4 bg-emerald-400 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">Verified Asset</div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <h1 className="text-4xl font-black mb-2">{title}</h1>

                    {/* Verified Seller Badge Integration */}
                    {(data.sellerTrustBadge === "verified" || data.seller?.trust_badge === "verified" || data.seller?.isVerified === true) ? (
                        <div className="mb-4">
                            <div className="inline-flex items-center gap-2">
                                <span className="text-xs font-medium text-white/60">Seller Verified</span>
                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-400 px-2.5 py-1 text-sm font-medium">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                    Verified
                                </span>
                            </div>
                            <div className="text-xs opacity-60 mt-1">Trusted seller — faster response, safer deals.</div>
                        </div>
                    ) : (
                        <div className="mb-4 text-xs opacity-40">Seller not verified yet.</div>
                    )}

                    <p className="text-gray-400 mb-6">{data.description || "No description provided for this high-end asset."}</p>

                    <div className="text-3xl font-black text-emerald-400 mb-8">
                        {data.currency || "MXN"} ${price.toLocaleString()}
                    </div>

                    <div className="space-y-4 pt-8 border-t border-white/10">
                        <button
                            onClick={() => {
                                actions.nav.go(router, ROUTES.cart);
                            }}
                            className="w-full py-4 rounded-2xl bg-emerald-400 text-black font-black text-sm tracking-widest hover:opacity-90 transform active:scale-95 transition-all"
                        >
                            ADD TO QUANTUM BAG
                        </button>

                        <button
                            onClick={() => actions.leads.contactSeller({ sellerId, listingId: String(id), message: "Interested" })}
                            className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-sm tracking-widest hover:bg-white/10 transition-all"
                        >
                            CONTACT SELLER
                        </button>
                    </div>

                    <div className="mt-8 flex items-center gap-2 text-xs text-white/40">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        3 matchers looking at this now
                    </div>
                </div>
            </div>
        </main>
    );
}
