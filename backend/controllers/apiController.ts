import { NextFunction, Request, Response } from "express";
import dotenv from 'dotenv';
import db_connection from '../config/dbConnection';
import userManager from "../config/userManager";
import jwt from '../services/JWT_helper';
import authSchema from "../middleware/validationMiddleware";
import { sendConfirmationEmail } from '../services/mailer';


dotenv.config();

let pool_config = JSON.parse(process.env.POSTGRES_CONFIG || '{"config":"undefined"}');
let user_config = JSON.parse(process.env.USER_CONFIG || '{"config":"undefined"}');


if (pool_config.config === "undefined" || user_config.config === "undefined") {
    throw new Error(`Ошибка конфигурации контроллера!`);
}

export default {
    autorizationUser: async (req: Request, res: Response) => {
        try {
            user_config = { ...user_config, ...req.body };

            const pool = await db_connection.connectToPostgresDB(pool_config);

            if (!pool) {
                throw new Error(`Возникла ошибка: объект pool: ${pool}! Не получается подключиться к бд: PostgreSQL!`);
            }

            const isAuthenticated = await userManager.identifyUser(pool, user_config);

            if (isAuthenticated) {
                const payload = { 
                    id: isAuthenticated.id,
                    login: user_config.login,
                    role: isAuthenticated.role
                };
                let AccessToken = jwt.signAccessToken(payload);
                let RefreshToken = jwt.signRefreshToken(payload);
                console.log(AccessToken);
                console.log(RefreshToken);
                res.status(200).cookie('Access', AccessToken, { maxAge: 9000000, httpOnly: true, secure: true })
                .cookie('Refresh', RefreshToken, { maxAge: 9000000, httpOnly: true, secure: true }).end();
            } else {
                res.status(401).json({ 'result': 'authorization_error' });
            }
        } catch (error) {
            console.error(`Возникла ошибка с контроллером при попытке авторизации пользователя!`);
            const err = error as Error;
            console.error(err);
            res.status(500).json({ 'result': 'server_error', 'code': err.message });
        }
    },

    regUser: async (req: Request, res: Response) => {
        try {
            user_config = { ...user_config, ...req.body };

            const pool = await db_connection.connectToPostgresDB(pool_config);

            if (!pool) {
                throw new Error(`Возникла ошибка: объект pool: ${pool}! Не получается подключиться к бд: PostgreSQL!`);
            }

            user_config = await authSchema.validateAsync(user_config);

            const result = await userManager.addUser(pool, user_config);

            const payload = { 
                id: result.id,
                login: user_config.login,
                role: user_config.role
            };

            if (result.result === 'success') {
                
                let AccessToken = jwt.signAccessToken(payload);
                let RefreshToken = jwt.signRefreshToken(payload);
                await sendConfirmationEmail( user_config.email, RefreshToken );
                res.status(200).cookie('Access', AccessToken, { maxAge: 9000000, httpOnly: true, secure: true })
                .cookie('Refresh', RefreshToken, { maxAge: 9000000, httpOnly: true, secure: true }).end();

                // res.status(200).json({ 'result': 'success', 'AccessToken': AccessToken, 'RefreshToken': RefreshToken });
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


    refreshToken: async (req: Request, res: Response, next: NextFunction) => {
        try {
            let refreshToken = req.cookies.RefreshToken;
      
            if (!refreshToken) {
                throw new Error("Ошибка - не передан refresh_token");
            }

            const payload = await jwt.verifyRefreshToken(refreshToken);
            console.log(req.body);

            const AccessToken = await jwt.signAccessToken(payload);
            const RefreshToken = await jwt.signRefreshToken(payload);
      
            res.status(200).cookie('Access', AccessToken, { maxAge: 9000000, httpOnly: true, secure: true })
                .cookie('Refresh', RefreshToken, { maxAge: 9000000, httpOnly: true, secure: true }).end();
        } catch (error) {
            console.error(`Возникла ошибка с контроллером при попытке подтверждения почты!`);
            const err = error as Error;
            console.error(err);
            res.status(500).json({ 'result': 'server_error', 'code': err.message });
        }
      }
      
}
