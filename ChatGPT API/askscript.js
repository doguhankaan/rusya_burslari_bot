const axios = require('axios');

// Sunucu adresi (senin Express API'nin çalıştığı yer)
const SERVER_URL = 'http://localhost:3000/ask';

// Soru gönderme fonksiyonu
async function askQuestion(question) {
    try {
        const response = await axios.post(SERVER_URL, {
            question: question
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log("Cevap:", response.data.reply);
        return response.data.reply;
    } catch (error) {
        console.error("Hata:", error.response?.data || error.message);
    }
}

// Burada istediğin kadar soru sorabilirsin
(async () => {
    await askQuestion("Burs hangi akademik seviyelerde verilir?");
})();
