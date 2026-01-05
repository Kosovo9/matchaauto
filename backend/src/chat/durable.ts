export interface ChatMessage {
    id: string
    roomId: string
    userId: string
    userName: string
    content: string
    timestamp: number
    type: 'text' | 'image' | 'system'
    readBy: string[]
    metadata?: {
        isAiModerated?: boolean
        sentiment?: 'positive' | 'neutral' | 'negative'
        attachments?: string[]
    }
}

export class ChatRoom {
    private messages: ChatMessage[] = []
    private connections: WebSocket[] = []

    constructor(private state: any, private env: any) {
        this.state.blockConcurrencyWhile(async () => {
            const stored = await this.state.storage.get('messages') as ChatMessage[]
            this.messages = stored || []
        })
    }

    async fetch(request: Request) {
        if (request.headers.get('Upgrade') === 'websocket') {
            const pair = new WebSocketPair()
            const [client, server] = Object.values(pair)

            this.connections.push(server as unknown as WebSocket)

            // @ts-ignore
            server.accept()

            server.addEventListener('message', async (event) => {
                try {
                    const data = JSON.parse(event.data.toString())
                    await this.handleMessage(data, server as unknown as WebSocket)
                } catch (error) {
                    console.error('WebSocket message error:', error)
                }
            })

            // Enviar historial al conectar
            if (this.messages.length > 0) {
                server.send(JSON.stringify({
                    type: 'history',
                    messages: this.messages.slice(-50),
                }))
            }

            return new Response(null, {
                status: 101,
                webSocket: client,
            })
        }

        return new Response('Not found', { status: 404 })
    }

    private async handleMessage(data: any, connection: WebSocket) {
        if (data.type === 'message') {
            const message: ChatMessage = {
                id: crypto.randomUUID(),
                roomId: data.roomId,
                userId: data.userId,
                userName: data.userName,
                content: data.content,
                timestamp: Date.now(),
                type: data.messageType || 'text',
                readBy: [data.userId],
            }

            this.messages.push(message)
            await this.state.storage.put('messages', this.messages.slice(-1000))

            this.broadcast({
                type: 'new_message',
                message,
            })
        }
    }

    private broadcast(message: any) {
        const payload = JSON.stringify(message)
        this.connections.forEach(conn => {
            try {
                conn.send(payload)
            } catch (error) {
                // Remove dead connections in a real implementation
            }
        })
    }
}
