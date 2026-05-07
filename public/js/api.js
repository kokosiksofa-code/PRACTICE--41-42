// Базовый URL API сервера
const API_URL = 'http://localhost:3000/api'

// Объект с методами для работы с API
const api = {
    // Получить JWT-токен из локального хранилища браузера
    getToken() {
        return localStorage.getItem('token')
    },
    
    // Сформировать заголовки для авторизованных запросов
    authHeaders() {
        return {
            'Content-Type': 'application/json',           // Тип содержимого - JSON
            Authorization: `Bearer ${this.getToken()}`    // JWT-токен авторизации
        }
    },
    
    // Универсальный метод для отправки запросов к API
    async request(path, options = {}) {
        // Отправка fetch-запроса по полному URL
        const res = await fetch(`${API_URL}${path}`, options)
        // Парсинг JSON-ответа (с защитой от пустого ответа)
        const data = await res.json().catch(() => ({}))
        // Если статус ответа не успешный - выбрасываем ошибку
        if (!res.ok) throw new Error(data.message || 'Ошибка запроса')
        return data
    },
    
    // Регистрация нового пользователя
    async register(email, password, name) {
        const data = await this.request('/auth/register', {
            method: 'POST',                                 // HTTP метод
            headers: { 'Content-Type': 'application/json' }, // Заголовки
            body: JSON.stringify({ email, password, name })  // Тело запроса
        })
        return data
    },
    
    // Вход пользователя в систему
    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        return data
    },
    
    // Выход пользователя из системы
    async logout() {
        await this.request('/auth/logout', {
            method: 'POST',
            headers: this.authHeaders() // Заголовки с токеном авторизации
        })
    },
    // Получить данные текущего авторизованного пользователя
    async getMe() {
        const data = await this.request('/auth/me', {
            headers: this.authHeaders(), // Заголовки с токеном
        })
        return data.user // Возвращаем объект пользователя
    },

    // Получить список ID комнат, в которых состоит пользователь
    async getMyRooms() {
        const data = await this.request('/rooms/my', {
            headers: this.authHeaders(),
        })
        return data.roomIds // Массив ID комнат
    },

    // Получить список всех существующих комнат
    async getRooms() {
        const data = await this.request('/rooms', {
            headers: this.authHeaders(),
        })
        return data.rooms                   // Массив объектов комнат
    },

    // Создать новую комнату
    async createRoom(name) {
        const data = await this.request('/rooms', {
            method: 'POST', // Создание ресурса
            headers: this.authHeaders(),
            body: JSON.stringify({ name }), // Название комнаты
        })
        return data.room // Созданная комната
    },

    // Удалить комнату по ID
    async deleteRoom(id) {
        await this.request(`/rooms/${id}`, {
            method: 'DELETE',               // Удаление ресурса
            headers: this.authHeaders(),
        })
    },

    // Получить все сообщения конкретной комнаты
    async getMessages(roomId) {
        const data = await this.request(`/rooms/${roomId}/messages`, {
            headers: this.authHeaders(),
        })
        return data.messages                // Массив сообщений
    },
}