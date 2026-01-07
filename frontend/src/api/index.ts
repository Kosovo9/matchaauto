
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function calculatePrice(data: any) {
    const response = await fetch(`${API_BASE_URL}/api/dynamic-pricing/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to calculate price');
    return response.json();
}

export async function predictMaintenance(vehicleId: string) {
    const response = await fetch(`${API_BASE_URL}/api/predictive-maintenance/${vehicleId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to predict maintenance');
    return response.json();
}

export async function trackEvent(eventData: any) {
    const response = await fetch(`${API_BASE_URL}/api/analytics/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
    });
    if (!response.ok) throw new Error('Failed to track event');
    return response.json();
}

export async function createListing(listingData: any) {
    const response = await fetch(`${API_BASE_URL}/api/marketplace/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listingData),
    });
    if (!response.ok) throw new Error('Failed to create listing');
    return response.json();
}

export async function queryHelpDesk(question: string, userId: string) {
    const response = await fetch(`${API_BASE_URL}/api/helpdesk/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, question }),
    });
    if (!response.ok) throw new Error('HelpDesk query failed');
    return response.json();
}
