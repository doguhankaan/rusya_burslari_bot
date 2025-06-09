require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const API_URL = 'https://api.openai.com/v1/chat/completions';
const BASE_URL = 'https://api.openai.com/v1';
const API_KEY = process.env.OPENAI_API_KEY;

const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'OpenAI-Beta': 'assistants=v2',
};

async function createAssistant() {
    const res = await axios.post(`${BASE_URL}/assistants`, {
        name: "Rusya Bursları Asistanı",
        instructions: "Kullanıcıların Rossotrudniçestvo tarafından verilen Rusya Bursları hakkındaki sorularına cevap vereceksin. Eğer bu konuyla alakasız bir soru ise 'Sorunuzu anlayamadım, lütfen sadece Rusya bursları hakkında sorular sorunuz.' şeklinde cevap ver. Ayrıca soru hangi dilde sorulmuşsa o dilde cevap ver.",
        model: "gpt-4.1",
        tools: [{ type: "file_search" }]
    }, { headers });
    return res.data.id;
}

async function uploadFile(filePath) {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    form.append('purpose', 'assistants');

    const res = await axios.post(`${BASE_URL}/files`, form, {
        headers: {
            ...form.getHeaders(),
            'Authorization': `Bearer ${API_KEY}`,
            'OpenAI-Beta': 'assistants=v2',
        }
    });

    return res.data.id;
}

// 3. Assistanta dosya bağla
async function attachFileToAssistant(assistantId, fileId) {
    const res = await axios.post(`${BASE_URL}/assistants/${assistantId}`, {
        file_ids: [fileId]
    }, { headers });

    return res.data;
}

// 4. Thread oluştur
async function createThread() {
    const res = await axios.post(`${BASE_URL}/threads`, {}, { headers });
    return res.data.id;
}

// 5. Mesaj gönder
async function sendMessageToThread(threadId, userMessage) {
    await axios.post(`${BASE_URL}/threads/${threadId}/messages`, {
        role: "user",
        content: userMessage
    }, { headers });
}

// 6. Assistant çalıştır
async function runAssistant(assistantId, threadId) {
    const res = await axios.post(`${BASE_URL}/threads/${threadId}/runs`, {
        assistant_id: assistantId
    }, { headers });

    return res.data.id;
}

// 7. Run tamamlanana kadar bekle
async function waitForRun(threadId, runId) {
    while (true) {
        const res = await axios.get(`${BASE_URL}/threads/${threadId}/runs/${runId}`, { headers });
        if (res.data.status === 'completed') break;
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// 8. Yanıtı al
async function getResponse(threadId) {
    const res = await axios.get(`${BASE_URL}/threads/${threadId}/messages`, { headers });
    const lastMessage = res.data.data.find(msg => msg.role === 'assistant');
    return lastMessage?.content[0]?.text?.value || "Yanıt alınamadı.";
}

async function listAssistants() {
    try {
        const res = await axios.get('https://api.openai.com/v1/assistants', { headers });
        const assistants = res.data.data;
        assistants.forEach(a => {
            console.log(`Name: ${a.name} | ID: ${a.id}`);
        });
    } catch (err) {
        console.error("Error listing assistants:", err.response?.data || err.message);
    }
}

// 🔁 TÜMÜNÜ ÇALIŞTIR
(async () => {
    const assistantId = await createAssistant();
    const fileId = await uploadFile('doc.txt'); // buraya kendi döküman dosyanı koy
    await attachFileToAssistant(assistantId, fileId);
    const threadId = await createThread();

    await sendMessageToThread(threadId, "Rusya bursları hangi akademik seviyelerde verilir?");
    const runId = await runAssistant(assistantId, threadId);
    await waitForRun(threadId, runId);
    const reply = await getResponse(threadId);

    console.log("Yanıt:", reply);
    await listAssistants();
})();