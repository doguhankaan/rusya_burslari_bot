require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

const BASE_URL = 'https://api.openai.com/v1';
const API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = process.env.ASSISTANT_ID; // önceden oluşturduğun assistant_id

const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'OpenAI-Beta': 'assistants=v2'
};

app.use(bodyParser.json());

// API endpoint: POST /ask
app.post('/ask', async (req, res) => {
    const userQuestion = req.body.question;
    if (!userQuestion) return res.status(400).json({ error: "question field is required" });

    try {
        // 1. Yeni thread oluştur
        const threadRes = await axios.post(`${BASE_URL}/threads`, {}, { headers });
        const threadId = threadRes.data.id;

        // 2. Kullanıcı mesajını thread'e ekle
        await axios.post(`${BASE_URL}/threads/${threadId}/messages`, {
            role: "user",
            content: userQuestion
        }, { headers });

        // 3. Asistanı çalıştır
        const runRes = await axios.post(`${BASE_URL}/threads/${threadId}/runs`, {
            assistant_id: ASSISTANT_ID
        }, { headers });

        const runId = runRes.data.id;

        // 4. Yanıt tamamlanana kadar bekle
        let runStatus = '';
        do {
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 saniye bekle
            const statusRes = await axios.get(`${BASE_URL}/threads/${threadId}/runs/${runId}`, { headers });
            runStatus = statusRes.data.status;
        } while (runStatus !== 'completed');

        // 5. Yanıtı al
        const msgRes = await axios.get(`${BASE_URL}/threads/${threadId}/messages`, { headers });
        const assistantReply = msgRes.data.data.find(msg => msg.role === 'assistant');

        return res.json({ reply: assistantReply.content[0].text.value });

    } catch (error) {
        console.error("Assistant API error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to get assistant response" });
    }
});

app.listen(PORT, () => {
    console.log(`Assistant API server is running on port ${PORT}`);
});
