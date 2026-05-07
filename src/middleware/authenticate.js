// Импортируем функции для работы с JWT из библиотеки jose
import { createRemoteJWKSet, jwtVerify } from "jose";
// Импортируем конфигурацию приложения
import config from "../config.js";
// Импортируем класс для создания ошибок
import AppError from "../utils/appError.js";

// Создаём набор удалённых JWKS (JSON Web Key Set)
// Используется для проверки подписи JWT токена
const JWKS = createRemoteJWKSet(
  new URL(`${config.supabase.url}/auth/v1/.well-known/jwks.json`),
);

// Издатель токена (issuer) - должен совпадать с тем, что в токене
const ISSUER = `${config.supabase.url}/auth/v1`;

// Middleware для проверки аутентификации пользователя
export default async function authenticate(req, res, next) {
  // Получаем заголовок Authorization из запроса
  const authHeader = req.headers.authorization;

  // Проверяем, что заголовок существует и начинается с "Bearer "
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("Вы не авторизованы", 401));
  }

  // Извлекаем сам токен (убираем "Bearer ")
  const token = authHeader.slice(7).trim();

  try {
    // Проверяем JWT токен
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: ISSUER,           // Проверяем издателя
      audience: "authenticated", // Проверяем аудиторию
    });

    // Сохраняем данные пользователя в объект запроса
    req.user = payload;
    
    // Передаём управление следующему middleware
    next();
  } catch (err) {
    // Если проверка не прошла - логируем ошибку
    console.error("JWT verify error:", err?.message);
    
    // Возвращаем ошибку 401 (не авторизован)
    return next(new AppError("Недействительный или истёкший токен", 401));
  }
}