// Импорт функций для работы с JWT токенами из библиотеки jose
import { createRemoteJWKSet, jwtVerify } from "jose";
// Импорт конфигурации для получения URL Supabase
import config from "../config.js";

// Создание набора публичных ключей (JWKS) для проверки подписи JWT
const JWKS = createRemoteJWKSet(
    new URL(`${config.supabase.url}/auth/v1/.well-known/jwks.json`),
);

// Издатель токена (issuer) — должен совпадать с указанным в токене
const ISSUER = `${config.supabase.url}/auth/v1`;

// Middleware для аутентификации WebSocket подключений
export default async function socketAuthenticate(socket, next) {
    // Извлекаем токен из handshake данных
    const token = socket.handshake.auth.token;
    // Если токен отсутствует — отклоняем подключение
    if (!token) {
        return next(new Error("Токен не предоставлен"));
    }

    try {
        // Проверяем токен: подпись через JWKS, издатель и аудитория
        const { payload } = await jwtVerify(token, JWKS, {
            issuer: ISSUER, // Проверяем издателя токена
            audience: "authenticated", // Токен должен быть для аутентифицированных пользователей
        });

        // Сохраняем данные пользователя в объекте сокета для дальнейшего использования
        socket.data.user = payload;
        // Продолжаем подключение
        next();
    } catch (err) {
        // Токен недействителен или истёк — отклоняем подключение
        return next(new Error("Недействительный или истекший токен"));
    }
}