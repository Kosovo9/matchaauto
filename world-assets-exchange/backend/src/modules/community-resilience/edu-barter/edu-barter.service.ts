import { Pool } from 'pg';
import { z } from 'zod';
import { MetricsCollector } from '../../../utils/metrics-collector';
import { RuralSchoolSchema, RuralSchool } from '../edu-health-types';

export class EduBarterService {
    private pg: Pool;
    private metrics: MetricsCollector;

    constructor(pg: Pool) {
        this.pg = pg;
        this.metrics = MetricsCollector.getInstance();
    }

    // ==================== SCHOOL MANAGEMENT ====================
    async registerSchool(school: RuralSchool): Promise<string> {
        const validated = RuralSchoolSchema.parse(school);
        const client = await this.pg.connect();

        try {
            const res = await client.query(`
        INSERT INTO rural_schools (
          name, region, contact_phone, needs, accepts, students_count, is_offline_mode, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING id
      `, [
                validated.name,
                validated.region,
                validated.contactPhone,
                validated.needs,
                validated.accepts,
                validated.studentsCount,
                validated.isOfflineMode
            ]);

            this.metrics.increment('edu_barter.school_registered', { region: validated.region });
            return res.rows[0].id;
        } finally {
            client.release();
        }
    }

    // ==================== PAYMENT & ESCROW ====================
    async createEscrowAgreement(agreement: any): Promise<string> {
        // In a full implementation, this locks the funds/items logically
        const client = await this.pg.connect();
        try {
            const res = await client.query(`
        INSERT INTO barter_escrows (
          school_id, parent_id, facilitator_id, amount, barter_item, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, 'active', NOW())
        RETURNING id
      `, [
                agreement.schoolId,
                agreement.parentId,
                agreement.facilitatorId,
                agreement.paymentDetails.amount || 0,
                agreement.paymentDetails.barterItem
            ]);
            return res.rows[0].id;
        } finally {
            client.release();
        }
    }

    // ==================== SMS HANDLER ====================
    async handleSMS(phone: string, message: string): Promise<string> {
        // "ESCUELA INSCRIBIR JuanPerez PrimariaBenito"
        const parts = message.split(' ');
        const action = parts[1]?.toUpperCase();

        if (action === 'INSCRIBIR') {
            const student = parts[2];
            const schoolName = parts[3];
            // Logic to find school and register student pending payment
            return `RECIBIDO: Solicitud inscripción ${student} en ${schoolName}. Enviar pago o trueque para confirmar.`;
        }

        if (action === 'PAGAR') {
            // "ESCUELA PAGAR 50kgMaiz PrimariaBenito"
            const item = parts[2];
            const schoolName = parts[3];
            // Logic to create pending payment record
            return `RECIBIDO: Oferta pago ${item} para ${schoolName}. Esperando confirmación director.`;
        }

        return "COMANDO NO RECONOCIDO. Use: ESCUELA INSCRIBIR [Nombre] [Escuela]";
    }
}
