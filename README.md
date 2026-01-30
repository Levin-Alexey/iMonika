# Telegram Echo Bot для Cloudflare Workers

Простой эхо-бот для Telegram, который отвечает тем же сообщением, которое получает.

## Настройка

1. **Создайте Telegram бота:**
   - Напишите [@BotFather](https://t.me/botfather) в Telegram
   - Используйте команду `/newbot`
   - Следуйте инструкциям и получите токен

2. **Установите Wrangler CLI:**
   ```bash
   npm install -g wrangler
   ```

3. **Авторизуйтесь в Cloudflare:**
   ```bash
   wrangler login
   ```

4. **Добавьте токен бота в секреты:**
   ```bash
   wrangler secret put BOT_TOKEN
   ```
   Введите ваш токен от BotFather

5. **Разверните на Cloudflare Workers:**
   ```bash
   wrangler deploy
   ```

6. **Настройте webhook:**
   После развертывания вы получите URL (например, `https://telegram-echo-bot.your-subdomain.workers.dev`)
   
   Установите webhook:
   ```bash
   curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook \
   -H "Content-Type: application/json" \
   -d '{"url": "https://telegram-echo-bot.your-subdomain.workers.dev"}'
   ```

## Использование

Просто напишите боту любое сообщение, и он ответит тем же текстом!

## Структура проекта

- `index.js` - основной код worker'а
- `wrangler.toml` - конфигурация Cloudflare Workers
