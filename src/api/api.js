// Убедитесь, что URL берется из .env
const API_URL = import.meta.env.VITE_API_URL;
const tg = window.Telegram.WebApp;

// Используйте этот URL для запросов
const getCategories = async () => {
  try {
    // Добавляем инициализацию Telegram WebApp
    tg.ready();
    
    const response = await fetch(`${API_URL}/menu/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Добавляем заголовки для работы с Telegram WebApp
        'Telegram-WebApp-Version': tg.version
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка при загрузке категорий:', error);
    // Показываем ошибку в Telegram
    tg.showAlert('Ошибка загрузки меню: ' + error.message);
    throw error;
  }
};

export { getCategories }; 