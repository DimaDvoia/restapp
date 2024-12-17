// Убедитесь, что URL берется из .env
const API_URL = import.meta.env.VITE_API_URL;

// Используйте этот URL для запросов
const getCategories = async () => {
  const response = await fetch(`${API_URL}/menu/categories`);
  return response.json();
}; 