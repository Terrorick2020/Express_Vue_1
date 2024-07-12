import { Router } from "express";
import userController from '../controllers/userController';
import authMiddleware from "../middleware/authMiddleware";


const router = Router();

router.put('/users/:id/role', authMiddleware(['ADMIN']), userController.changeRole);

router.get('/confirm/:token', userController.verifyMail);   

router.get('/autorization', userController.cheackMail);


export default router;