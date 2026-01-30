export default {
  async fetch(request, env) {
    // Получаем Telegram Bot Token из переменных окружения
    const BOT_TOKEN = env.BOT_TOKEN;
    
    if (request.method === "POST") {
      try {
        const update = await request.json();
        
        // Проверяем, что есть сообщение
        if (update.message && update.message.text) {
          const chatId = update.message.chat.id;
          const text = update.message.text;
          
          // Отправляем эхо-ответ
          await sendMessage(chatId, text, BOT_TOKEN);
        }
        
        return new Response("OK", { status: 200 });
      } catch (error) {
        return new Response("Error: " + error.message, { status: 500 });
      }
    }
    
    // Для GET запросов возвращаем информацию о боте
    return new Response("Telegram Echo Bot is running!", { 
      status: 200,
      headers: { "Content-Type": "text/plain" }
    });
  }
};

// Функция для отправки сообщения через Telegram API
async function sendMessage(chatId, text, botToken) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
    }),
  });
  
  return response.json();
}
