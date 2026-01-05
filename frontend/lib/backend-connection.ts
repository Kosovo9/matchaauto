import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://match-auto-backend.neocwolf.workers.dev'

export const backend = {
    // VIN Decoding
    decodeVIN: async (vin: string) => {
        const response = await axios.post(`${API_URL}/api/vin/decode`, { vin })
        return response.data
    },

    // Listings Management
    getListings: async (filters: any) => {
        const response = await axios.get(`${API_URL}/api/listings`, { params: filters })
        return response.data
    },

    createListing: async (data: any) => {
        const response = await axios.post(`${API_URL}/api/listings`, data)
        return response.data
    },

    // Solana Escrow
    createEscrow: async (orderId: string, amount: number) => {
        const response = await axios.post(`${API_URL}/api/escrow/create`, {
            orderId,
            amount,
            currency: 'USDC'
        })
        return response.data
    },

    // AI Features
    analyzeImage: async (imageUrl: string) => {
        const response = await axios.post(`${API_URL}/api/ai/analyze-image`, { imageUrl })
        return response.data
    },

    // Analytics
    getGlobalStats: async () => {
        const response = await axios.get(`${API_URL}/api/analytics/global`)
        return response.data
    },

    // User Management
    getUserProfile: async (userId: string) => {
        const response = await axios.get(`${API_URL}/api/users/${userId}`)
        return response.data
    }
}

export default backend
