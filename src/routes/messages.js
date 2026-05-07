// Импорт Router из Express для создания модульных маршрутов
import { Router } from 'express'
// Импорт всех функций контроллера для работы с сообщениями
import * as messageController from '../controllers/messageController.js'
// Импорт middleware для проверки JWT токена
import authenticate from '../middleware/authenticate.js'

// Создание экземпляра роутера
const router = Router()

// GET /rooms/:id/messages — получить все сообщения комнаты
router.get('/:id/messages', authenticate, messageController.getMessages)

// Экспорт роутера для подключения в основном файле приложения (app.js)
export default router