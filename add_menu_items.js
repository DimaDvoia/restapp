const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Пример блюд для добавления
const menuItems = [
    // Холодные закуски (id: 1)
    {
        category_id: 1,
        name: "Ассорти мясное",
        description: "Буженина, ростбиф, язык отварной, хрен, горчица",
        price: 690,
        image_path: "assets/menu/meat_assorted.jpg" // Путь к локальному файлу
    },
    
    // Салаты (id: 2)
    {
        category_id: 2,
        name: "Греческий",
        description: "Свежие овощи, оливки, сыр фета, заправка",
        price: 450,
        image_path: "assets/menu/greek_salad.jpg"
    },

    // Горячие закуски (id: 3)
    {
        category_id: 3,
        name: "Хачапури по-аджарски",
        description: "Лодочка из теста с сыром сулугуни и яйцом",
        price: 490,
        image_path: "assets/menu/adjarian_khachapuri.jpg"
    }
];

// Функция для добавления блюда
async function addMenuItem(item) {
    try {
        const formData = new FormData();
        formData.append('category_id', item.category_id);
        formData.append('name', item.name);
        formData.append('description', item.description);
        formData.append('price', item.price);
        
        // Добавляем изображение, если оно существует
        if (fs.existsSync(item.image_path)) {
            const imageStream = fs.createReadStream(item.image_path);
            formData.append('image', imageStream);
        }

        const response = await fetch('http://localhost:3000/api/menu/items', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log(`✅ Добавлено блюдо: ${item.name}`);
        } else {
            const error = await response.text();
            console.error(`❌ Ошибка при добавлении блюда ${item.name}:`, error);
        }
    } catch (error) {
        console.error(`❌ Ошибка при добавлении ${item.name}:`, error.message);
    }
}

// Добавляем все блюда
async function addAllItems() {
    for (const item of menuItems) {
        await addMenuItem(item);
    }
}

// Запускаем добавление
addAllItems(); 