// Импорт клиента Prisma и кастомного класса ошибок
import prisma from '../prisma/prismaClient.js'
import AppError from '../utils/appError.js'

// Поиск пользователя по supabaseId
async function getUserBySupabaseId(supabaseId) {
    const user = await prisma.user.findUnique({ where: { supabaseId } })
    if (!user) throw new AppError('Пользователь не найден', 404)
    return user
}

// Получить список всех комнат (отсортированы по дате создания)
export async function getRooms() {
    return prisma.room.findMany({
        orderBy: { createdAt: 'desc' }, // новые комнаты первыми
    })
}

// Получить список ID комнат, в которых состоит пользователь
export async function getMyRooms(supabaseId) {
    // Находим пользователя по supabaseId (из JWT токена)
    const user = await getUserBySupabaseId(supabaseId)
    // Ищем все записи участия пользователя в комнатах
    const members = await prisma.roomMember.findMany({
        where: { userId: user.id },   // Фильтр по ID пользователя
        select: { roomId: true },     // Берём только ID комнат
    })
    // Возвращаем массив ID комнат
    return members.map((m) => m.roomId)
}

// Получить одну комнату по ID
export async function getRoomById(id) {
    const room = await prisma.room.findUnique({ where: { id } })
    if (!room) throw new AppError('Комната не найдена', 404)
    return room
}

// Создать новую комнату и автоматически добавить создателя в участники
export async function createRoom(name, supabaseId) {
    const user = await getUserBySupabaseId(supabaseId)
    // Проверка уникальности названия комнаты
    const existing = await prisma.room.findUnique({ where: { name } })
    if (existing) throw new AppError('Комната с таким названием уже существует', 400)
    // Создаём комнату
    const room = await prisma.room.create({ data: { name } })
    // Добавляем создателя в участники комнаты
    await prisma.roomMember.create({ data: { roomId: room.id, userId: user.id } })
    return room
}

// Удалить комнату по ID (связанные сообщения и участники удалятся каскадно)
export async function deleteRoom(id) {
    const room = await prisma.room.findUnique({ where: { id } })
    if (!room) throw new AppError('Комната не найдена', 404)
    await prisma.room.delete({ where: { id } })
}

// Вступить в комнату
export async function joinRoom(roomId, supabaseId) {
    const user = await getUserBySupabaseId(supabaseId)
    // Проверяем, существует ли комната
    const room = await prisma.room.findUnique({ where: { id: roomId } })
    if (!room) throw new AppError('Комната не найдена', 404)

    // Проверяем, не состоит ли пользователь уже в этой комнате
    const existing = await prisma.roomMember.findUnique({ 
        where: { userId_roomId: { userId: user.id, roomId } } 
    })
    if (existing) return existing

    // Добавляем пользователя в комнату
    return prisma.roomMember.create({ data: { roomId, userId: user.id } })
}

// Покинуть комнату
export async function leaveRoom(roomId, supabaseId) {
    const user = await getUserBySupabaseId(supabaseId)
    // Проверяем, состоит ли пользователь в комнате
    const member = await prisma.roomMember.findUnique({ 
        where: { userId_roomId: { userId: user.id, roomId } } 
    })
    if (!member) throw new AppError('Вы не в этой комнате', 400)
    // Удаляем запись об участии
    await prisma.roomMember.delete({ where: { userId_roomId: { userId: user.id, roomId } } })
}