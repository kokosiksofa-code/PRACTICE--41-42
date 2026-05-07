// Импорт всех функций из сервиса аутентификации
import * as authService from '../services/authService.js'

// Контроллер для регистрации нового пользователя
export async function register(req, res, next) {
    try {
        // Извлекаем данные из тела запроса (уже провалидированные)
        const { email, password, name } = req.body
        // Вызываем сервис регистрации, который создаёт пользователя
        const { user, session } = await authService.register(email, password, name)
        // Возвращаем успешный ответ с кодом 201 (Created)
        res.status(201).json({ user, session })
    } catch (error) {
        // При возникновении ошибки передаём её в глобальный обработчик
        next(error)
    }
}

// Контроллер для входа пользователя в систему
export async function login(req, res, next) {
    try {
        // Извлекаем email и пароль из тела запроса
        const { email, password } = req.body
        // Вызываем сервис входа, который проверяет учётные данные
        const { session } = await authService.login(email, password)
        // Возвращаем успешный ответ с кодом 200
        res.status(200).json({ session })
    } catch (error) {
        // Передаём ошибку в обработчик
        next(error)
    }
}

// Контроллер выхода пользователя из системы
export async function logout(req, res, next) {
    try {
        // Извлекаем JWT токен из заголовка Authorization
        const token = req.headers.authorization.split(' ')[1]
        // Если токен отсутствует — возвращаем ошибку 400
        if (!token) {
            return res.status(400).json({ message: 'Токен не предоставлен' })
        }
        // Вызываем сервис выхода, который инвалидирует токен в Supabase
        await authService.logout(token)
        // Возвращаем успешный ответ
        res.status(200).json({ message: 'Выход выполнен' })
    } catch (error) {
        // Передаём ошибку в глобальный обработчик
        next(error)
    }
}

// Контроллер получения данных текущего пользователя
export async function getMe(req, res, next) {
    try {
        // Получаем пользователя по supabaseId из данных токена
        const user = await authService.getMe(req.user.sub)
        // Возвращаем данные пользователя
        res.status(200).json({ user })
    } catch (error) {
        // Передаём ошибку в обработчик
        next(error)
    }
}