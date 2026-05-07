// Импорт клиента Supabase для работы с аутентификацией
import supabase from '../utils/supabase.js'
// Импорт клиента Prisma для работы с базой данных
import prisma from '../prisma/prismaClient.js'
// Импорт кастомного класса ошибок
import AppError from '../utils/appError.js'

// Функция регистрации нового пользователя
export async function register(email, password, name) {
    // Регистрируем пользователя в Supabase Auth
    const { data, error } = await supabase.auth.signUp({ email, password })
    // Если произошла ошибка
    if (error) throw new AppError(error.message, 400)

    // Создаём запись пользователя в нашей локальной базе данных через Prisma
    const user = await prisma.user.create({
        data: {
            supabaseId: data.user.id,
            email,
            name,
        },
    })

    // Возвращаем созданного пользователя и сессию Supabase
    return { user, session: data.session }
}

// Функция входа пользователя в систему (авторизация)
export async function login(email, password) {
    // Аутентифицируем пользователя через Supabase
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    // Если произошла ошибка (неверный email или пароль) возвращаем общее сообщение
    if (error) throw new AppError('Неверный электронный адрес или пароль', 401)

    // Возвращаем сессию пользователя
    return { session: data.session }
}

// Функция выхода пользователя из системы
export async function logout(accessToken) {
    // Вызываем метод выхода из Supabase
    const { error } = await supabase.auth.signOut(accessToken)
    // Если произошла ошибка при выходе
    if (error) throw new AppError(error.message, 400)
}

// Получить данные пользователя по supabaseId
export async function getMe(supabaseId) {
    const user = await prisma.user.findUnique({
        where: { supabaseId } 
    })
    if (!user) throw new AppError('Пользователь не найден', 404)
    return user
}

// Экспортируемая асинхронная функция поиска пользователя по supabaseId
export async function getUser(supabaseId) {
    // Ищем пользователя в таблице users по полю supabase_id
    const user = await prisma.user.findUnique({
        where: { supabaseId },
    })
    // Если пользователь не найден — выбрасываем кастомную ошибку 404
    if (!user) throw new AppError('Пользователь не найден', 404)
    // Возвращаем найденного пользователя
    return user
}