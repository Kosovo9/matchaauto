
import client from 'prom-client';

// Registro de histograma para latencia
export const modelLatency = new client.Histogram({
    name: 'helpdesk_model_latency_seconds',
    help: 'Latency of AI models response time',
    labelNames: ['model', 'source'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30] // Buckets de tiempo en segundos
});

// Contador de éxitos/fallos
export const modelSuccess = new client.Counter({
    name: 'helpdesk_model_success_total',
    help: 'Total successful AI responses',
    labelNames: ['model', 'source']
});

export const modelErrors = new client.Counter({
    name: 'helpdesk_model_errors_total',
    help: 'Total AI errors',
    labelNames: ['model', 'source', 'error_type']
});
