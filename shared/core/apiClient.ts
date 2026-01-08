
function baseUrl() {
    if (typeof window !== "undefined") {
        return window.location.origin.includes("localhost")
            ? "http://localhost:3000"
            : process.env.NEXT_PUBLIC_API_BASE_URL || "";
    }
    return process.env.API_BASE_URL || "http://localhost:3000";
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const url = baseUrl() + (path.startsWith("/") ? path : `/${path}`);
    const res = await fetch(url, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers || {}),
        },
    });

    if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText} @ ${path}`);
    }

    return res.json();
}
