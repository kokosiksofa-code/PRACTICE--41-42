// Импортируем библиотеку Zod для валидации данных
import { z } from 'zod'

// Схема валидации для создания сообщения
export const createMessageSchema = z.object({
  // Поле content должно быть строкой
  content: z.string().min(1).max(2000),
})