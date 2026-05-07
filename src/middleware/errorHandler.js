// Глобальный обработчик ошибок Express, перехватывает все ошибки, переданные через next(error)
const errorHandler = (err, req, res, next) => {
  // Если это операционная ошибка (созданная через AppError)
  if (err.isOperational) {
    // Возвращаем клиенту статус ошибки и сообщение
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  // Если это не операционная ошибка (непредвиденная)
  // Логируем её в консоль для отладки
  console.error("Необработанная ошибка:", err);
  
  // Возвращаем общее сообщение, не раскрывая деталей
  res.status(500).json({
    status: "error",
    message: "Что-то пошло не так. Пожалуйста, попробуйте позже.",
  });
};

// Экспортируем обработчик для использования в app.js
export default errorHandler