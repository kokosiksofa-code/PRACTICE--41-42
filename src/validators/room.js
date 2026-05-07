// Импортируем библиотеку Zod для валидации данных
import { z } from 'zod'

// Схема валидации для создания комнаты
export const createRoomSchema = z.object({
  // Поле name должно быть строкой
  name: z.string().min(1).max(100),
})