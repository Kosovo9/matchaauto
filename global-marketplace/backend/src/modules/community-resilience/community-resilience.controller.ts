import { Context } from 'hono';
import { Pool } from 'pg';
import Redis from 'ioredis';
import { logger } from '../../utils/logger';
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
import { CulturalBarterService } from './cultural-barter/services/cultural-barter.service';
import { IndigenousLanguagesService } from './indigenous-languages/services/indigenous-languages.service';
import { VisibilityService } from '../../services/community-resilience/visibility.service';
import { MatchingDispatcher } from '../../services/community-resilience/matching/dispatcher';
import { SqliteMatcher } from '../../services/community-resilience/matching/engines/sqlite.matcher';
import { RedisMatcher } from '../../services/community-resilience/matching/engines/redis.matcher';
import { KafkaMatcher } from '../../services/community-resilience/matching/engines/kafka.matcher';
import { CommunityPaymentService } from '../../services/community-resilience/payment.service';

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
    private culture: CulturalBarterService;
    private language: IndigenousLanguagesService;
    private visibility: VisibilityService;
    private matching: MatchingDispatcher;
    private payment: CommunityPaymentService;

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
        this.culture = new CulturalBarterService(pg);
        this.language = new IndigenousLanguagesService(pg);
        this.visibility = new VisibilityService(redis, pg);
        this.payment = new CommunityPaymentService();
        this.matching = new MatchingDispatcher(
            new SqliteMatcher(pg),
            new RedisMatcher(redis),
            new KafkaMatcher()
        );
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
                case 'edu': // EduBarter Global
                    if (action === 'register') result = await this.edu.registerSchool(body);
                    if (action === 'sms') result = await this.edu.handleSMS(body.phone, body.message);
                    break;
                case 'health': // HealthBarter Global
                    if (action === 'register') result = await this.health.registerClinic(body);
                    if (action === 'inventory') result = await this.health.addMedicine(body);
                    if (action === 'sms') result = await this.health.handleSMS(body.phone, body.message);
                    break;
                case 'culture': // Cultural Barter
                    if (action === 'offer') result = await this.culture.createOffer(body);
                    if (action === 'sms') result = await this.culture.handleSMS(body.phone, body.message);
                    break;
                case 'language': // Indigenous Languages
                    if (action === 'register') result = await this.language.registerLanguage(body);
                    if (action === 'search') result = await this.language.findLanguagesByRegion(body.region);
                    break;
                case 'visibility': // ✨ Priority Real
                    if (action === 'activate') result = await this.visibility.activateVisibility(body.signalId, body.type, body.region, body.durationDays);
                    if (action === 'get') result = await this.visibility.getActiveVisibility(body.signalId);
                    break;
                case 'matching': // 🔥 100x Matching
                    if (action === 'match') result = await this.matching.matchSignal(body);
                    break;
                case 'payment': // 💵 Local Payments
                    if (action === 'voucher') result = await this.payment.generateVoucher(body.amount, body.region, body.type);
                    if (action === 'verify') result = await this.payment.verifyPayment(body.code, body.pin);
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
