// Импорт сервиса комнат для управления участием
import * as roomService from "../../services/roomService.js";
// Импорт клиента Prisma для запросов к БД
import prisma from "../../prisma/prismaClient.js";
// Импорт вспомогательной функции поиска пользователя
import { getUserBySupabaseId } from "../../utils/socketUtils.js";

// Обработчик присоединения к комнате через WebSocket
export function handleJoinRoom(socket, chatNamespace) {
    return async (roomId) => {
        try {
            // Получаем пользователя по supabaseId из данных сокета
            const user = await getUserBySupabaseId(socket.data.user.sub);

            // Добавляем пользователя в комнату через сервис
            await roomService.joinRoom(roomId, socket.data.user.sub);

            // Подписываем сокет на события комнаты
            socket.join(roomId);

            // Получаем список всех участников комнаты из БД
            const members = await prisma.roomMember.findMany({
                where: { roomId },
                include: { user: { select: { id: true, name: true, email: true } } },
            });

            // Отправляем текущему пользователю список участников
            socket.emit("room:users", members.map((m) => m.user));

            // Оповещаем остальных участников, что пользователь вошёл в комнату
            socket.to(roomId).emit("user:online", {
                userId: user.id,
                username: user.name || user.email,
            });

            // Подтверждаем пользователю успешное присоединение
            socket.emit("room:joined", { roomId });
        } catch (error) {
            // Отправляем ошибку клиенту
            socket.emit("error", { message: error.message });
        }
    };
}

// Обработчик выхода из комнаты через WebSocket
export function handleLeaveRoom(socket, chatNamespace) {
    return async (roomId) => {
        try {
            // Получаем пользователя по supabaseId
            const user = await getUserBySupabaseId(socket.data.user.sub);

            // Проверяем, состоит ли пользователь в комнате
            const member = await prisma.roomMember.findUnique({
                where: { userId_roomId: { userId: user.id, roomId } },
            });

            // Если не состоит — отправляем ошибку
            if (!member) {
                return socket.emit("error", { message: "Вы не в этой комнате" });
            }

            // Удаляем пользователя из комнаты через сервис (сохраняется в БД)
            await roomService.leaveRoom(roomId, socket.data.user.sub);

            // Отписываем сокет от событий комнаты
            socket.leave(roomId);

            // Оповещаем остальных участников, что пользователь покинул комнату
            socket.to(roomId).emit("user:offline", {
                userId: user.id,
                username: user.name || user.email,
            });

            // Подтверждаем пользователю успешный выход
            socket.emit("room:left", { roomId });
        } catch (error) {
          // Отправляем ошибку клиенту
          socket.emit("error", { message: error.message });
        }
    };
}