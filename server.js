const express = require('express');
const db = require('./db');
const app = express();

app.use(express.json());

app.post('/api/register', async (req, res) => {
    try {
        const { telegram_id, first_name, phone_number } = req.body;

        // Проверяем, существует ли пользователь
        const userExists = await db.query(
            'SELECT * FROM users WHERE telegram_id = $1',
            [telegram_id]
        );

        if (userExists.rows.length === 0) {
            // Если пользователь не существует, добавляем его
            const newUser = await db.query(
                'INSERT INTO users (telegram_id, first_name, phone_number) VALUES ($1, $2, $3) RETURNING *',
                [telegram_id, first_name, phone_number]
            );
            res.json(newUser.rows[0]);
        } else {
            res.json(userExists.rows[0]);
        }
    } catch (error) {
        console.error('Error in register endpoint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint для обновления номера телефона
app.post('/api/update-phone', async (req, res) => {
    try {
        const { telegram_id, phone_number, first_name } = req.body;
        
        console.log('Получены данные:', { telegram_id, phone_number, first_name });

        // Проверяем существование пользователя
        const userExists = await db.query(
            'SELECT * FROM users WHERE telegram_id = $1',
            [telegram_id]
        );

        let result;
        if (userExists.rows.length === 0) {
            // Создаем нового пользователя
            result = await db.query(
                'INSERT INTO users (telegram_id, phone_number, first_name) VALUES ($1, $2, $3) RETURNING *',
                [telegram_id, phone_number, first_name]
            );
            console.log('Создан новый пользователь:', result.rows[0]);
        } else {
            // Обновляем существующего пользователя
            result = await db.query(
                'UPDATE users SET phone_number = $1, first_name = $2 WHERE telegram_id = $3 RETURNING *',
                [phone_number, first_name, telegram_id]
            );
            console.log('Обновлен существующий пользователь:', result.rows[0]);
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error in update-phone endpoint:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 