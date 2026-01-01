import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use('*', cors())

app.get('/', (c) => {
    return c.json({
        message: 'Match-Auto API 1000x',
        status: 'online',
        version: '1.0.0'
    })
})

// Deepseek: Implementar aquí los endpoints de Viralidad y Sentinel X
// app.get('/api/viral/k-factor', ...)
// app.post('/api/security/sentinel-protect', ...)

export default app
