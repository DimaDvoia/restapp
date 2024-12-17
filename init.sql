CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    first_name VARCHAR(255),
    phone_number VARCHAR(20),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица категорий меню
CREATE TABLE IF NOT EXISTS menu_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(10) -- для эмодзи
);

-- Таблица блюд
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES menu_categories(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица столов
CREATE TABLE IF NOT EXISTS tables (
    id SERIAL PRIMARY KEY,
    number VARCHAR(10) NOT NULL,
    stage VARCHAR(10) NOT NULL,
    guests_number_min INTEGER NOT NULL,
    guests_number_max INTEGER NOT NULL,
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true
);

-- Таблица бронирований
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    table_id INTEGER REFERENCES tables(id),
    user_id INTEGER REFERENCES users(id),
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    guests_count INTEGER NOT NULL,
    occasion VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставляем категории меню
INSERT INTO menu_categories (name, icon) VALUES
('Холодные закуски', '🥗'),
('Салаты', '🥬'),
('Горячие закуски', '🍲'),
('Мангал', '🥩'),
('Супы', '🍜'),
('Горячие блюда', '🍖'),
('Десерты', '🍰'); 