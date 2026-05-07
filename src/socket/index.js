// Импорт middleware аутентификации для WebSocket
import socketAuthenticate from "./authenticate.js";
// Импорт обработчиков комнат (вход/выход)
import {
    handleJoinRoom,
    handleLeaveRoom,
} from "./handlers/roomHandler.js";
// Импорт обработчиков сообщений и отключения
import {
    handleSendMessage,
    handleDisconnect,
} from "./handlers/messageHandler.js";

// Функция инициализации WebSocket сервера
export default function initializeSocket(io) {
    // Создаём пространство имён (namespace) /chat
    const chatNamespace = io.of("/chat");
    // Подключаем middleware аутентификации для всех сокетов в /chat
    chatNamespace.use((socket, next) => {
        socketAuthenticate(socket, next);
    });

    // Обработчик нового подключения
    chatNamespace.on("connection", (socket) => {
        // Подписка на событие входа в комнату
        socket.on("room:join", handleJoinRoom(socket, chatNamespace));
        // Подписка на событие выхода из комнаты
        socket.on("room:leave", handleLeaveRoom(socket, chatNamespace));

        // Подписка на событие отправки сообщения
        socket.on("message:send", handleSendMessage(socket, chatNamespace));

        // Подписка на событие отключения пользователя
        socket.on("disconnect", handleDisconnect(socket, chatNamespace));

        // Обработчик ошибок сокета
        socket.on("error", (error) => {
            return;   // Ошибки обрабатываются в конкретных обработчиках
        });
    });
}