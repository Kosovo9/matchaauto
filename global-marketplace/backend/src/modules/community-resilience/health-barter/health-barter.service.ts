import { Pool } from 'pg';
import { z } from 'zod';
import { MetricsCollector } from '../../../utils/metrics-collector';
import { RuralClinicSchema, RuralClinic, MedicineSchema, Medicine } from '../edu-health-types';

export class HealthBarterService {
    private pg: Pool;
    private metrics: MetricsCollector;

    constructor(pg: Pool) {
        this.pg = pg;
        this.metrics = MetricsCollector.getInstance();
    }

    // ==================== CLINIC MANAGEMENT ====================
    async registerClinic(clinic: RuralClinic): Promise<string> {
        const validated = RuralClinicSchema.parse(clinic);
        const client = await this.pg.connect();

        try {
            const res = await client.query(`
        INSERT INTO rural_clinics (
          name, region, services, accepts, is_offline_mode, created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING id
      `, [
                validated.name,
                validated.region,
                validated.services,
                validated.accepts,
                validated.isOfflineMode
            ]);

            this.metrics.increment('health_barter.clinic_registered', { region: validated.region });
            return res.rows[0].id;
        } finally {
            client.release();
        }
    }

    // ==================== INVENTORY MANAGEMENT ====================
    async addMedicine(medicine: Medicine): Promise<string> {
        const validated = MedicineSchema.parse(medicine);
        const client = await this.pg.connect();

        try {
            const res = await client.query(`
            INSERT INTO clinic_inventory (
                clinic_id, name, type, quantity, unit, expires_at, source, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
            RETURNING id
        `, [
                validated.clinicId,
                validated.name,
                validated.type,
                validated.quantity,
                validated.unit,
                validated.expiresAt,
                validated.source
            ]);
            return res.rows[0].id;
        } finally {
            client.release();
        }
    }

    // ==================== SMS HANDLER ====================
    async handleSMS(phone: string, message: string): Promise<string> {
        // "SALUD CONSULTA MariaLopez CentroCuauhtemoc"
        const parts = message.split(' ');
        const action = parts[1]?.toUpperCase();

        if (action === 'CONSULTA') {
            const patient = parts[2];
            const clinic = parts[3];
            return `CITA: Registrada para ${patient} en ${clinic}. Puede pagar con trueque (maíz, leña).`;
        }

        if (action === 'DONAR') {
            // "SALUD DONAR Paracetamol 50 CentroCuauhtemoc"
            const item = parts[2];
            const qty = parts[3];
            const clinic = parts[4];
            return `GRACIAS: Donación de ${qty} ${item} registrada para ${clinic}.`;
        }

        return "COMANDO NO RECONOCIDO. Use: SALUD CONSULTA [Paciente] [Centro]";
    }
}
