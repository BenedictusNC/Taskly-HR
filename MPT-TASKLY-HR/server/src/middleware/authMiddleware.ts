import { Request, Response, NextFunction } from 'express';

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
    // Nanti di sini kita akan cek token login
    // Untuk sementara, kita loloskan dulu (next)
    next();
}