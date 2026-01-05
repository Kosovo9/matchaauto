import { Env } from '../../../shared/types';

export interface Bid {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    timestamp: number;
    sessionId: string;
    ip: string;
    country: string;
    metadata: {
        device: string;
        userAgent: string;
        trustScore: number;
    };
}

export interface AuctionState {
    id: string;
    listingId: string;
    currentBid: Bid | null;
    bids: Bid[];
    startTime: number;
    endTime: number;
    status: 'pending' | 'active' | 'ended' | 'settled';
    winner: string | null;
    commissionCollected: boolean;
    fixedCommission: number; // $199 USD
}

export class BidStreamDO implements DurableObject {
    private state: DurableObjectState;
    private auctionState: AuctionState;
    private connections: Map<string, WebSocket> = new Map();

    private COMMISSION_WALLET = 'E6a5E8qjJf5cX1C7zK8bT9dM2nL3pR4sV6wX9yZ2B4dA7cF8gH1jK3lP5oI9uY';
    private COMMISSION_AMOUNT = 199; // USD

    constructor(state: DurableObjectState, env: Env) {
        this.state = state;
        this.auctionState = this.initializeAuctionState();

        state.blockConcurrencyWhile(async () => {
            const stored = await state.storage.get<AuctionState>('auctionState');
            if (stored) this.auctionState = stored;
        });
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);

        if (url.pathname === '/ws') {
            return this.handleWebSocket(request);
        }

        if (request.method === 'POST' && url.pathname === '/init') {
            const body: any = await request.json();
            this.auctionState.listingId = body.listingId;
            this.auctionState.status = 'active';
            this.auctionState.endTime = Date.now() + (body.durationMs || 3600000);
            await this.state.storage.put('auctionState', this.auctionState);
            return new Response('Initialized');
        }

        return new Response('Not found', { status: 404 });
    }

    private async handleWebSocket(request: Request): Promise<Response> {
        const [client, server] = Object.values(new WebSocketPair());

        (server as any).accept();
        const connectionId = crypto.randomUUID();
        this.connections.set(connectionId, server as any);

        server.addEventListener('message', async (event: any) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'PLACE_BID') {
                    await this.processBid(data, connectionId);
                }
            } catch (e) {
                console.error(e);
            }
        });

        server.addEventListener('close', () => {
            this.connections.delete(connectionId);
        });

        return new Response(null, { status: 101, webSocket: client as any });
    }

    private async processBid(data: any, connectionId: string) {
        if (this.auctionState.status !== 'active') return;

        const bid: Bid = {
            id: crypto.randomUUID(),
            userId: data.userId,
            amount: data.amount,
            currency: 'USD',
            timestamp: Date.now(),
            sessionId: connectionId,
            ip: 'unknown',
            country: 'unknown',
            metadata: data.metadata || { device: 'unknown', trustScore: 50 }
        };

        if (this.auctionState.currentBid && bid.amount <= this.auctionState.currentBid.amount) {
            this.connections.get(connectionId)?.send(JSON.stringify({ type: 'ERROR', message: 'Bid too low' }));
            return;
        }

        this.auctionState.currentBid = bid;
        this.auctionState.bids.push(bid);
        await this.state.storage.put('auctionState', this.auctionState);

        this.broadcast({ type: 'NEW_BID', data: bid });
    }

    private broadcast(message: any) {
        const data = JSON.stringify(message);
        this.connections.forEach(ws => ws.send(data));
    }

    private initializeAuctionState(): AuctionState {
        return {
            id: crypto.randomUUID(),
            listingId: '',
            currentBid: null,
            bids: [],
            startTime: Date.now(),
            endTime: Date.now() + 3600000,
            status: 'pending',
            winner: null,
            commissionCollected: false,
            fixedCommission: 199
        };
    }
}
