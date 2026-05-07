// Объект для работы с WebSocket-соединением через Socket.IO
const socketClient = {
    socket: null,   // Экземпляр сокета (null при отсутствии подключения)

   // Установить соединение с сервером
   connect(token) {
      // Подключаемся к namespace /chat, передавая JWT-токен для аутентификации
       this.socket = io('http://localhost:3000/chat', {
          auth: { token },
        })

       // Обработчик ошибок подключения
       this.socket.on('connect_error', (err) => {
          console.error('Socket ошибка подключения:', err.message)
        })
    },

    // Закрыть соединение с сервером
    disconnect() {
       if (this.socket) {
         this.socket.disconnect()    // Разрыв соединения
         this.socket = null          // Сброс ссылки
        }
    },

   // Присоединиться к комнате
    joinRoom(roomId) {
     this.socket.emit('room:join', roomId)   // Отправка события на сервер
    },

   // Покинуть комнату
   leaveRoom(roomId) {
     this.socket.emit('room:leave', roomId)
    },

   // Отправить сообщение в комнату
   sendMessage(roomId, content) {
     this.socket.emit('message:send', roomId, content)
    },

   // Пользователь успешно присоединился к комнате
   onRoomJoined(cb) {
     this.socket.on('room:joined', cb)
    },

   // Пользователь покинул комнату
   onRoomLeft(cb) {
     this.socket.on('room:left', cb)
    },

   // Получение нового сообщения
   onMessage(cb) {
     this.socket.on('message:receive', cb)
    },

   // Обновление списка пользователей в комнате
   onRoomUsers(cb) {
     this.socket.on('room:users', cb)
    },

  // Пользователь вошёл в сеть
  onUserOnline(cb) {
     this.socket.on('user:online', cb)
    },

  // Пользователь вышел из сети
  onUserOffline(cb) {
     this.socket.on('user:offline', cb)
    },

  // Ошибка WebSocket
  onError(cb) {
     this.socket.on('error', cb)
    },
}