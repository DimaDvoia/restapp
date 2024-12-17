-- Добавляем столбцы по одному
ALTER TABLE tables 
    ADD COLUMN IF NOT EXISTS number VARCHAR(10) NOT NULL DEFAULT '1',
    ADD COLUMN IF NOT EXISTS stage VARCHAR(10) NOT NULL DEFAULT '1',
    ADD COLUMN IF NOT EXISTS guests_number_min INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS guests_number_max INTEGER NOT NULL DEFAULT 4,
    ADD COLUMN IF NOT EXISTS image_url VARCHAR(255),
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Обновляем существующие записи, если нужно
UPDATE tables 
SET 
    number = COALESCE(number, '1'),
    stage = COALESCE(stage, '1'),
    guests_number_min = COALESCE(guests_number_min, 1),
    guests_number_max = COALESCE(guests_number_max, 4),
    is_active = COALESCE(is_active, true); 