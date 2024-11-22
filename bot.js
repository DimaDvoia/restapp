const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const fetch = require('node-fetch');

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://dimadvoia.github.io/restapp/';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Обработчик команды /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name;
    
    const keyboard = {
        reply_markup: {
            keyboard: [[
                {
                    text: '📱 Поделиться номером телефона',
                    request_contact: true
                }
            ]],
            resize_keyboard: true,
            inline_keyboard: [[
                {
                    text: '🚀 Открыть приложение',
                    web_app: { url: WEBAPP_URL }
                }
            ]]
        }
    };
    
    const welcomeMessage = `
👋 Привет, ${firstName}!

Я бот ресторана баранжар, который поможет тебе открыть наше мини-приложение. 
Для полного доступа, пожалуйста, поделись своим номером телефона 📱

💡 После этого ты сможешь:
• Просматривать меню
• Забронировать стол
• Сделать заказ на вынос
• Взаимодействовать с руководством 
• И многое другое!
    `;
    
    await bot.sendMessage(chatId, welcomeMessage, keyboard);
});

// Обработчик получения контакта
bot.on('contact', async (msg) => {
    const chatId = msg.chat.id;
    const phoneNumber = msg.contact.phone_number;
    const userId = msg.from.id;
    const firstName = msg.from.first_name;

    try {
        // Отправляем данные на сервер
        const response = await fetch(`${process.env.SERVER_URL}/api/update-phone`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                telegram_id: userId,
                phone_number: phoneNumber,
                first_name: firstName
            })
        });

        if (response.ok) {
            // Отправляем новое сообщение с кнопкой приложения
            const newKeyboard = {
                reply_markup: {
                    inline_keyboard: [[
                        {
                            text: '🚀 Открыть приложение',
                            web_app: { url: WEBAPP_URL }
                        }
                    ]],
                    remove_keyboard: true
                }
            };
            
            await bot.sendMessage(chatId, 'Спасибо! Теперь у вас есть полный доступ к функциям приложения 🎉', newKeyboard);
        }
    } catch (error) {
        console.error('Error updating phone number:', error);
        await bot.sendMessage(chatId, 'Произошла ошибка при сохранении номера телефона. Пожалуйста, попробуйте позже.');
    }
});

console.log('Бот успешно запущен! 🚀'); 