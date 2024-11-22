const express = require('express');
const db = require('./db');
const app = express();
const path = require('path');
const multer = require('multer');

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Добавьте маршрут для admin.html перед другими маршрутами
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Настройка multer для загрузки изображений
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'assets/menu/')
    },
    filename: function (req, file, cb) {
        // Генерируем уникальное имя файла
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

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

// Получить все категории меню
app.get('/api/menu/categories', async (req, res) => {
    try {
        const categories = await db.query('SELECT * FROM menu_categories ORDER BY id');
        res.json(categories.rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Получить блюда по категории
app.get('/api/menu/items/:categoryId', async (req, res) => {
    try {
        const { categoryId } = req.params;
        const items = await db.query(
            'SELECT * FROM menu_items WHERE category_id = $1 AND is_available = true ORDER BY name',
            [categoryId]
        );
        res.json(items.rows);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Добавить новое блюдо (для администратора)
app.post('/api/menu/items', upload.single('image'), async (req, res) => {
    try {
        const { category_id, name, description, price } = req.body;
        const image_url = `/assets/menu/${req.file.filename}`;

        const newItem = await db.query(
            'INSERT INTO menu_items (category_id, name, description, price, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [category_id, name, description, price, image_url]
        );
        res.json(newItem.rows[0]);
    } catch (error) {
        console.error('Error adding menu item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 