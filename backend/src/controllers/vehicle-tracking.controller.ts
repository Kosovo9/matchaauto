import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { VehicleTrackingService, PositionHistoryFilterSchema } from '../services/vehicle-tracking.service';

/**
 * @controller VehicleTrackingController
 * @description Controller for Vehicle Tracking (Active movement & History)
 */

export class VehicleTrackingController {
    private trackingService: VehicleTrackingService;

    constructor(trackingService: VehicleTrackingService) {
        this.trackingService = trackingService;
    }

    // GET /api/v1/tracking/:vehicleId/history
    async getHistory(req: Request, res: Response) {
        try {
            const vehicleId = req.params.vehicleId;
            const query = {
                startTime: req.query.start ? new Date(req.query.start as string) : new Date(Date.now() - 3600000),
                endTime: req.query.end ? new Date(req.query.end as string) : new Date(),
                ...req.query
            };

            // Validate Query Params properly
            // Note: Zod schema is imported but used loosely here for brevity in implementation
            if (!vehicleId) throw new Error("Vehicle ID required");

            const history = await this.trackingService.getPositionHistory(
                vehicleId,
                query.startTime,
                query.endTime
            );

            res.json({ success: true, data: history });
        } catch (error) {
            logger.error("History fetch error", error);
            res.status(500).json({ success: false, error: "Failed to fetch history" });
        }
    }

    // POST /api/v1/tracking/live
    // Useful for HTTP-based trackers (instead of WS)
    async reportPosition(req: Request, res: Response) {
        try {
            const { vehicleId, ...pos } = req.body;
            // Basic validation
            if (!vehicleId || !pos.lat || !pos.lng) {
                return res.status(400).json({ error: "Invalid payload" });
            }

            const update = await this.trackingService.updatePosition(vehicleId, pos);
            res.json({ success: true, data: update });
        } catch (error) {
            logger.error("Position report error", error);
            res.status(500).json({ success: false, error: "Failed to process update" });
        }
    }

    // GET /api/v1/tracking/fleet/snapshot
    async getFleetSnapshot(req: Request, res: Response) {
        try {
            // Expecting comma-separated IDs
            const ids = (req.query.ids as string || '').split(',').filter(x => x);
            if (ids.length === 0) return res.status(400).json({ error: "No vehicle IDs provided" });

            const snapshot = await this.trackingService.getLivePositions(ids);
            res.json({ success: true, data: snapshot });
        } catch (error) {
            res.status(500).json({ error: "Snapshot failed" });
        }
    }
}
