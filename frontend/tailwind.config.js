/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // 🏎️ CARS THEME (CYBER BLUE)
                cyber: {
                    blue: "#009EE3",
                    orange: "#FF9500",
                    deep: "#003087",
                },
                // 🏠 REAL ESTATE THEME (LUXURY GOLD)
                luxury: {
                    gold: "#D4AF37",
                    black: "#050505",
                },
                // 📦 MARKETPLACE THEME (MATCHA GREEN)
                matcha: {
                    green: "#39FF14",
                    white: "#FFFFFF",
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
                mono: ["Space Grotesk", "monospace"],
            },
            animation: {
                "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
            keyframes: {
                "pulse-glow": {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0.5" },
                },
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
