// Глобальное состояние приложения
const state = {
    user: null,              // Данные текущего пользователя
    rooms: [],               // Список всех комнат
    currentRoom: null,       // Текущая выбранная комната
    members: [],             // Участники текущей комнаты
    onlineIds: new Set(),    // ID пользователей, которые сейчас онлайн
}

// Инициализация страницы авторизации (login.html)
const authForm = document.getElementById('auth-form')
if (authForm) {
    // Обработчики переключения вкладок Вход/Регистрация
    document.getElementById('tab-login').addEventListener('click', () => ui.switchTab('login'))
    document.getElementById('tab-register').addEventListener('click', () => ui.switchTab('register'))

    // Обработчик отправки формы аутентификации
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault()  // Предотвращаем стандартную отправку формы
        ui.clearError()    // Очищаем предыдущие ошибки

        // Получаем значения полей
        const email = document.getElementById('input-email').value.trim()
        const password = document.getElementById('input-password').value.trim()

        try {
            // Если активна вкладка регистрации — сначала регистрируем
            if (ui.currentTab === 'register') {
                const name = document.getElementById('input-name').value.trim()
                await api.register(email, password, name)
            }

            // Выполняем вход в систему
            const data = await api.login(email, password)
            // Сохраняем токен и email в локальном хранилище браузера
            localStorage.setItem('token', data.session.access_token)
            localStorage.setItem('user_email', email)
            // Перенаправляем на страницу чата
            window.location.href = '/chat.html'
        } catch (err) {
            // Показываем ошибку в форме
            ui.showError(err.message)
        }
    })
}

// Инициализация страницы чата (chat.html)
const roomsList = document.getElementById('rooms-list')
if (roomsList) {
    const token = api.getToken()
    // Если токена нет — перенаправляем на страницу входа
    if (!token) {
        window.location.href = '/login.html'
    } else {
        initChat()   // Запускаем инициализацию чата
    }
}

// Основная функция инициализации чата
async function initChat() {
    const token = api.getToken()

    // Получаем данные текущего пользователя и обновляем интерфейс
    state.user = await api.getMe()
    ui.setUser(state.user)

    // Устанавливаем WebSocket-соединение с сервером
    socketClient.connect(token)

    // Подписываемся на входящие сообщения
    socketClient.onMessage((msg) => {
        // Добавляем сообщение в чат, только если оно из текущей комнаты
        if (msg.roomId === state.currentRoom?.id) {
            ui.appendMessage(msg, state.user?.id)
        }
    })
    // Подписка на обновление списка пользователей в комнате
    socketClient.onRoomUsers((members) => {
      state.members = members                              // Сохраняем список участников
      state.onlineIds = new Set(members.map((m) => m.id))  // Все участники комнаты считаются онлайн
      ui.renderMembers(state.members, state.onlineIds)     // Перерисовываем панель участников
    })

   // Подписка на событие входа пользователя в сеть
    socketClient.onUserOnline(({ userId, username }) => {
      if (state.currentRoom) {
          state.onlineIds.add(userId) // Добавляем ID в список онлайн
          // Если пользователя нет в списке участников — добавляем
          if (!state.members.find((m) => m.id === userId)) {
             state.members.push({ id: userId, name: username })
            }
          ui.renderMembers(state.members, state.onlineIds) // Обновляем панель
        }
    })

    // Подписка на событие выхода пользователя из сети
    socketClient.onUserOffline(({ userId }) => {
       if (state.currentRoom) {
        state.onlineIds.delete(userId)  // Убираем ID из списка онлайн
        ui.renderMembers(state.members, state.onlineIds) // Обновляем панель
    }
})

    // Подписка на ошибки
    socketClient.onError(({ message }) => {
      console.error('Socket error:', message)
    })

    // Подписка на успешное присоединение к комнате
   socketClient.onRoomJoined(({ roomId }) => {
      if (state.myRooms && !state.myRooms.has(roomId)) {
          state.myRooms.add(roomId) // Добавляем комнату в список "моих"
          ui.renderRooms(state.rooms, state.currentRoom?.id, selectRoom)
        }
    })

   // Подписка на успешный выход из комнаты
   socketClient.onRoomLeft(({ roomId }) => {
       if (state.myRooms) {
           state.myRooms.delete(roomId) // Убираем комнату из "моих"
           ui.renderRooms(state.rooms, state.currentRoom?.id, selectRoom)
        }
    })

    // Загружаем список комнат при инициализации
    await loadRooms()

    // Обработчик кнопки выхода из системы
    document.getElementById('btn-logout').addEventListener('click', async () => {
       try {
          await api.logout() // Отправляем запрос на выход
        } finally {
           localStorage.clear()   // Очищаем локальное хранилище
           socketClient.disconnect()   // Закрываем WebSocket-соединение
           window.location.href = '/login.html'  // Перенаправляем на страницу входа
        }
    })

   // Обработчики модального окна создания комнаты
   document.getElementById('btn-create-room').addEventListener('click', () => ui.showModal())
   document.getElementById('btn-cancel-room').addEventListener('click', () => ui.hideModal())

   // Обработчик подтверждения создания комнаты
   document.getElementById('btn-confirm-room').addEventListener('click', async () => {
      const name = document.getElementById('input-room-name').value.trim()
      if (!name) return  // Выходим, если название пустое
      // Обработчик создания комнаты (продолжение)
      try {
         const room = await api.createRoom(name) // Отправляем запрос на создание
         state.rooms.unshift(room) // Добавляем комнату в начало списка
         ui.renderRooms(state.rooms, state.currentRoom?.id, selectRoom) // Обновляем список
         ui.hideModal() // Скрываем модальное окно
        } catch (err) {
          const errEl = document.getElementById('room-error') // Показываем ошибку
          errEl.textContent = err.message
          errEl.classList.remove('hidden')
        }
    }) 

    // Обработчик кнопки "Покинуть комнату"
    document.getElementById('btn-leave-room').addEventListener('click', () => {
       if (!state.currentRoom) return  // Нет выбранной комнаты — выходим
       const roomId = state.currentRoom.id
       socketClient.leaveRoom(roomId)  // Отправляем событие на сервер
       // Сбрасываем состояние комнаты
       state.currentRoom = null
       state.members = []
       state.onlineIds = new Set()
       localStorage.removeItem('currentRoomId')             // Удаляем сохранённый ID комнаты
       if (state.myRoomIds) state.myRoomIds.delete(roomId)  // Убираем из "моих" комнат
       // Обновляем интерфейс
       ui.setRoomHeader(null)
       ui.setInputEnabled(false)
       ui.renderMembers([], new Set())
       ui.clearMessages()
       ui.showEmptyState()
       ui.renderRooms(state.rooms, null, selectRoom)
    })
    // Обработчик кнопки "Присоединиться к комнате"
    document.getElementById('btn-join-room').addEventListener('click', () => joinRoom(state.pendingRoom))

    // Обработчики отправки сообщения
    const messageInput = document.getElementById('message-input')
    document.getElementById('btn-send').addEventListener('click', sendMessage)  // По клику
    messageInput.addEventListener('keydown', (e) => {                           // По Enter
      if (e.key === 'Enter') sendMessage()
    })
}

