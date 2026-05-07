// Импорт сервиса сообщений для создания сообщений в БД
import * as messageService from "../../services/messageService.js";
// Импорт клиента Prisma для проверки участия в комнате
import prisma from "../../prisma/prismaClient.js";
// Импорт вспомогательной функции поиска пользователя
import { getUserBySupabaseId } from "../../utils/socketUtils.js";

// Обработчик отправки сообщения через WebSocket
export function handleSendMessage(socket, chatNamespace) {
    return async (roomId, content) => {  // принимаем два аргумента
        try {
            if (!content || content.trim() === "") {
                return socket.emit("error", { message: "Сообщение не может быть пустым" });
            }

            // Получаем пользователя по supabaseId из данных сокета
            const user = await getUserBySupabaseId(socket.data.user.sub);

            // Проверяем, состоит ли пользователь в комнате
            const member = await prisma.roomMember.findUnique({
                where: { userId_roomId: { userId: user.id, roomId } },
            });

            if (!member) {
                return socket.emit("error", { message: "Вы не являетесь участником этой комнаты" });
            }

            const message = await messageService.createMessage(
                roomId,
                socket.data.user.sub,
                content,
            );

            chatNamespace.to(roomId).emit("message:receive", {
                id: message.id,
                content: message.content,
                senderId: message.sender.id,
                senderName: message.sender.name || message.sender.email,
                createdAt: message.createdAt,
                roomId,
            });
        } catch (error) {
            socket.emit("error", { message: error.message });
        }
    };
}

// Обработчик отключения пользователя от WebSocket
export function handleDisconnect(socket, chatNamespace) {
    return async () => {
        try {
            const user = socket.data.user;
            // Если пользователь определён — обрабатываем отключение
            if (user) {
                const dbUser = await getUserBySupabaseId(user.sub);
                
                // Находим все комнаты, в которых состоит пользователь
                const memberRooms = await prisma.roomMember.findMany({
                    where: { userId: dbUser.id },
                    select: { roomId: true },
                });

                // Оповещаем каждую комнату, что пользователь ушёл офлайн
                for (const member of memberRooms) {
                    chatNamespace.to(member.roomId).emit("user:offline", {
                        userId: dbUser.id,
                        username: user.name || user.email,
                    });
                }
            }
        } catch (error) {
            return;
        }
    };
}