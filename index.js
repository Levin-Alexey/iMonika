export default {
  async fetch(request, env) {
    // Получаем токены из переменных окружения
    const BOT_TOKEN = env.BOT_TOKEN;
    const DIFY_API_KEY = env.DIFY_API_KEY;
    const SESSIONS = env.SESSIONS; // KV namespace для сессий
    
    if (request.method === "POST") {
      try {
        const update = await request.json();
        
        // Проверяем, что есть сообщение
        if (update.message && update.message.text) {
          const chatId = update.message.chat.id;
          const userId = update.message.from.id;
          const text = update.message.text;
          
          console.log(`[DEBUG] Получено сообщение от пользователя ${userId}: ${text}`);
          
          // Получаем сессию пользователя
          const sessionKey = `user_${userId}`;
          let session = await SESSIONS.get(sessionKey, { type: "json" }) || {
            messageCount: 0,
            isNewUser: true,
            firstSeen: Date.now()
          };
          
          console.log(`[DEBUG] Сессия ${sessionKey}:`, session);
          
          // Если новый пользователь - отправляем приветствие
          if (session.isNewUser) {
            console.log(`[DEBUG] Новый пользователь ${userId}, отправляем приветствие`);
            session.isNewUser = false;
            await SESSIONS.put(sessionKey, JSON.stringify(session), {
              expirationTtl: 86400 // 24 часа
            });
            console.log(`[DEBUG] Сессия сохранена в KV`);
            
            await sendMessage(chatId, "Напишите Ваш вопрос", BOT_TOKEN);
            return new Response("OK", { status: 200 });
          }
          
          // Отправляем сообщение в Dify
          const difyResponse = await queryDify(text, userId, DIFY_API_KEY);
          
          // Обновляем сессию
          session.messageCount++;
          session.lastMessage = text;
          session.lastSeen = Date.now();
          
          await SESSIONS.put(sessionKey, JSON.stringify(session), {
            expirationTtl: 86400 // 24 часа
          });
          
          // Отправляем ответ от Dify пользователю
          await sendMessage(chatId, difyResponse, BOT_TOKEN);
        }
        
        return new Response("OK", { status: 200 });
      } catch (error) {
        console.error("Error:", error);
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

// Функция для отправки запроса в Dify
async function queryDify(question, userId, apiKey) {
  const url = "https://api.dify.ai/v1/chat-messages";
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      inputs: {},
      query: question,
      response_mode: "blocking",
      conversation_id: "",
      user: `telegram_${userId}`,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Dify API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.answer || "Не удалось получить ответ от базы знаний";
}
