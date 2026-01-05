// @ts-ignore
import MercadoPago from 'mercadopago'

export interface PaymentPlan {
    id: 'featured' | 'premium' | 'agency'
    name: string
    description: string
    price: number
    currency: 'MXN' | 'USD'
    features: string[]
    viralBoost: number
    aiCredits: number
    apiCalls: number
}

export class PaymentOrchestrator {
    private mp: any

    constructor(env: any) {
        // Initialize MercadoPago with Mexico credentials
        this.mp = new MercadoPago({
            accessToken: env.MP_ACCESS_TOKEN || 'TEST-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
            options: { timeout: 5000 }
        })
    }

    async createPaymentIntent(
        planId: PaymentPlan['id'],
        userId: string,
        userEmail: string
    ): Promise<{
        success: boolean
        checkoutUrl?: string
        preferenceId?: string
    }> {
        try {
            const plan = this.getPlanDetails(planId)

            // Create MercadoPago preference for Mexico
            const preference = {
                items: [
                    {
                        id: plan.id,
                        title: `Match-Auto: ${plan.name}`,
                        unit_price: plan.price,
                        quantity: 1,
                        currency_id: 'MXN' // For Mexico
                    }
                ],
                payer: {
                    email: userEmail
                },
                external_reference: userId,
                back_urls: {
                    success: 'https://match-auto.pages.dev/payment/success',
                    failure: 'https://match-auto.pages.dev/payment/failure',
                    pending: 'https://match-auto.pages.dev/payment/pending'
                },
                auto_return: 'approved',
                metadata: {
                    userId,
                    planId,
                    viralBoost: plan.viralBoost
                }
            }

            // Using MP v2 SDK style
            const result = await this.mp.preferences.create({ body: preference })

            return {
                success: true,
                checkoutUrl: result.init_point,
                preferenceId: result.id
            }
        } catch (error) {
            console.error('MercadoPago creation error:', error)
            return {
                success: false
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
                currency: 'MXN',
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
                currency: 'MXN',
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
                currency: 'MXN',
                features: ['Listings ilimitados', 'Dashboard Agencia'],
                viralBoost: 10.0,
                aiCredits: 20000,
                apiCalls: 1000000,
            }
        }

        return plans[planId]
    }
}
