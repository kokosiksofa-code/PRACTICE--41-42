// Импорт всех функций из сервиса для работы с комнатами
import * as roomService from '../services/roomService.js'

// Получить список всех комнат
export async function getRooms(req, res, next) {
    try {
        const rooms = await roomService.getRooms()
        res.status(200).json({ rooms })
    } catch (error) {
        next(error)
    }
}

// Контроллер для получения списка ID комнат текущего пользователя
export async function getMyRooms(req, res, next) {
    try {
        // Вызываем сервис, передавая supabaseId пользователя из JWT токена
        const roomIds = await roomService.getMyRooms(req.user.sub)
        // Возвращаем массив ID комнат
        res.status(200).json({ roomIds })
    } catch (error) {
        // Передаём ошибку в глобальный обработчик
        next(error)
    }
}

// Получить одну комнату по ID (из параметров URL)
export async function getRoomById(req, res, next) {
    try {
        const room = await roomService.getRoomById(req.params.id)
        res.status(200).json({ room })
    } catch (error) {
        next(error)
    }
}

// Создать новую комнату
export async function createRoom(req, res, next) {
    try {
        const room = await roomService.createRoom(req.body.name, req.user.sub)
        res.status(201).json({ room })
    } catch (error) {
        next(error)
    }
}

// Удалить комнату по ID
export async function deleteRoom(req, res, next) {
    try {
        await roomService.deleteRoom(req.params.id)
        res.status(204).send() // 204 No Content - успешное удаление без тела ответа
    } catch (error) {
        next(error)
    }
}

// Вступить в комнату
export async function joinRoom(req, res, next) {
    try {
        await roomService.joinRoom(req.params.id, req.user.sub)
        res.status(200).json({ message: 'Вы вошли в комнату' })
    } catch (error) {
        next(error)
    }
}

// Покинуть комнату
export async function leaveRoom(req, res, next) {
    try {
        await roomService.leaveRoom(req.params.id, req.user.sub)
        res.status(200).json({ message: 'Вы покинули комнату' })
    } catch (error) {
        next(error)
    }
}