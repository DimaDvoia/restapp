const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Токен бота теперь берём из переменных окружения
const BOT_TOKEN = process.env.BOT_TOKEN;
// URL вашего веб-приложения
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://your-webapp-url.com';

// Создаем экземпляр бота
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Обработчик команды /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    
    const keyboard = {
        inline_keyboard: [[
            {
                text: 'Открыть приложение',
                web_app: { url: WEBAPP_URL }
            }
        ]]
    };
    
    await bot.sendMessage(chatId, 
        'Привет! Нажми на кнопку ниже, чтобы открыть приложение:', 
        { reply_markup: keyboard }
    );
});

console.log('Бот запущен...'); 