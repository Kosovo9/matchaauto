function baseUrl() {
    return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const url = baseUrl() + (path.startsWith("/") ? path : `/${path}`);
    const res = await fetch(url, {
        ...init,
        headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API ${res.status} ${res.statusText} @ ${path} :: ${text.slice(0, 200)}`);
    }

    return res.json() as Promise<T>;
}
