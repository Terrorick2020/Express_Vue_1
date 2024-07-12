import { Request, Response, NextFunction } from 'express';
import jwt from '../services/JWT_helper';


export default function (roles: Array<string>) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.method === 'OPTIONS') {
            return next();
        }

        try {
            const authHeader = req.cookies.AccessToken;
            if (!authHeader) {
                return res.status(403).json({ message: 'Пользователь не авторизован' });
            }

            const token = authHeader.split(' ')[1];
            
            if (!token) {
                return res.status(403).json({ message: 'Пользователь не авторизован' });
            }
            
            const decodedToken = jwt.verifyAccessToken(token);
            if (!decodedToken) {
                return res.status(403).json({ message: "Неверный access_token" });
            }
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