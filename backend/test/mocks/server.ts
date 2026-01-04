import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const server = setupServer(
    // Mock Solana RPC
    http.post('https://api.testnet.solana.com', async ({ request }) => {
        const body: any = await request.json();

        if (body.method === 'getBalance') {
            return HttpResponse.json({
                jsonrpc: '2.0',
                result: { value: 1000000000 }, // 1 SOL in lamports
                id: body.id
            });
        }

        return HttpResponse.json({
            jsonrpc: '2.0',
            error: { code: -32601, message: 'Method not found' },
            id: body.id
        });
    }),

    // Mock AI Moderation API (Hugging Face / OpenAI pattern)
    http.post('*/moderations', () => {
        return HttpResponse.json({
            id: 'modr-123',
            model: 'text-moderation-latest',
            results: [{
                flagged: false,
                category_scores: {
                    sexual: 0.1,
                    hate: 0.05,
                    harassment: 0.02,
                    violence: 0.02
                }
            }]
        });
    }),

    // Mock Clerk API
    http.get('https://api.clerk.dev/v1/users/*', () => {
        return HttpResponse.json({
            id: 'user_123',
            email_addresses: [{ email_address: 'test@example.com' }],
            username: 'testuser'
        });
    })
);
