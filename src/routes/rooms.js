// Импорт Router из Express для создания модульных маршрутов
import { Router } from 'express'
// Импорт всех функций контроллера для работы с комнатами
import * as roomController from '../controllers/roomController.js'
// Импорт middleware для проверки JWT токена
import authenticate from '../middleware/authenticate.js'
// Импорт универсальной функции валидации
import { validate } from '../validators/auth.js'
// Импорт схемы валидации для создания комнаты
import { createRoomSchema } from '../validators/room.js'

const router = Router()

// GET /rooms - получить список всех комнат (публичный доступ)
router.get('/', roomController.getRooms)
// GET /rooms/my — получить список ID комнат текущего пользователя (требуется авторизация)
router.get('/my', authenticate, roomController.getMyRooms)
// GET /rooms/:id - получить комнату по ID (публичный доступ)
router.get('/:id', roomController.getRoomById)
// POST /rooms - создать новую комнату. Требуется авторизация и валидация названия
router.post('/', authenticate, validate(createRoomSchema), roomController.createRoom)
// DELETE /rooms/:id - удалить комнату (требуется авторизация)
router.delete('/:id', authenticate, roomController.deleteRoom)
// POST /rooms/:id/join - вступить в комнату (требуется авторизация)
router.post('/:id/join', authenticate, roomController.joinRoom)
// DELETE /rooms/:id/leave - покинуть комнату (требуется авторизация)
router.delete('/:id/leave', authenticate, roomController.leaveRoom)

export default router