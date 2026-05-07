// Импортируем функцию создания клиента Supabase из официального SDK
import { createClient } from '@supabase/supabase-js'

// Импортируем объект конфигурации с настройками Supabase
import config from '../config.js'

// Создаём и настраиваем клиент Supabase
// Передаём URL проекта и публичный ключ (anon key)
const supabase = createClient(config.supabase.url, config.supabase.anonKey)

// Экспортируем готовый экземпляр клиента для использования во всём приложении
export default supabase