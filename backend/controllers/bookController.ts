import { Request, Response } from "express";
import dotenv from 'dotenv';
import db_connection from '../config/dbConnection';
import bookManager from "../config/bookManager";

dotenv.config();

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

            const pool = await db_connection.connectToPostgresDB(pool_config);

            if (!pool) {
                throw new Error(`Возникла ошибка: объект pool: ${pool}! Не получается подключиться к бд: PostgreSQL!`);
            }

            const result = await bookManager.getAllBooks(pool, book_config);

            if (result.result === 'success') {
                res.status(200).json(result);
            } else {
                res.status(401).json({ 'result': 'books_fetch_error', 'code': result.code });
            }
        } catch (error) {
            console.error(`Возникла ошибка с контроллером при попытке получения всех книг!`);
            const err = error as Error;
            console.error(err);
            res.status(500).json({ 'result': 'server_error', 'code': err.message });
        }
    },

    getBookByID: async (req: Request, res: Response) => {
        try {
            const book_id = {id: req.params.id}
            book_config = { ...book_config, ...book_id };

            const pool = await db_connection.connectToPostgresDB(pool_config);

            if (!pool) {
                throw Error(`Возникла ошибка: объект pool: ${pool}! Не получается подключиться к бд: PostgreSQL!`);
            }

            const result = await bookManager.getBookByID(pool, book_config);

            if (result.result === 'success') {
                res.status(200).json(result);
            } else {
                res.status(401).json({ 'result': 'registration_error', 'code': result.code });
            }
        } catch (error) {
            console.error(`Возникла ошибка с контроллером при попытке регистрации пользователя!`);
            const err = error as Error;
            console.error(err);
            res.status(500).json({ 'result': 'server_error', 'code': err.message });
        }
    },

    addBook: async (req: Request, res: Response) => {
        try {
            book_config = { ...book_config, ...req.body };

            const pool = await db_connection.connectToPostgresDB(pool_config);

            if (!pool) {
                throw Error(`Возникла ошибка: объект pool: ${pool}! Не получается подключиться к бд: PostgreSQL!`);
            }

            const result = await bookManager.add_book(pool, book_config);

            if (result.result === 'success') {
                res.status(200).json(result);
            } else {
                res.status(400).json({ 'result': 'book_error', 'code': result.code });
            }
        } catch (error) {
            console.error(`Возникла ошибка с контроллером при попытке добавления книги!`);
            const err = error as Error;
            console.error(err);
            res.status(500).json({ 'result': 'server_error', 'code': err.message });
        }
    },

    deleteBook: async (req: Request, res: Response) => {
        try {
            const book_id = {id: req.params.id}
            book_config = { ...book_config, ...book_id };

            const pool = await db_connection.connectToPostgresDB(pool_config);

            if (!pool) {
                throw Error(`Возникла ошибка: объект pool: ${pool}! Не получается подключиться к бд: PostgreSQL!`);
            }

            const result = await bookManager.delete_book(pool, book_config);

            if (result.result === 'success') {
                res.status(200).json(result);
            } else {
                res.status(400).json({ 'result': 'book_error', 'code': result.code });
            }
        } catch (error) {
            console.error(`Возникла ошибка с контроллером при попытке удаления книги!`);
            const err = error as Error;
            console.error(err);
            res.status(500).json({ 'result': 'server_error', 'code': err.message });
        }
    },

    updateBook: async (req: Request, res: Response) => {
        try {
            const bookId = Number(req.params.id);
            const updates = req.body;
    
            if (!Object.keys(updates).length) {
                return res.status(400).json({ 'result': 'book_error', 'code': 'no_update_data' });
            }
    
            const pool = await db_connection.connectToPostgresDB(pool_config);
    
            if (!pool) {
                throw Error(`Возникла ошибка: объект pool: ${pool}! Не получается подключиться к бд: PostgreSQL!`);
            }
    
            const result = await bookManager.update_book(pool, bookId, updates);
    
            if (result.result === 'success') {
                res.status(200).json(result);
            } else {
                res.status(400).json({ 'result': 'book_error', 'code': result.code });
            }
        } catch (error) {
            console.error(`Возникла ошибка с контроллером при попытке обновления книги!`);
            const err = error as Error;
            console.error(err);
            res.status(500).json({ 'result': 'server_error', 'code': err.message });
        }
    }
    
} 
