import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/secret';

export default function (roles: Array<string>) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.method === 'OPTIONS') { // не проверяем HTTP запросы options
            return next();
        }

        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(403).json({ message: 'Пользователь не авторизован' });
            }

            const token = authHeader.split(' ')[1];
            
            if (!token) {
                return res.status(403).json({ message: 'Пользователь не авторизован' });
            }
            
            const decodedToken = jwt.verify(token, config.secret) as { role: Array<string> };
            const userRoles = decodedToken.role;

            const hasRole = roles.some(role => userRoles.includes(role));
            if (!hasRole) {
                return res.status(403).json({ message: 'У вас нет доступа' });
            }

            next();
        } catch (error) {
            console.log(`Возникла ошибка при получении access токена: ${error}`);
            return res.status(403).json({ message: 'Пользователь не авторизован произошла ошибка чтения токена' });
        }
    }
};
