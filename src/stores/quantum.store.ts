// src/stores/quantum.store.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface QuantumState {
    // VELOCIDAD DE PENSAMIENTO
    thoughtVelocity: number;
    increaseVelocity: () => void;

    // INTENCIÓN DE TRANSACCIÓN
    transaction: {
        mode: 'buy' | 'rent' | 'lease' | 'bid';
        category: 'cars' | 'parts' | 'services' | 'insurance';
        urgency: 'instant' | '24h' | 'flex';
        currency: string;
        language: string;
    };

    // BÚSQUEDA NEURONAL
    neuralQuery: string;
    suggestions: string[];
    instantResults: Array<any>;

    // K-FACTOR VIRAL
    kFactor: number;
    activeUsers: number;
    liveDeals: number;

    // ACCIONES CUÁNTICAS
    actions: {
        setTransaction: (tx: Partial<QuantumState['transaction']>) => void;
        setNeuralQuery: (query: string) => Promise<void>;
        executeQuantumBuy: (itemId: string) => Promise<{ success: boolean; time: number }>;
        updateKFactor: (newValue: number) => void;
    };
}

export const useQuantumStore = create<QuantumState>()(
    immer((set, get) => ({
        // ESTADO INICIAL
        thoughtVelocity: 10.8,
        increaseVelocity: () => set((state) => { state.thoughtVelocity += 0.1 }),
        transaction: {
            mode: 'buy',
            category: 'cars',
            urgency: 'instant',
            currency: 'USD',
            language: 'es',
        },
        neuralQuery: '',
        suggestions: [],
        instantResults: [],
        kFactor: 1.0,
        activeUsers: 14502,
        liveDeals: 237,

        // ACCIONES
        actions: {
            setTransaction: (updates) => {
                set((state) => {
                    state.transaction = { ...state.transaction, ...updates };
                });
                // Actualizar automáticamente la búsqueda si hay query
                const currentQuery = get().neuralQuery;
                if (currentQuery.length >= 2) {
                    get().actions.setNeuralQuery(currentQuery);
                }
            },

            setNeuralQuery: async (query) => {
                set({ neuralQuery: query });

                if (query.length < 2) {
                    set({ instantResults: [], suggestions: [] });
                    return;
                }

                // BÚSQUEDA CUÁNTICA EN PARALELO
                try {
                    const [results, newSuggestions] = await Promise.all([
                        fetch(`/api/search/quantum?q=${query}&cat=${get().transaction.category}`)
                            .then(r => r.json()),
                        fetch(`/api/suggestions?q=${query}&lang=${get().transaction.language}`)
                            .then(r => r.json()),
                    ]);

                    set({
                        instantResults: results.previewItems || [],
                        suggestions: (newSuggestions || []).slice(0, 5),
                    });
                } catch (e) {
                    console.error("Quantum search failed", e);
                }
            },

            executeQuantumBuy: async (itemId) => {
                const start = performance.now();

                try {
                    // 1. RESERVA INSTANTÁNEA (200ms timeout)
                    const reservation = await Promise.race([
                        fetch(`/api/reserve/${itemId}`, {
                            method: 'POST',
                            headers: { 'X-Quantum-Mode': 'instant' },
                        }),
                        new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('Timeout')), 200)
                        ),
                    ]);

                    // 2. PROCESAR PAGO (Simulación para este ejemplo)
                    await new Promise(resolve => setTimeout(resolve, 300));

                    const end = performance.now();

                    // 3. ACTUALIZAR K-FACTOR (efecto viral)
                    set((state) => {
                        state.kFactor += 0.01;
                        state.liveDeals += 1;
                    });

                    return { success: true, time: end - start };

                } catch (error) {
                    console.error('Quantum buy failed:', error);
                    return { success: false, time: performance.now() - start };
                }
            },

            updateKFactor: (newValue) => {
                set({ kFactor: newValue });
            },
        },
    }))
);
