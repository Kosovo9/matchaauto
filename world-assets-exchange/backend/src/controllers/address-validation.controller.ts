import { Context } from 'hono';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { z } from 'zod';
import { AddressValidationService, ValidationOptions } from '../services/address-validation.service';
import { MetricsCollector } from '../utils/metrics-collector';
import { logger } from '../utils/logger';

// ==================== ZOD SCHEMAS ====================
const AddressValidationSchema = z.object({
    address: z.string().min(1).max(1000),
    countryCode: z.string().length(2).optional(),
    language: z.string().default('en'),
    options: z.object({
        autocorrect: z.boolean().default(true),
        standardize: z.boolean().default(true),
        minConfidence: z.number().default(0.7)
    }).optional().default({})
});

const BatchValidationSchema = z.object({
    addresses: z.array(z.string()).min(1).max(1000),
    countryCode: z.string().length(2).optional(),
    options: z.object({
        parallel: z.boolean().default(true)
    }).optional().default({})
});

const AddressStandardizationSchema = z.object({
    address: z.any(), // Flexible input
    targetFormat: z.enum(['local', 'international', 'postal']),
    countryCode: z.string().length(2).optional()
});

const AutocompleteSchema = z.object({
    query: z.string().min(1),
    countryCode: z.string().length(2).optional(),
    limit: z.coerce.number().default(10)
});

// ==================== CONTROLLER ====================
export class AddressValidationController {
    private service: AddressValidationService;
    private redis: Redis;
    private metrics: MetricsCollector;

    constructor(redis: Redis, pgPool: Pool) {
        this.redis = redis;
        this.service = new AddressValidationService(pgPool); // Assuming service takes pool
        this.metrics = MetricsCollector.getInstance();
    }

    /**
     * Validate Single Address
     */
    async validateAddress(c: Context) {
        try {
            const body = await c.req.json();
            const validated = await AddressValidationSchema.parseAsync(body);

            // Check Cache
            const cacheKey = `addr:val:${Buffer.from(validated.address).toString('base64')}`;
            const cached = await this.redis.get(cacheKey);
            if (cached) return c.json({ success: true, data: JSON.parse(cached), source: 'cache' });

            // Process
            const result = await this.service.validateAddress(
                validated.address,
                validated.countryCode,
                validated.language,
                validated.options as ValidationOptions
            );

            // Cache if valid
            if (result.isValid) {
                await this.redis.setex(cacheKey, 86400 * 7, JSON.stringify(result)); // 7 days
            }

            this.metrics.increment('address.validate');
            return c.json({ success: true, data: result });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    /**
     * Batch Validation
     */
    async validateBatch(c: Context) {
        try {
            const body = await c.req.json();
            const validated = await BatchValidationSchema.parseAsync(body);

            const results = await this.service.validateBatch(
                validated.addresses,
                validated.countryCode,
                'en',
                { ...validated.options, autocorrect: true, standardize: true }
            );

            this.metrics.increment('address.batch_validate', { count: validated.addresses.length });
            return c.json({ success: true, data: results });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    /**
     * Standardize Address
     */
    async standardizeAddress(c: Context) {
        try {
            const body = await c.req.json();
            const validated = await AddressStandardizationSchema.parseAsync(body);

            const standardized = await this.service.standardizeAddress(
                validated.address,
                validated.targetFormat,
                validated.countryCode,
                'en'
            );

            return c.json({ success: true, data: standardized });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    /**
     * Autocomplete
     */
    async autocompleteAddress(c: Context) {
        try {
            const query = c.req.query();
            const validated = await AutocompleteSchema.parseAsync(query);

            const suggestions = await this.service.autocompleteAddress(
                validated.query,
                validated.countryCode,
                'en',
                undefined,
                validated.limit
            );

            return c.json({ success: true, data: suggestions });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    /**
     * Validate Postal Code
     */
    async validatePostalCode(c: Context) {
        try {
            const { postalCode, countryCode } = await c.req.json();

            const result = await this.service.validatePostalCode(postalCode, countryCode);

            return c.json({ success: true, data: result });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    /**
     * Get Country Formats
     */
    async getCountryFormats(c: Context) {
        try {
            const countryCode = c.req.query('countryCode');
            const formats = await this.service.getCountryFormats(countryCode, true);
            return c.json({ success: true, data: formats });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    /**
     * Health Check
     */
    async healthCheck(c: Context) {
        const health = await this.service.healthCheck();
        return c.json({ success: true, data: health });
    }

    private handleError(error: any, c: Context) {
        logger.error('AddressValidation Controller Error', error);
        if (error instanceof z.ZodError) {
            return c.json({ success: false, error: 'Validation Error', details: error.errors }, 400);
        }
        return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
}
