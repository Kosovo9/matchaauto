import { Hono } from 'hono';
import { LocationHistoryController } from '../controllers/location-history.controller';
import { AddressBookController } from '../controllers/address-book.controller';
import { AddressValidationService } from '../services/address-validation.service';
import { GeocodingService } from '../services/geocoding.service';

export function setupLocationRoutes(app: Hono, redis: any, pgPool: any) {
    const geocodingService = new GeocodingService(redis, pgPool);
    const validationService = new AddressValidationService(geocodingService);

    const historyController = new LocationHistoryController(pgPool);
    const addressController = new AddressBookController(validationService, pgPool);

    const route = new Hono();

    // History
    route.get('/history/:id', historyController.getTrace);
    route.get('/history/:id/summary', historyController.getTripSummary);

    // Address Book
    route.post('/address-book', addressController.saveAddress);
    route.get('/address-book', addressController.list);

    app.route('/api/v1/location', route);
}
