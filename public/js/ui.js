// Объект для управления пользовательским интерфейсом
const ui = {
    // Текущая активная вкладка (login или register)
    currentTab: 'login',
    
    // Переключение между вкладками "Войти" и "Регистрация"
    switchTab(tab) {
        this.currentTab = tab
        
        // Получаем ссылки на элементы DOM
        const btnLogin = document.getElementById('tab-login')
        const btnRegister = document.getElementById('tab-register')
        const fieldName = document.getElementById('field-name')
        const submitBtn = document.querySelector('#auth-form button[type="submit"]')
        
        // Переключение внешнего вида вкладок и формы
        if (tab === 'login') {
         // Вкладка "Войти" становится активной, "Регистрация" — неактивной
          btnLogin.className = btnLogin.className.replace('tab-inactive', 'tab-active')
          btnRegister.className = btnRegister.className.replace('tab-active', 'tab-inactive')
          // Скрываем поле "Имя" (нужно только при регистрации)
          fieldName.classList.add('hidden')
          // Меняем текст кнопки отправки формы
          submitBtn.textContent = 'Войти'
        } else {
          // Вкладка "Регистрация" становится активной, "Войти" — неактивной
          btnRegister.className = btnRegister.className.replace('tab-inactive', 'tab-active')
          btnLogin.className = btnLogin.className.replace('tab-active', 'tab-inactive')
          // Показываем поле "Имя"
          fieldName.classList.remove('hidden')
          // Меняем текст кнопки
          submitBtn.textContent = 'Зарегистрироваться'
        }
        // Очищаем сообщение об ошибке при переключении вкладок
        this.clearError()
    },

    // Показать сообщение об ошибке в форме
    showError(message) {
        // Ищем блок для ошибок аутентификации или создания комнаты
        const el = document.getElementById('auth-error') || document.getElementById('room-error')
        if (!el) return // Если элемента нет - выходим
        el.textContent = message  // Устанавливаем текст ошибки
        el.classList.remove('hidden')  // Показываем блок
    },

    // Скрыть сообщение об ошибке
    clearError() {
        const el = document.getElementById('auth-error')
        if (el) el.classList.add('hidden') // Если элемент есть - скрываем блок
    },

    // Отрисовать список комнат в боковой панели
    renderRooms(rooms, currentRoomId, onSelect) {
        const list = document.getElementById('rooms-list')
        list.innerHTML = '' // Очищаем список
        rooms.forEach(room => {
            const li = document.createElement('li')
            const isActive = room.id === currentRoomId   // Активна ли комната
            // Стили для активной/неактивной комнаты
            li.className = `flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm transition-colors ${isActive ? 'bg-[#404249] text-white' : 'text-[#949ba4] hover:bg-[#35373c] hover:text-white'
                }`
            
            // Формируем HTML-содержимое элемента списка: иконка # и название комнаты
            li.innerHTML = `<span class="text-[#949ba4]">#</span><span class="truncate">${room.name}</span>`
            // Добавляем обработчик клика для выбора комнаты
            li.addEventListener('click', () => onSelect(room))
            // Добавляем элемент в список комнат
            list.appendChild(li)
        })
    },
    // Отрисовать список сообщений в области чата
    renderMessages(messages, currentUserId) {
       const area = document.getElementById('messages-area')
       // Удаляем все сообщения, кроме empty-state и join-state
       Array.from(area.children).forEach(el => {
          if (el.id !== 'empty-state' && el.id !== 'join-state') el.remove()
        })
      // Добавляем каждое сообщение в область чата
       messages.forEach(msg => {
          area.appendChild(this.createMessageEl(msg, currentUserId))
        })
       // Прокручиваем область сообщений вниз
       area.scrollTop = area.scrollHeight
    },
    // Очистить все сообщения из области чата
    clearMessages() {
      const area = document.getElementById('messages-area')
      // Удаляем все элементы, кроме заглушек
      Array.from(area.children).forEach(el => {
          if (el.id !== 'empty-state' && el.id !== 'join-state') el.remove()
        })
    },
    // Добавить одно сообщение в конец области чата
    appendMessage(msg, currentUserId) {
      const area = document.getElementById('messages-area')
      // Создаём DOM-элемент сообщения и добавляем в контейнер
      area.appendChild(this.createMessageEl(msg, currentUserId))
      // Прокручиваем чат вниз, чтобы показать новое сообщение
      area.scrollTop = area.scrollHeight
    },
    // Создать DOM-элемент для одного сообщения
    createMessageEl(msg, currentUserId) {
      // Определяем, принадлежит ли сообщение текущему пользователю
      const isOwn = msg.senderId === currentUserId
      // Создаём контейнер сообщения
      const div = document.createElement('div')
      // Выравнивание: свои сообщения справа, чужие — слева
      div.className = `flex flex-col ${isOwn ? 'items-end' : 'items-start'}`
      // Формируем HTML содержимого сообщения
      div.innerHTML = `
        <span class="text-[#949ba4] text-xs mb-1">${msg.senderName}</span>
        <div class="max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm text-white ${isOwn ? 'bg-[#5865f2]' : 'bg-[#383a40]'
            }">${msg.content}</div>
    `
       return div
    },
    // Отрисовать список участников комнаты в боковой панели
    renderMembers(members, onlineIds) {
       const list = document.getElementById('members-list')
       list.innerHTML = ''  // Очищаем список
       members.forEach(user => {
         // Проверяем, онлайн ли пользователь
         const isOnline = onlineIds.has(user.id)
         const li = document.createElement('li')
         li.className = 'flex items-center gap-2 px-2 py-1.5 rounded text-sm text-[#949ba4]'
         // Формируем HTML для элемента списка участников
         li.innerHTML = `
        <div class="relative shrink-0">
            <div class="w-7 h-7 rounded-full bg-[#5865f2] flex items-center justify-center text-white text-xs font-bold">
                 ${user.name || user.email[0].toUpperCase()}
            </div>
            <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#2b2d31] ${isOnline ? 'bg-green-500' : 'bg-[#747f8d]'
                  }"></span>
        </div>
        <span class="truncate">${user.name || user.email}</span>
      `
          list.appendChild(li)
        })
    },
    // Обновить заголовок комнаты и кнопку "Покинуть"
    setRoomHeader(room) {
      // Устанавливаем название комнаты или текст по умолчанию
      document.getElementById('room-name').textContent = room ? room.name : 'Выберите комнату'
      const leaveBtn = document.getElementById('btn-leave-room')
      // Показываем кнопку "Покинуть" только если комната выбрана
      if (room) leaveBtn.classList.remove('hidden')
      else leaveBtn.classList.add('hidden')
    },
    // Включить/выключить поле ввода сообщений
    setInputEnabled(enabled) {
      const input = document.getElementById('message-input')
      const btn = document.getElementById('btn-send')
      // Блокируем или разблокируем поле ввода и кнопку отправки
      input.disabled = !enabled
      btn.disabled = !enabled
      // Меняем подсказку в зависимости от состояния
      input.placeholder = enabled ? 'Написать сообщение...' : 'Сообщение недоступно — выберите комнату'
    },
   // Показать "Выберите комнату"
   showEmptyState() {
    document.getElementById('empty-state').classList.remove('hidden')   // Показываем
    document.getElementById('join-state').classList.add('hidden')       // Скрываем
   },
  // Показать "Присоединиться к комнате"
   showJoinState(room) {
   document.getElementById('join-room-name').textContent = room.name   // Название комнаты
   document.getElementById('join-state').classList.remove('hidden')    // Показываем
   document.getElementById('empty-state').classList.add('hidden')      // Скрываем
   },
  // Показать модальное окно создания комнаты
   showModal() {
      document.getElementById('modal-create-room').classList.remove('hidden')
      document.getElementById('input-room-name').focus() // Автофокус на поле ввода
    },
  // Скрыть модальное окно создания комнаты
   hideModal() {
       document.getElementById('modal-create-room').classList.add('hidden')
       document.getElementById('input-room-name').value = ''   // Очищаем поле ввода
       const err = document.getElementById('room-error')       // Скрываем ошибку
       if (err) err.classList.add('hidden')
    },
   // Обновить данные пользователя в нижней панели
   setUser(user) {
      const name = user.name || user.email    // Имя или email
      document.getElementById('user-name').textContent = name  // Текст имени
      document.getElementById('user-avatar').textContent = name[0].toUpperCase()  // Первая буква (аватар)
    },
}