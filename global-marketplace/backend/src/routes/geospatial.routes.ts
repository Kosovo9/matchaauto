import { Hono } from 'hono';
import { IsochronesController } from '../controllers/geospatial/isochrones.controller';
import { GeospatialOperationsController } from '../controllers/geospatial/geospatial-operations.controller';
import { AddressValidationController } from '../controllers/address-validation.controller';
import { rateLimit, rateLimitConfigs } from '../middleware/rateLimiter';

export function setupGeospatialRoutes(app: Hono, redis: any, pgPool: any) {
    const isochronesController = new IsochronesController(redis, pgPool);
    const geoOpsController = new GeospatialOperationsController(pgPool);
    const addressController = new AddressValidationController(redis, pgPool);

    const route = new Hono();

    // Apply Global Moderate Rate Limit
    route.use('*', rateLimit(rateLimitConfigs.moderate));

    // Isochrones
    route.post('/isochrones/calculate', (c) => isochronesController.calculate(c));

    // Geo Operations (NASA Level)
    route.post('/ops/execute', (c) => geoOpsController.execute(c));

    // Address Validation
    route.post('/address/validate', (c) => addressController.validateAddress(c));
    route.post('/address/validate/batch', (c) => addressController.validateBatch(c));
    route.post('/address/standardize', (c) => addressController.standardizeAddress(c));
    route.get('/address/autocomplete', (c) => addressController.autocompleteAddress(c));
    route.post('/address/postal-code', (c) => addressController.validatePostalCode(c));
    route.get('/address/formats', (c) => addressController.getCountryFormats(c));

    app.route('/api/v1/geospatial', route);
}
