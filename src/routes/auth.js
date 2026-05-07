// Импорт Router из Express для создания модульных маршрутов
import { Router } from 'express'
// Импорт всех функций контроллера аутентификации
import * as authController from '../controllers/authController.js'
// Импорт middleware для проверки JWT токена
import authenticate from '../middleware/authenticate.js'
// Импорт функции валидации и схем для регистрации и входа
import { validate, registerSchema, loginSchema } from '../validators/auth.js'

// Создание экземпляра роутера
const router = Router()

// Маршрут для регистрации нового пользователя
router.post('/register', validate(registerSchema), authController.register)
// Маршрут для входа пользователя в систему
router.post('/login', validate(loginSchema), authController.login)
// Маршрут для выхода пользователя из системы
router.post('/logout', authenticate, authController.logout)
// Маршрут для получения данных текущего авторизованного пользователя
router.get('/me', authenticate, authController.getMe)

// Экспорт роутера для подключения в основном файле приложения (app.js)
export default router