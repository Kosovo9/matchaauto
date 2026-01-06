import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const startTime = Date.now();
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q')?.toLowerCase() || '';
    const cat = searchParams.get('cat') || 'cars';

    // MOCK DATA 10x
    const ALL_ITEMS = [
        { id: '1', title: 'Tesla Model S Plaid', price: 129990, cat: 'cars', imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800' },
        { id: '2', title: 'Porsche Taycan', price: 185000, cat: 'cars', imageUrl: 'https://images.unsplash.com/photo-1614205732726-939338755889?auto=format&fit=crop&q=80&w=800' },
        { id: '3', title: 'Lucid Air Sapphire', price: 249000, cat: 'cars', imageUrl: 'https://images.unsplash.com/photo-1696355966237-75929a4bd793?auto=format&fit=crop&q=80&w=800' },
        { id: '4', title: 'Ferrari 296 GTB', price: 322000, cat: 'cars', imageUrl: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&q=80&w=800' },
    ];

    const filtered = ALL_ITEMS.filter(item =>
        item.cat === cat && (item.title.toLowerCase().includes(q) || q === '')
    );

    const response = {
        previewItems: filtered.map(item => ({
            id: item.id,
            title: item.title,
            imageUrl: item.imageUrl,
            priceTag: `$${item.price.toLocaleString()}`,
            badge: 'QUANTUM',
        })),
        totalMatches: filtered.length,
        executionTimeMs: Date.now() - startTime,
        cacheHit: Math.random() > 0.5, // Simular IA Cache
    };

    return NextResponse.json(response);
}
