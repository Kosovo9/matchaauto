import { Hono } from 'hono';
import { Env } from '../../../shared/types';

const ai = new Hono<{ Bindings: Env }>();

ai.post('/analyze-auto', async (c) => {
    const body = await c.req.json();
    const { imageUrl } = body;
    const env = c.env;

    if (!imageUrl) return c.json({ success: false, error: 'No image provided' }, 400);

    try {
        const genAIUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GOOGLE_AI_API_KEY}`;

        const response = await fetch(genAIUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "Analyze this car image and return a JSON with: make, model, yearRange, color, conditionScore (1-10), and 5 main features. Be precise." },
                        { inline_data: { mime_type: "image/jpeg", data: await fetch(imageUrl).then(r => r.arrayBuffer()).then(b => btoa(String.fromCharCode(...new Uint8Array(b)))) } }
                    ]
                }]
            })
        });

        const data: any = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;
        const cleanJson = aiText.replace(/```json|```/g, '').trim();
        const analysis = JSON.parse(cleanJson);

        return c.json({
            success: true,
            data: analysis,
            message: 'Quantum AI Analysis Complete'
        });
    } catch (e) {
        console.error("AI Error:", e);
        return c.json({ success: false, error: 'AI Processing Failed' }, 500);
    }
});

export default ai;
