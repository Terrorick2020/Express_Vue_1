import { Request, Response } from "express";
import dotenv from 'dotenv';
import db_connect from '../config/postgres_db';

let pool_config = JSON.parse(process.env.POSTGRES_CONFIG || '{"config":"undefined"}');
let user_config = JSON.parse(process.env.USER_CONFIG || '{"config":"undefined"}');
let book_config = JSON.parse(process.env.BOOK_CONFIG || '{"config": "undefined"}');

if (pool_config.config === "undefined" || user_config.config === "undefined" || book_config.config === "undefined") {
    throw new Error(`Ошибка конфигурации контроллера!`);
}
 

export default {
    getAllBooks: async (req: Request, res: Response) => {
        try {
            book_config = { ...book_config, ...req.body };

            const pool = await db_connect.connect_to_postgres_db(pool_config);

            if (!pool) {
                throw new Error(`Возникла ошибка: объект pool: ${pool}! Не получается подключиться к бд: PostgreSQL!`);
            }

            const result = await db_connect.getAllBooks(pool, book_config);

            if (result.result === 'success') {
                res.status(200).json(result);
            } else {
                res.status(401).json({ 'result': 'books_fetch_error', 'code': result.code });
            }
        } catch (error) {
            console.error(`Возникла ошибка с контроллером при попытке получения всех книг!`);
            console.error(error);
            res.status(500).json({ 'result': 'server_error' });
        }
    },

    getBookByID: async (req: Request, res: Response) => {
        try {
            const book_id = {id: req.params.id}
            book_config = { ...book_config, ...book_id };

            const pool = await db_connect.connect_to_postgres_db(pool_config);

            if (!pool) {
                throw Error(`Возникла ошибка: объект pool: ${pool}! Не получается подключиться к бд: PostgreSQL!`);
            }

            const result = await db_connect.getBookByID(pool, book_config);

            if (result.result === 'success') {
                res.status(200).json(result);
            } else {
                res.status(401).json({ 'result': 'registration_error', 'code': result.code });
            }
        } catch (error) {
            console.error(`Возникла ошибка с контроллером при попытке регистрации пользователя!`);
            console.error(error);
            res.status(500).json({ 'result': 'server_error' });
        }
    },

    addBook: async (req: Request, res: Response) => {
        try {
            book_config = { ...book_config, ...req.body };

            const pool = await db_connect.connect_to_postgres_db(pool_config);

            if (!pool) {
                throw Error(`Возникла ошибка: объект pool: ${pool}! Не получается подключиться к бд: PostgreSQL!`);
            }

            const result = await db_connect.add_book(pool, book_config);

            if (result.result === 'success') {
                res.status(200).json(result);
            } else {
                res.status(400).json({ 'result': 'book_error', 'code': result.code });
            }
        } catch (error) {
            console.error(`Возникла ошибка с контроллером при попытке добавления книги!`);
            console.error(error);
            res.status(500).json({ 'result': 'server_error' });
        }
    },

    deleteBook: async (req: Request, res: Response) => {
        try {
            const book_id = {id: req.params.id}
            book_config = { ...book_config, ...book_id };

            const pool = await db_connect.connect_to_postgres_db(pool_config);

            if (!pool) {
                throw Error(`Возникла ошибка: объект pool: ${pool}! Не получается подключиться к бд: PostgreSQL!`);
            }

            const result = await db_connect.delete_book(pool, book_config);

            if (result.result === 'success') {
                res.status(200).json(result);
            } else {
                res.status(400).json({ 'result': 'book_error', 'code': result.code });
            }
        } catch (error) {
            console.error(`Возникла ошибка с контроллером при попытке удаления книги!`);
            console.error(error);
            res.status(500).json({ 'result': 'server_error' });
        }
    },

    updateBook: async (req: Request, res: Response) => {
        try {
            const bookId = Number(req.params.id);
            const updates = req.body;
    
            if (!Object.keys(updates).length) {
                return res.status(400).json({ 'result': 'book_error', 'code': 'no_update_data' });
            }
    
            const pool = await db_connect.connect_to_postgres_db(pool_config);
    
            if (!pool) {
                throw Error(`Возникла ошибка: объект pool: ${pool}! Не получается подключиться к бд: PostgreSQL!`);
            }
    
            const result = await db_connect.update_book(pool, bookId, updates);
    
            if (result.result === 'success') {
                res.status(200).json(result);
            } else {
                res.status(400).json({ 'result': 'book_error', 'code': result.code });
            }
        } catch (error) {
            console.error(`Возникла ошибка с контроллером при попытке обновления книги!`);
            console.error(error);
            res.status(500).json({ 'result': 'server_error' });
        }
    }
    
} 
