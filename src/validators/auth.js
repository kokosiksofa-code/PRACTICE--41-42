// Импорт библиотеки Zod для валидации данных
import { z } from "zod";
// Импорт кастомного класса ошибок
import AppError from "../utils/appError.js";

// Универсальная функция-валидатор, принимает схему Zod
export function validate(schema) {
    return (req, res, next) => {
        // Безопасная проверка данных из тела запроса
        const result = schema.safeParse(req.body);
        // Если валидация НЕ прошла (ошибки в данных)
        if (!result.success) {
           // Безопасно извлекаем текст первой ошибки или сообщение по умолчанию
           const errorMessage = result.error?.errors?.[0]?.message || "Invalid request data";
           // Передаём ошибку 400 в глобальный обработчик
           return next(new AppError(errorMessage, 400));
        }
        // Если всё хорошо, заменяем req.body на очищенные и валидированные данные
        req.body = result.data;
        next();
    };
}
// Схема валидации для регистрации пользователя
export const registerSchema = z.object({
    // Email должен быть корректным адресом электронной почты
    email: z.email(),
    // Пароль должен быть строкой длиной минимум 8 символов
    password: z.string().min(8),
    // Имя опционально, но если указано - не должно быть пустым
    name: z.string().min(1).optional(),
});
// Схема валидации для входа пользователя
export const loginSchema = z.object({
    // Email должен быть корректным адресом электронной почты
    email: z.email(),
    // Пароль должен быть строкой длиной минимум 8 символов
    password: z.string().min(8),
});