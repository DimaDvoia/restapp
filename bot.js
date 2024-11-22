const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://dimadvoia.github.io/restapp/';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Обработчик команды /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name;
    
    const keyboard = {
        inline_keyboard: [[
            {
                text: '🚀 Открыть приложение',
                web_app: { url: WEBAPP_URL }
            }
        ]]
    };
    
    const welcomeMessage = `
👋 Привет, ${firstName}!

Я бот, который поможет тебе открыть наше мини-приложение. 
Просто нажми на кнопку ниже, чтобы начать! 🎉

💡 Ты сможешь:
• Просматривать контент
• Взаимодействовать с приложением
• И многое другое!
    `;
    
    await bot.sendMessage(chatId, welcomeMessage, { 
        reply_markup: keyboard,
        parse_mode: 'HTML'
    });
});

console.log('Бот успешно запущен! 🚀'); 