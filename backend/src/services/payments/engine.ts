import Stripe from 'stripe'
// @ts-ignore
import MercadoPago from 'mercadopago'

export interface PaymentPlan {
    id: 'featured' | 'premium' | 'agency'
    name: string
    description: string
    price: number
    currency: 'ARS' | 'USD'
    features: string[]
    viralBoost: number
    aiCredits: number
    apiCalls: number
}

export class PaymentOrchestrator {
    private stripe: Stripe
    private mp: any

    constructor(env: any) {
        this.stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
            apiVersion: '2024-12-18.acacia' as any,
        })

        // MercadoPago v2 initialization or v1 as per user snippet
        this.mp = MercadoPago
        /* 
        MercadoPago.configure({
          access_token: env.MP_ACCESS_TOKEN!,
        })
        */
    }

    async createPaymentIntent(
        planId: PaymentPlan['id'],
        userId: string,
        userEmail: string
    ): Promise<{
        success: boolean
        clientSecret?: string
        paymentId?: string
        checkoutUrl?: string
    }> {
        try {
            const plan = this.getPlanDetails(planId)

            const customers = await this.stripe.customers.list({
                email: userEmail,
                limit: 1,
            })

            let customerId
            if (customers.data.length > 0) {
                customerId = customers.data[0].id
            } else {
                const customer = await this.stripe.customers.create({
                    email: userEmail,
                    metadata: { userId, planId },
                })
                customerId = customer.id
            }

            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(plan.price * 100),
                currency: plan.currency.toLowerCase(),
                customer: customerId,
                metadata: {
                    userId,
                    planId,
                    planName: plan.name,
                    viralBoost: plan.viralBoost.toString(),
                },
                automatic_payment_methods: {
                    enabled: true,
                },
                description: `Match-Auto: ${plan.name}`,
            })

            return {
                success: true,
                clientSecret: paymentIntent.client_secret!,
                paymentId: paymentIntent.id,
            }
        } catch (error) {
            console.error('Payment creation error:', error)
            return {
                success: false,
            }
        }
    }

    private getPlanDetails(planId: PaymentPlan['id']): PaymentPlan {
        const plans: Record<PaymentPlan['id'], PaymentPlan> = {
            featured: {
                id: 'featured',
                name: 'Destacado 10x',
                description: 'Potencia tu negocio con visibilidad exponencial',
                price: 29990,
                currency: 'ARS',
                features: ['7 días destacados', 'Analytics básico'],
                viralBoost: 3.5,
                aiCredits: 1000,
                apiCalls: 5000,
            },
            premium: {
                id: 'premium',
                name: 'Dominación Total',
                description: 'Control absoluto del mercado con AI predictiva',
                price: 89990,
                currency: 'ARS',
                features: ['30 días destacados', 'AI Predictiva'],
                viralBoost: 7.8,
                aiCredits: 5000,
                apiCalls: 100000,
            },
            agency: {
                id: 'agency',
                name: 'Agencia Pro',
                description: 'Ilimitado para flotas comerciales',
                price: 199990,
                currency: 'ARS',
                features: ['Listings ilimitados', 'Dashboard Agencia'],
                viralBoost: 10.0,
                aiCredits: 20000,
                apiCalls: 1000000,
            }
        }

        return plans[planId]
    }
}
