// Импорт функции defineConfig из конфигурационного файла Prisma
import { defineConfig } from 'prisma/config'
// Импорт dotenv для загрузки переменных окружения из .env файла
import 'dotenv/config'

// Экспорт конфигурации Prisma по умолчанию
export default defineConfig({
  // Путь к файлу схемы Prisma
  schema: './src/prisma/schema/schema.prisma',
  // Настройки генератора Prisma Client
  generator: {
    output: './src/prisma/generated',  // Путь для сгенерированных файлов клиента
  },
  // Настройки источника данных (базы данных)
  datasource: {
    url: process.env.DATABASE_URL,  // URL подключения к БД из переменных окружения
    provider: 'postgresql',       // Тип базы данных (PostgreSQL)
  },
})