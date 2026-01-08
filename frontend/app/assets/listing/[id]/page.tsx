"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { actions } from "../../../shared/core/actions";
import { ROUTES } from "../../../shared/core/routes";
import { MapPin, ShieldCheck, Share2 } from "lucide-react";

export default function AssetsListingPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const d = await actions.data.listing("assets", String(id));
                setData(d);
            } catch (e) {
                console.error("Error loading listing", e);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) return <div className="p-20 text-center animate-pulse text-[var(--fg)]">Accessing property records...</div>;
    if (!data) return <div className="p-20 text-center text-red-500">Asset records not found.</div>;

    const title = data.title ?? "Property";
    const price = Number(data.price ?? 0);
    const sellerId = data.sellerId ?? "seller-demo";

    return (
        <main className="mx-auto max-w-6xl px-6 py-10 text-[var(--fg)]">
            <div className="flex justify-between items-center mb-8">
                <button onClick={() => router.back()} className="text-sm opacity-70 hover:opacity-100 flex items-center gap-2 transition-opacity">
                    ← Return to Map
                </button>
                <div className="flex gap-4">
                    <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"><Share2 size={18} /></button>
                    <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-amber-400"><ShieldCheck size={18} /></button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left: Gallery & Map Context */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="aspect-[16/9] bg-white/5 rounded-3xl overflow-hidden border border-[var(--border)] relative">
                        <img
                            src={data.attrs?.image || `https://placehold.co/1200x800/1a1a1a/FFF?text=${title.split(' ')[0]}`}
                            className="w-full h-full object-cover"
                            alt={title}
                        />
                        <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
                            <MapPin size={14} className="text-amber-400" />
                            <span className="text-xs font-bold">{data.city || "Beverly Hills"}, {data.state || "CA"}</span>
                        </div>
                    </div>

                    <div className="p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow)]">
                        <h2 className="text-sm font-black text-amber-400 tracking-widest uppercase mb-4">Description</h2>
                        <p className="text-lg leading-relaxed opacity-80">{data.description || "Luxurious property with bespoke architecture and unparalleled views. Part of the exclusive World Assets collection."}</p>

                        <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-white/10">
                            <div>
                                <div className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">Area</div>
                                <div className="text-xl font-bold">450 m²</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">Status</div>
                                <div className="text-xl font-bold text-emerald-400">Available</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">Type</div>
                                <div className="text-xl font-bold">Residential</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Pricing & Contact */}
                <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
                    <div className="p-8 rounded-3xl bg-black border border-[var(--border)] shadow-2xl space-y-8">
                        <div>
                            <div className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-2">Asking Price</div>
                            <div className="text-5xl font-black text-[var(--primary)]">
                                {data.currency || "USD"} ${price.toLocaleString()}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={() => actions.leads.contactSeller({ sellerId, listingId: String(id), message: "Interested in property" })}
                                className="w-full py-4 rounded-2xl bg-amber-400 text-black font-black text-sm tracking-widest hover:bg-amber-300 transform active:scale-95 transition-all shadow-[0_0_20px_rgba(251,191,36,0.2)]"
                            >
                                CONTACT AGENT
                            </button>
                            <button
                                className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-sm tracking-widest hover:bg-white/10 transition-all"
                            >
                                SCHEDULE VIEWING
                            </button>
                        </div>

                        <div className="pt-6 border-t border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white/10"></div>
                                <div>
                                    <div className="text-sm font-bold">Quantum Brokerage</div>
                                    <div className="text-[10px] text-white/40">Verified Partner since 2024</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
