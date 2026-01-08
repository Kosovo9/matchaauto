export const themes = {
    marketplace: { // Sub-proyecto #2: Global Marketplace @
        name: "Global Marketplace @",
        bg: "#ffffff",
        fg: "#0b1220",
        primary: "#10b981",      // emerald
        primaryFg: "#ffffff",
        card: "rgba(255,255,255,0.78)",
        border: "rgba(16,185,129,0.22)",
        shadow: "0 18px 60px rgba(16,185,129,0.18)",
        heroGlow: "radial-gradient(800px circle at 15% 15%, rgba(16,185,129,0.20), transparent 60%)",
    },

    assets: { // Sub-proyecto #3: World Assets Exchange
        name: "World Assets Exchange",
        bg: "#0b0f14",
        fg: "#f5f5f5",
        primary: "#f59e0b",      // amber/gold
        primaryFg: "#0b0f14",
        card: "rgba(14,16,20,0.62)",
        border: "rgba(245,158,11,0.22)",
        shadow: "0 20px 70px rgba(245,158,11,0.14)",
        heroGlow: "radial-gradient(900px circle at 20% 20%, rgba(245,158,11,0.16), transparent 60%)",
    },
} as const;

export type ThemeKey = keyof typeof themes;
