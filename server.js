const express = require('express');
const db = require('./db');
const app = express();
const path = require('path');
const multer = require('multer');
const cors = require('cors');

app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Добавьте CORS middleware
app.use(cors());

// Добавьте маршрут для index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

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

// Обновляем endpoint для получения категорий
app.get('/api/menu/categories', async (req, res) => {
    try {
        console.log('Запрос категорий меню...');
        // Устанавливаем правильные заголовки
        res.setHeader('Content-Type', 'application/json');
        
        const categories = await db.query('SELECT * FROM menu_categories ORDER BY id');
        console.log('Полученные категории:', categories.rows);
        
        if (!categories.rows || categories.rows.length === 0) {
            console.log('Категории не найдены');
            return res.status(404).json({ error: 'Категории не найдены' });
        }
        
        res.json(categories.rows);
    } catch (error) {
        console.error('Ошибка при получении категорий:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
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

// Получение доступных столов
app.post('/api/tables/available', async (req, res) => {
    try {
        const { date, time, guests } = req.body;
        
        // Получаем столы, подходящие по количеству гостей
        const tables = await db.query(
            `SELECT * FROM tables 
             WHERE guests_number_min <= $1 
             AND guests_number_max >= $1
             ORDER BY stage, number`,
            [guests]
        );
        
        // Здесь можно добавить дополнительную логику проверки занятости столов
        // на конкретную дату и время
        
        res.json(tables.rows);
    } catch (error) {
        console.error('Error fetching available tables:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Бронирование стола
app.post('/api/tables/book', async (req, res) => {
    try {
        const { tableId, date, time, guests, occasion, userId } = req.body;
        
        // Здесь будет логика сохранения бронирования
        // и проверки доступности стола
        
        res.json({ success: true, message: 'Стол успешно забронирован' });
    } catch (error) {
        console.error('Error booking table:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Проверка доступности столов
app.post('/api/tables/check-availability', async (req, res) => {
    try {
        const { date, time, guests_count } = req.body;

        // Получаем все столы, подходящие по количеству гостей
        const availableTables = await db.query(
            `SELECT * FROM tables 
             WHERE guests_number_min <= $1 
             AND guests_number_max >= $1 
             AND is_active = true
             AND id NOT IN (
                 SELECT table_id FROM bookings 
                 WHERE booking_date = $2 
                 AND booking_time = $3 
                 AND status != 'cancelled'
             )
             ORDER BY stage, number`,
            [guests_count, date, time]
        );

        res.json(availableTables.rows);
    } catch (error) {
        console.error('Error checking table availability:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Создание бронирования
app.post('/api/bookings', async (req, res) => {
    try {
        const { 
            table_id, 
            user_id, 
            booking_date, 
            booking_time, 
            guests_count, 
            occasion 
        } = req.body;

        const newBooking = await db.query(
            `INSERT INTO bookings 
             (table_id, user_id, booking_date, booking_time, guests_count, occasion)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [table_id, user_id, booking_date, booking_time, guests_count, occasion]
        );

        res.json(newBooking.rows[0]);
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Получение бронирований пользователя
app.get('/api/bookings/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const bookings = await db.query(
            `SELECT b.*, t.number as table_number, t.stage
             FROM bookings b
             JOIN tables t ON b.table_id = t.id
             WHERE b.user_id = $1
             ORDER BY b.booking_date DESC, b.booking_time DESC`,
            [userId]
        );

        res.json(bookings.rows);
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Отмена бронирования
app.post('/api/bookings/:id/cancel', async (req, res) => {
    try {
        const { id } = req.params;
        
        const cancelledBooking = await db.query(
            `UPDATE bookings 
             SET status = 'cancelled'
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        res.json(cancelledBooking.rows[0]);
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 