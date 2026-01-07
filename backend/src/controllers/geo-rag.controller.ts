
import { Context } from 'hono';
import { GeoRAGService } from '../services/ai/geo-rag.service';

export class GeoRAGController {
    constructor(private ragService: GeoRAGService) { }

    search = async (c: Context) => {
        const body = await c.req.json();
        const { query, userLat, userLng } = body;

        const location = (userLat && userLng) ? { lat: userLat, lng: userLng } : undefined;

        const result = await this.ragService.query(query, location);

        return c.json(result);
    };
}
