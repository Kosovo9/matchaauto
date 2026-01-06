import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q')?.toLowerCase() || '';

    const SUGGESTIONS_BANK: Record<string, string[]> = {
        'tesla': ['Tesla Model 3', 'Tesla Model X', 'Tesla Cybertruck', 'Tesla Accessories'],
        'porsche': ['Porsche 911', 'Porsche Cayenne', 'Porsche Taycan Turbo S'],
        'ferrari': ['Ferrari SF90', 'Ferrari Roma', 'Ferrari F8 Tributo'],
        'brak': ['Carbon Ceramic Brakes', 'Brembo Brake Pads', 'Brake Fluid Refresh'],
    };

    const results = SUGGESTIONS_BANK[q] || SUGGESTIONS_BANK[Object.keys(SUGGESTIONS_BANK).find(k => q.startsWith(k)) || ''] || [];

    return NextResponse.json(results);
}
