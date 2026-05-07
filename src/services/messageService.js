// Импортируем клиент Prisma для работы с базой данных
import prisma from '../prisma/prismaClient.js'
// Импортируем класс для создания ошибок
import AppError from '../utils/appError.js'

// Вспомогательная функция для поиска пользователя по supabaseId
async function getUserBySupabaseId(supabaseId) {
  // Ищем пользователя в базе данных по supabaseId
  const user = await prisma.user.findUnique({ where: { supabaseId } })
  // Если пользователь не найден - выбрасываем ошибку 404
  if (!user) throw new AppError('Пользователь не найден', 404)
  return user
}

// Получение всех сообщений комнаты
export async function getMessages(roomId) {
  // Проверяем, существует ли комната
  const room = await prisma.room.findUnique({ where: { id: roomId } })
  if (!room) throw new AppError('Комната не найдена', 404)

  // Возвращаем все сообщения комнаты
  return prisma.message.findMany({
    where: { roomId },                          // Фильтр по комнате
    orderBy: { createdAt: 'asc' },              // Сортировка по возрастанию даты
    include: {                                   // Включаем данные отправителя
      sender: {
        select: { id: true, name: true, email: true } } },
  })
}

// Создание нового сообщения
export async function createMessage(roomId, supabaseId, content) {
  // Находим пользователя
  const user = await getUserBySupabaseId(supabaseId)
  
  // Проверяем, состоит ли пользователь в комнате
  const member = await prisma.roomMember.findUnique({
    where: { userId_roomId: { userId: user.id, roomId } },
  })
  if (!member) throw new AppError('Вы не являетесь участником этой комнаты', 403)

  // Создаём новое сообщение
  return prisma.message.create({
    data: {
      roomId,           // ID комнаты
      senderId: user.id, // ID отправителя
      content,          // Текст сообщения
    },
    include: {          // Включаем данные отправителя в ответ
      sender: {
        select: { id: true, name: true, email: true }
      }
    },
  })
}