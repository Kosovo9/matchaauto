"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { actions, Domain } from "../../shared/core/actions";
import { ROUTES } from "../../shared/core/routes";

type Tab = "cars" | "parts" | "services";
type Mode = "rent" | "buy";

const TAB_TO_QUERY: Record<Tab, string> = {
    cars: "cars",
    parts: "parts",
    services: "services",
};

export default function HeroAuto() {
    const router = useRouter();
    const [tab, setTab] = useState<Tab>("cars");
    const [mode, setMode] = useState<Mode>("buy");
    const [q, setQ] = useState("Tesla");
    const [loading, setLoading] = useState(false);

    const domain: Domain = "auto";

    const placeholder = useMemo(() => {
        if (tab === "cars") return "Busca Tesla, BMW, camionetas…";
        if (tab === "parts") return "Busca motor, llantas, frenos…";
        return "Busca grúa, mecánico, detailing…";
    }, [tab]);

    const onSearch = async () => {
        // P0: Navegación + query params. (Si ya renderizas resultados server-side, esto es perfecto.)
        const qp = new URLSearchParams();
        qp.set("q", q.trim() || "");
        qp.set("tab", TAB_TO_QUERY[tab]);
        qp.set("mode", mode);
        router.push(`${ROUTES.auto}?${qp.toString()}`);
    };

    const onQuickBuy = async (listingId?: string) => {
        // P0: si no hay listingId, manda a marketplace de autos o a /auto con query.
        if (!listingId) return onSearch();

        try {
            setLoading(true);
            await actions.checkout.quickBuy(listingId, domain);
            router.push(ROUTES.checkout);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="relative mx-auto max-w-6xl px-6 pt-14 pb-10">
            {/* background glow */}
            <div className="pointer-events-none absolute inset-0 -z-10 opacity-70 blur-2xl"
                style={{ background: "radial-gradient(900px circle at 20% 10%, rgba(16,185,129,0.18), transparent 55%), radial-gradient(900px circle at 80% 30%, rgba(59,130,246,0.14), transparent 60%)" }}
            />

            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white/5 ring-1 ring-white/10 grid place-items-center">
                        <span className="text-xl">⚡</span>
                    </div>
                    <div className="font-semibold tracking-wide text-white">MatchaAuto</div>
                </div>

                <div className="hidden md:flex items-center gap-3 rounded-full bg-black/30 px-4 py-2 ring-1 ring-white/10 backdrop-blur">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-xs text-white/80">LIVE:</span>
                    <span className="text-xs font-semibold text-white">8,432</span>
                    <span className="text-xs text-white/60">Active Matchers</span>
                </div>

                <div className="flex items-center gap-2 rounded-full bg-black/30 px-3 py-2 ring-1 ring-white/10 backdrop-blur">
                    <span className="text-xs text-white/80">ES / EN / PT</span>
                </div>
            </div>

            <div className="mt-10 text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow">
                    Muévete a la velocidad <br className="hidden md:block" /> del pensamiento.
                </h1>

                <div className="mt-8 mx-auto max-w-3xl rounded-3xl bg-black/25 ring-1 ring-white/10 backdrop-blur p-4">
                    {/* Tabs */}
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => setTab("cars")}
                            className={`px-6 py-3 rounded-full text-xs font-black tracking-widest ring-1 ring-white/10 transition-colors ${tab === "cars" ? "bg-white/10 text-white" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            🚗 CARS
                        </button>
                        <button
                            onClick={() => setTab("parts")}
                            className={`px-6 py-3 rounded-full text-xs font-black tracking-widest ring-1 ring-white/10 transition-colors ${tab === "parts" ? "bg-white/10 text-white" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            ⚙️ PARTS
                        </button>
                        <button
                            onClick={() => setTab("services")}
                            className={`px-6 py-3 rounded-full text-xs font-black tracking-widest ring-1 ring-white/10 transition-colors ${tab === "services" ? "bg-white/10 text-white" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            🛠️ SERVICES
                        </button>
                    </div>

                    {/* Mode */}
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-white/70">
                        <span>RENT</span>
                        <button
                            onClick={() => setMode(mode === "rent" ? "buy" : "rent")}
                            className="relative h-7 w-14 rounded-full bg-white/10 ring-1 ring-white/10"
                            aria-label="Toggle rent/buy"
                        >
                            <span
                                className={`absolute top-1 h-5 w-6 rounded-full bg-amber-400 transition-all ${mode === "buy" ? "left-7" : "left-1"
                                    }`}
                            />
                        </button>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${mode === "buy" ? "bg-amber-400 text-black" : "bg-white/10 text-white/70"}`}>
                            BUY
                        </span>
                    </div>

                    {/* Search */}
                    <div className="mt-5 flex items-center gap-3 rounded-full bg-white/5 ring-1 ring-white/10 px-4 py-3">
                        <span className="text-white/60">🔎</span>
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && onSearch()}
                            placeholder={placeholder}
                            className="w-full bg-transparent outline-none text-white placeholder:text-white/40"
                        />
                        <button
                            onClick={onSearch}
                            className="px-5 py-2 rounded-full bg-white text-black font-black text-xs tracking-widest hover:opacity-90"
                        >
                            SEARCH
                        </button>
                    </div>

                    {/* Featured cards placeholder hook */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {["Tesla Model S Plaid", "Porsche Taycan Turbo S", "Ferrari 296 GTB", "Lucid Air Sapphire"].map((title, i) => (
                            <div key={title} className="rounded-2xl bg-white/5 ring-1 ring-white/10 overflow-hidden text-left hover:ring-white/30 transition-shadow group">
                                <div className="h-28 bg-gradient-to-b from-white/10 to-transparent flex items-center justify-center">
                                    <div className="text-4xl opacity-20 transition-transform group-hover:scale-110">🚗</div>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-semibold text-white truncate mr-2">{title}</div>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-black font-black whitespace-nowrap">Hot/New</span>
                                    </div>
                                    <div className="mt-2 text-white/70 text-xs">$ 000,000</div>
                                    <button
                                        disabled={loading}
                                        onClick={() => onQuickBuy(`demo-${i}`)}
                                        className="mt-3 w-full rounded-xl bg-amber-400 text-black font-black py-2 text-xs tracking-widest hover:bg-amber-300 transition-colors disabled:opacity-60"
                                    >
                                        ⚡ Quick-Buy
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 text-center text-[11px] text-white/50">
                        P0: Quick-Buy navega a Checkout. P1: Quick-Buy crea orden real con listingId real.
                    </div>
                </div>
            </div>
        </section>
    );
}
