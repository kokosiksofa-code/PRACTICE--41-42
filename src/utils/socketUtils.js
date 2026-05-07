// Импорт клиента Prisma для работы с базой данных
import prisma from "../prisma/prismaClient.js";
// Импорт кастомного класса ошибок
import AppError from "./appError.js";

// Поиск пользователя по supabaseId для получения внутреннего ID пользователя из токена Supabase
export async function getUserBySupabaseId(supabaseId) {
    // Ищем пользователя в таблице users по полю supabase_id
    const user = await prisma.user.findUnique({ where: { supabaseId } });
    // Если пользователь не найден — выбрасываем ошибку 404
    if (!user) throw new AppError("Пользователь не найден", 404);
    // Возвращаем найденного пользователя
    return user;
}