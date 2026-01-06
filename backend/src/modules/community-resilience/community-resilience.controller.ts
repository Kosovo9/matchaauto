import { Context } from 'hono';
import { Pool } from 'pg';
import Redis from 'ioredis';
import { logger } from '../../../utils/logger';
import { AgriBarterService } from './agri-barter/agri-barter.service';
import { FisherBarterService } from './fisher-barter/fisher-barter.service';
import { RefugeeAidService } from './refugee-aid/refugee-aid.service';
import { LocalSeedsService } from './local-seeds/local-seeds.service';
import { MedicinalPlantsService } from './medicinal-plants/medicinal-plants.service';
import { EmergencyService } from './emergency/emergency.service';
import { ArtisanBarterService } from './artisan-barter/artisan-barter.service';
import { NativeLivestockService } from './native-livestock/native-livestock.service';
import { ToolShareService } from './tool-share/tool-share.service';
import { TrueDemandAdsService } from '../../services/community-resilience/true-demand-ads.service';
import { EduBarterService } from './edu-barter/edu-barter.service';
import { HealthBarterService } from './health-barter/health-barter.service';

/**
 * Community Resilience Controller
 * Unified entry point for all humanitarian and barter modules.
 */
export class CommunityResilienceController {
    private agri: AgriBarterService;
    private fisher: FisherBarterService;
    private refugee: RefugeeAidService;
    private seeds: LocalSeedsService;
    private plants: MedicinalPlantsService;
    private emergency: EmergencyService;
    private artisan: ArtisanBarterService;
    private livestock: NativeLivestockService;
    private tools: ToolShareService;
    private trueDemand: TrueDemandAdsService;
    private edu: EduBarterService;
    private health: HealthBarterService;

    constructor(pg: Pool, redis: Redis) {
        this.agri = new AgriBarterService(pg);
        this.fisher = new FisherBarterService(pg);
        this.refugee = new RefugeeAidService(pg);
        this.seeds = new LocalSeedsService(pg);
        this.plants = new MedicinalPlantsService(pg);
        this.emergency = new EmergencyService(pg);
        this.artisan = new ArtisanBarterService(pg);
        this.livestock = new NativeLivestockService(pg);
        this.tools = new ToolShareService(pg);
        this.trueDemand = new TrueDemandAdsService(pg, redis);
        this.edu = new EduBarterService(pg);
        this.health = new HealthBarterService(pg);
    }

    // ==================== DISPATCHER ====================
    // Routes requests to appropriate service based on 'module' param or path

    async handleRequest(c: Context) {
        try {
            const moduleName = c.req.param('module'); // agri, fisher, emergency, etc.
            const action = c.req.param('action'); // create, search, etc.
            const body = await c.req.json().catch(() => ({})); // Handle cases with no body

            let result;

            switch (moduleName) {
                case 'agri':
                    if (action === 'offer') result = await this.agri.createOffer(body);
                    break;
                case 'fisher':
                    if (action === 'offer') result = await this.fisher.createOffer(body);
                    break;
                case 'refugee':
                    if (action === 'mode') await this.refugee.activateRefugeeMode(body.userId, body.location);
                    if (action === 'request') result = await this.refugee.submitRequest(body);
                    break;
                case 'seeds':
                    if (action === 'register') result = await this.seeds.registerSeed(body);
                    if (action === 'search') result = await this.seeds.findSeedsByCharacteristics(body.region, body.criteria);
                    break;
                case 'plants':
                    if (action === 'register') result = await this.plants.registerPlant(body);
                    if (action === 'search') result = await this.plants.findPlantsByAilment(body.region, body.ailment);
                    break;
                case 'emergency':
                    if (action === 'alert') result = await this.emergency.broadcastAlert(body);
                    if (action === 'resource') result = await this.emergency.registerResource(body);
                    break;
                case 'artisan':
                    if (action === 'offer') result = await this.artisan.createOffer(body);
                    break;
                case 'livestock':
                    if (action === 'register') result = await this.livestock.registerBreed(body);
                    break;
                case 'tools':
                    if (action === 'register') result = await this.tools.registerTool(body);
                    break;
                case 'ads':
                    if (action === 'engagement') await this.trueDemand.chargeForRealEngagement(body);
                    break;
                // NEW GLOBAL MODULES
                case 'edu': // EduBarter Global
                    if (action === 'register') result = await this.edu.registerSchool(body);
                    if (action === 'sms') result = await this.edu.handleSMS(body.phone, body.message);
                    break;
                case 'health': // HealthBarter Global
                    if (action === 'register') result = await this.health.registerClinic(body);
                    if (action === 'inventory') result = await this.health.addMedicine(body);
                    if (action === 'sms') result = await this.health.handleSMS(body.phone, body.message);
                    break;
                default:
                    return c.json({ success: false, error: 'Module not found' }, 404);
            }

            return c.json({ success: true, data: result });
        } catch (error) {
            logger.error('Community Resilience Error', error);
            return c.json({ success: false, error: (error as Error).message }, 500);
        }
    }
}
