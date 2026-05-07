// Импорт всех функций из сервиса для работы с сообщениями
import * as messageService from '../services/messageService.js'

// Получить все сообщения конкретной комнаты
export async function getMessages(req, res, next) {
    try {
        // Вызываем сервис, передавая ID комнаты из параметров URL
        const messages = await messageService.getMessages(req.params.id)
        // Возвращаем массив сообщений с кодом 200
        res.status(200).json({ messages })
    } catch (error) {
        // Передаём ошибку в глобальный обработчик
        next(error)
    }
}