// Импорт фреймворка Express
import express from 'express'
// Helmet - middleware для защиты HTTP заголовков
import helmet from 'helmet'
// CORS - middleware для настройки Cross-Origin Resource Sharing
import cors from 'cors'
// Rate Limit - middleware для ограничения количества запросов
import rateLimit from 'express-rate-limit'
// Импорт конфигурации приложения
import config from './config.js'
// Глобальный обработчик ошибок
import errorHandler from './middleware/errorHandler.js'
// Импорт роутеров для разных частей API
import authRouter from './routes/auth.js'
import roomsRouter from './routes/rooms.js'
import messagesRouter from './routes/messages.js'
// Импорт Swagger для документации API
import { swaggerUi, spec } from '../docs/swagger.js'

// Создание экземпляра Express приложения
const app = express()

// Настройка ограничения количества запросов (rate limiting)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100,                 // максимум 100 запросов с одного IP
})

// Подключение helmet с настройками Content Security Policy (CSP)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            // Разрешённые источники для скриптов: свой домен, Tailwind CSS CDN и локальный сервер
            scriptSrc: ["'self'", "https://cdn.tailwindcss.com", "http://localhost:3000"],
            // Разрешённые источники для изображений: свой домен и data: URI
            imgSrc: ["'self'", "data:"],
        },
    }
}))

// Настройка CORS из конфигурации
app.use(cors(config.cors))
// Парсинг JSON тела запросов
app.use(express.json())
// Раздача статических файлов из папки public (HTML, CSS, JS фронтенда)
app.use(express.static('public'))
// Маршруты аутентификации с ограничением частоты запросов
app.use('/api/auth', limiter, authRouter)
// Маршруты для работы с комнатами
app.use('/api/rooms', roomsRouter)
// Маршруты для работы с сообщениями (вложены в rooms)
app.use('/api/rooms', messagesRouter)
// Swagger документация API
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec))
// Глобальный обработчик ошибок (должен быть последним)
app.use(errorHandler)

// Экспорт настроенного Express приложения
export default app