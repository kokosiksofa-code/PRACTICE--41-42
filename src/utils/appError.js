// Класс для создания операционных ошибок приложения
// Наследуется от стандартного класса Error
class AppError extends Error {
  constructor(message, statusCode) {
    // Вызов конструктора родительского класса Error с сообщением об ошибке
    super(message);
    // HTTP статус-код ошибки (400, 401, 404, 500 и т.д.)
    this.statusCode = statusCode;
    // Определяем статус: 'fail' для 4xx, 'error' для 5xx
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    // Флаг, указывающий что это операционная ошибка (ожидаемая)
    this.isOperational = true;
    // Захватываем стек вызовов для удобной отладки
    Error.captureStackTrace(this, this.constructor);
  }
}

// Экспортируем класс для использования в других модулях
export default AppError;