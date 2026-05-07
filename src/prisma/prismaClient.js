// Импорт сгенерированного Prisma Client для работы с базой данных
import { PrismaClient } from './generated/prisma/index.js';
// Импорт адаптера для PostgreSQL из пакета @prisma/adapter-pg
import { PrismaPg } from '@prisma/adapter-pg';
// Импорт библиотеки pg для работы с PostgreSQL
import pg from 'pg';

// Деструктуризация класса Pool из импортированного модуля pg
const { Pool } = pg

// Создание адаптера Prisma для работы с PostgreSQL
const adapter = new PrismaPg(
  new pg.Pool({
    // URL подключения к базе данных из переменных окружения
    connectionString: process.env.DATABASE_URL,
    // Максимальное количество соединений в пуле
    max: 5,
    // Закрытие неактивных соединений через 30 секунд
    idleTimeoutMillis: 30000,
    // Таймаут установки соединения — 10 секунд
    connectionTimeoutMillis: 5000,
  })
);

// Инициализация Prisma Client с подключенным адаптером PostgreSQL
const prisma = new PrismaClient({adapter});
// Экспорт экземпляра Prisma Client для использования в других модулях
export default prisma;