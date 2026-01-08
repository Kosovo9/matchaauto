import type { ThemeKey } from "./themes";

// Usa heurística por ruta/host/carpeta.
// Ajusta según cómo montes cada sub-app.
export function themeFromPath(pathname: string): ThemeKey {
    const p = (pathname || "").toLowerCase();
    if (p.startsWith("/assets") || p.includes("assets")) return "assets";
    // default: marketplace
    return "marketplace";
}