// Загрузка списка комнат при инициализации
async function loadRooms() {
    // Параллельно получаем все комнаты и ID комнат пользователя
    const [rooms, myRoomIds] = await Promise.all([api.getRooms(), api.getMyRooms()])
    state.rooms = rooms
    state.myRoomIds = new Set(myRoomIds)

    // Проверяем, была ли сохранена текущая комната
    const savedRoomId = localStorage.getItem('currentRoomId')
    if (savedRoomId && state.myRoomIds.has(savedRoomId)) {
        const room = state.rooms.find(r => r.id === savedRoomId)
        if (room) await joinRoom(room)                   // Восстанавливаем сессию
    } else {
        ui.renderRooms(state.rooms, state.currentRoom?.id, selectRoom)
    }
}

// Выбор комнаты из списка
function selectRoom(room) {
    if (state.currentRoom?.id === room.id) return // Уже выбрана — игнор
    // Сбрасываем состояние предыдущей комнаты
    if (state.currentRoom) {
        state.currentRoom = null
        state.members = []
        state.onlineIds = new Set()
        ui.setRoomHeader(null)
        ui.setInputEnabled(false)
        ui.renderMembers([], new Set())
        ui.clearMessages()
    }
    // Проверяем, состоит ли пользователь в выбранной комнате
    if (state.myRoomIds?.has(room.id)) {
        joinRoom(room) // Да — присоединяемся
    } else {
        state.pendingRoom = room // Нет — показываем кнопку "Присоединиться"
        ui.showJoinState(room)
        ui.renderRooms(state.rooms, room.id, selectRoom)
    }
}

// Присоединение к комнате
async function joinRoom(room) {
    if (!room) return

    // Устанавливаем текущую комнату
    state.currentRoom = room
    state.pendingRoom = null
    state.members = []
    state.onlineIds = new Set()

    localStorage.setItem('currentRoomId', room.id) // Сохраняем ID комнаты
    if (state.myRoomIds) state.myRoomIds.add(room.id) // Добавляем в "мои"

    // Обновляем интерфейс
    ui.setRoomHeader(room)
    ui.setInputEnabled(true)
    ui.showEmptyState()
    document.getElementById('join-state').classList.add('hidden')
    document.getElementById('empty-state').classList.add('hidden')
    ui.renderMembers([], new Set())
    socketClient.joinRoom(room.id)  // входим в комнату

    // Загружаем историю сообщений
    const messages = await api.getMessages(room.id)
    ui.renderMessages(
        messages.map((m) => ({
            id: m.id,
            content: m.content,
            senderId: m.sender.id,
            senderName: m.sender.name || m.sender.email,
            createdAt: m.createdAt,
            roomId: room.id,
        })),
        state.user?.id
    )

    ui.renderRooms(state.rooms, state.currentRoom?.id, selectRoom)
}
// Отправка сообщения
function sendMessage() {
    const input = document.getElementById('message-input')
    const content = input.value.trim()
    if (!content || !state.currentRoom) return // Пустое сообщение или нет комнаты
    socketClient.sendMessage(state.currentRoom.id, content)  // Отправляем через WebSocket
    input.value = '' // Очищаем поле ввода
}