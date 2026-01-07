import { Context } from 'hono';
import { Pool } from 'pg';
import { GeospatialOperationsService, GeoOperationSchema } from '../../services/geospatial/geospatial-operations.service';
import { logger } from '../../utils/logger';

export class GeospatialOperationsController {
    private service: GeospatialOperationsService;

    constructor(pgPool: Pool) {
        this.service = new GeospatialOperationsService(pgPool);
    }

    async execute(c: Context) {
        try {
            const body = await c.req.json();
            const validated = await GeoOperationSchema.parseAsync(body);

            const result = await this.service.executeOperation(validated);

            return c.json({ success: true, data: result });
        } catch (error) {
            logger.error('Geo Operation Error', error);
            return c.json({ success: false, error: 'Operation Failed' }, 500);
        }
    }
}
