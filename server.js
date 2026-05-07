// Загрузка переменных окружения из файла .env
import "dotenv/config";
// Импорт HTTP сервера из Node.js (основа для WebSocket)
import { createServer } from "http";
// Импорт Socket.IO сервера
import { Server } from "socket.io";
// Импорт настроенного Express приложения
import app from "./src/app.js";
// Импорт конфигурации (порт и другие настройки)
import config from "./src/config.js";
// Импорт функции инициализации WebSocket обработчиков
import initializeSocket from "./src/socket/index.js";

const startServer = async () => {
    try {
        // Создаём HTTP сервер на основе Express приложения
        const httpServer = createServer(app);
        // Создаём экземпляр Socket.IO сервера
        const io = new Server(httpServer, {
            cors: { origin: config.cors.origin },   // Настройка CORS для WebSocket
        });

        // Сохраняем io в объекте app для доступа из контроллеров (если нужно)
        app.set("io", io);

        // Инициализируем все WebSocket обработчики (чат, сообщения, комнаты)
        initializeSocket(io);

        // Запускаем HTTP сервер на указанном порту
        httpServer.listen(config.port, () => {
            console.log(`Сервер запущен на порту http://localhost:${config.port}`);
            console.log(`Документация доступна на http://localhost:${config.port}/api/docs`);
        });
    } catch (err) {
        // Обработка ошибок при запуске сервера
        console.error("Не удалось запустить сервер:", err);
    }
};

// Запуск сервера
startServer();