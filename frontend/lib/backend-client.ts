import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://match-auto-backend.neocwolf.workers.dev'

const backendClient = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

backendClient.interceptors.request.use(
    async (config) => {
        if (typeof window !== 'undefined') {
            const { getSession } = await import('next-auth/react')
            const currentSession = await getSession()

            if ((currentSession as any)?.accessToken) {
                config.headers.Authorization = `Bearer ${(currentSession as any).accessToken}`
            }
        }
        return config
    },
    (error) => Promise.reject(error)
)

backendClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                window.location.href = '/auth/signin'
            }
        }
        return Promise.reject(error)
    }
)

export const backend = {
    decodeVIN: async (vin: string) => {
        const response = await backendClient.post('/api/vin/decode', { vin })
        return response.data
    },
    getListings: async (filters?: any) => {
        const response = await backendClient.get('/api/listings', { params: filters })
        return response.data
    },
    createListing: async (data: any) => {
        const response = await backendClient.post('/api/listings', data)
        return response.data
    },
    createEscrow: async (orderId: string, amount: number) => {
        const response = await backendClient.post('/api/escrow/create', {
            orderId,
            amount,
            currency: 'USDC'
        })
        return response.data
    },
    getUserProfile: async (userId: string) => {
        const response = await backendClient.get(`/api/users/${userId}`)
        return response.data
    },
    updateProfile: async (userId: string, data: any) => {
        const response = await backendClient.put(`/api/users/${userId}`, data)
        return response.data
    },
    getGlobalStats: async () => {
        const response = await backendClient.get('/api/analytics/global')
        return response.data
    },
    analyzeImage: async (imageUrl: string) => {
        const response = await backendClient.post('/api/ai/analyze', { imageUrl })
        return response.data
    },
    health: async () => {
        const response = await backendClient.get('/health')
        return response.data
    }
}

export default backend
