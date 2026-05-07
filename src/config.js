// Загружаем переменные окружения из файла .env
import 'dotenv/config'

// Объект конфигурации приложения
// Содержит все основные настройки, используемые в проекте
const config = {
  // Порт, на котором будет запущен сервер (по умолчанию 3000)
  port: process.env.PORT || 3000,

  // Настройки для подключения к Supabase
  supabase: {
    // URL проекта Supabase
    url: process.env.SUPABASE_URL,
    // Публичный ключ (anon key) для доступа к Supabase
    anonKey: process.env.SUPABASE_ANON_KEY,
  },

  // Настройки CORS (Cross-Origin Resource Sharing)
  cors: {
    // Разрешённый источник запросов (фронтенд)
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    // Разрешить передачу учётных данных (cookies, заголовки авторизации)
    credentials: true,
  },

  // Окружение: development, production и т.д.
  nodeEnv: process.env.NODE_ENV || 'development',
}

// Экспортируем конфигурацию для использования во всём приложении
export default config