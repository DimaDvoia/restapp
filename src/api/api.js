// Убедитесь, что URL берется из .env
const API_URL = import.meta.env.VITE_API_URL;

// Используйте этот URL для запросов
const getCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/menu/categories`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка при загрузке категорий:', error);
    throw new Error('Ошибка загрузки меню: ' + error.message);
  }
}; 