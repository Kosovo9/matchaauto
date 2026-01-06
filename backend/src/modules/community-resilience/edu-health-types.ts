import { z } from 'zod';
import { BaseOfferSchema } from '../../types';

// ==================== EDU BARTER TYPES ====================
export const RuralSchoolSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string(),              // "Primaria Benito Juárez"
    region: z.string(),            // "Chihuahua, Cuauhtémoc"
    contactPhone: z.string(),      // Teléfono del director
    needs: z.array(z.string()),    // ["pintura", "libros", "sillas"]
    accepts: z.array(z.string()),  // ["maíz", "leña", "albañilería", "donaciones"]
    studentsCount: z.number().default(0),
    isOfflineMode: z.boolean().default(true),
    verified: z.boolean().default(false)
});

export type RuralSchool = z.infer<typeof RuralSchoolSchema>;

export const EduPaymentSchema = z.object({
    studentId: z.string(),
    schoolId: z.string(),
    type: z.enum(['barter', 'donation', 'cash']),
    amount: z.number().optional(), // Value in local currency ref
    barterItem: z.string().optional(), // "50kg Maíz"
    barterQuantity: z.number().optional(),
    status: z.enum(['pending', 'escrow_locked', 'completed', 'disputed']),
    createdAt: z.date()
});

export const EduEscrowAgreementSchema = z.object({
    id: z.string().uuid(),
    schoolId: z.string(),
    parentId: z.string(),
    facilitatorId: z.string(), // 3rd party
    paymentDetails: EduPaymentSchema,
    status: z.enum(['draft', 'active', 'released', 'refunded']),
    releaseCondition: z.string() // "Upon enrollment confirmation"
});

// ==================== HEALTH BARTER TYPES ====================
export const RuralClinicSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string(),
    region: z.string(),
    services: z.array(z.string()), // ["consulta", "parto", "vacuna"]
    accepts: z.array(z.string()),  // ["frijol", "leña", "trabajo"]
    isOfflineMode: z.boolean().default(true)
});

export const MedicineSchema = z.object({
    id: z.string().uuid().optional(),
    clinicId: z.string(),
    name: z.string(),
    type: z.enum(['analgesic', 'antibiotic', 'vaccine', 'vitamin', 'other']),
    quantity: z.number(),
    unit: z.string(), // "cajas", "frascos"
    expiresAt: z.string(), // ISO date
    source: z.enum(['donation', 'purchase', 'barter'])
});

export const HealthPaymentSchema = EduPaymentSchema.extend({
    patientId: z.string(),
    serviceType: z.string() // "consulta"
});
