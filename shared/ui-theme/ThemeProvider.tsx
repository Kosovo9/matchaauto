"use client";
import React from "react";
import { themes, ThemeKey } from "./themes";

export function ThemeProvider({
    theme,
    children,
}: {
    theme: ThemeKey;
    children: React.ReactNode;
}) {
    const t = themes[theme];

    const style = {
        ["--bg" as any]: t.bg,
        ["--fg" as any]: t.fg,
        ["--primary" as any]: t.primary,
        ["--primary-fg" as any]: t.primaryFg,
        ["--card" as any]: t.card,
        ["--border" as any]: t.border,
        ["--shadow" as any]: t.shadow,
        ["--hero-glow" as any]: t.heroGlow,
    } as React.CSSProperties;

    return (
        <div style={style} className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
            {/* glow de lujo, barato y efectivo */}
            <div className="pointer-events-none fixed inset-0 -z-10 opacity-100" style={{ background: "var(--hero-glow)" }} />
            {children}
        </div>
    );
}
