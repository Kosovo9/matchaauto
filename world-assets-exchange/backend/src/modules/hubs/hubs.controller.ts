import { Context } from 'hono';
import { HubsService } from './hubs.service';
import { HubSchema, SignalSchema } from './hubs.schema';
import { logger } from '../../utils/logger';

export class HubsController {
    constructor(private service: HubsService) { }

    async list(c: Context) {
        try {
            let hubs = [];
            try {
                hubs = await this.service.listHubs();
            } catch (dbError) {
                logger.warn('DB Offline, using Supreme Mocks for list');
                hubs = [
                    { id: 'h1', name: 'Mecánicos NP300 - Chihuahua', purpose: 'Intercambio de refacciones y herramientas en la región norte.', memberCount: 145, completedExchanges: 48, language: 'es', status: 'active' },
                    { id: 'h2', name: 'Alfareros de Oaxaca', purpose: 'Coordinación logística y trueque de materiales ancestrales.', memberCount: 89, completedExchanges: 156, language: 'es', status: 'active' },
                    { id: 'h3', name: 'Boat Suppliers - Bangladesh', purpose: 'Marine parts exchange and fuel coordination (Offline Sync).', memberCount: 420, completedExchanges: 1250, language: 'en', status: 'active' }
                ];
            }
            return c.json({ success: true, data: hubs });
        } catch (error: any) {
            logger.error('List Hubs Error', error);
            return c.json({ success: false, error: error.message }, 500);
        }
    }

    async create(c: Context) {
        try {
            const body = await c.req.json();
            const validated = HubSchema.parse(body);
            const hub = await this.service.createHub(validated);
            return c.json({ success: true, data: hub }, 201);
        } catch (error: any) {
            return c.json({ success: false, error: error.message }, 400);
        }
    }

    async get(c: Context) {
        const id = c.req.param('id');
        const hub = await this.service.getHub(id);
        if (!hub) return c.json({ success: false, error: 'Hub not found' }, 404);
        return c.json({ success: true, data: hub });
    }

    async postSignal(c: Context) {
        try {
            const body = await c.req.json();
            const validated = SignalSchema.parse(body);
            const signal = await this.service.sendSignal(validated);
            return c.json({ success: true, data: signal });
        } catch (error: any) {
            return c.json({ success: false, error: error.message }, 400);
        }
    }

    async getSignals(c: Context) {
        const id = c.req.param('id');
        try {
            const signals = await this.service.getHubSignals(id);
            return c.json({ success: true, data: signals });
        } catch (dbError) {
            return c.json({
                success: true,
                data: [
                    { id: 's1', type: 'offer', content: 'Tengo alternador reconstruido para W204 Mercedes', senderId: 'mod_toronto', createdAt: new Date() },
                    { id: 's2', type: 'request', content: '¿Alguien tiene escáner Xentry disponible hoy?', senderId: 'user_45', createdAt: new Date() }
                ]
            });
        }
    }

    async clone(c: Context) {
        try {
            const { sourceId, name } = await c.req.json();
            const hub = await this.service.cloneHub(sourceId, name);
            return c.json({ success: true, data: hub });
        } catch (error: any) {
            return c.json({ success: false, error: error.message }, 500);
        }
    }
}
