const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BOT_TOKEN = process.env.BOT_TOKEN;

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const webAppUrl = 'https://dimadvoia.github.io/restapp/';

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Добро пожаловать!', {
        reply_markup: {
            keyboard: [[{ text: 'Открыть приложение', web_app: { url: 'https://dimadvoia.github.io/restapp/' } }]],
            resize_keyboard: true
        }
    });
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
                            web_app: { url: 'https://dimadvoia.github.io/restapp/' }
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