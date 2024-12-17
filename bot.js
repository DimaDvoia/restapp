const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = 'http://localhost:3000';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Обработчик команды /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name;
    
    const keyboard = {
        reply_markup: {
            inline_keyboard: [[
                {
                    text: '🚀 Открыть приложение',
                    web_app: { url: WEBAPP_URL }
                }
            ]],
            keyboard: [[
                {
                    text: '📱 Поделиться номером телефона',
                    request_contact: true
                }
            ]],
            resize_keyboard: true
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

async function sendBookingNotification(chatId, bookingDetails) {
    const message = `
🎉 Бронирование подтверждено!

📅 Дата: ${bookingDetails.booking_date}
⏰ Время: ${bookingDetails.booking_time}
👥 Гости: ${bookingDetails.guests_count}
🪑 Стол: ${bookingDetails.table_number}
📍 Этаж: ${bookingDetails.stage}

Ждем вас в гости!
`;

    await bot.sendMessage(chatId, message);
}

console.log('Бот успешно запущен! 🚀'); 