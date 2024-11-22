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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 