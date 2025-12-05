import { Router } from 'express';
// IMPOR SATU OBJEK DENGAN NAMA 'AuthController'
import AuthController from '../controllers/authController'; 

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/:id', AuthController.getUserProfile); 

export default router;