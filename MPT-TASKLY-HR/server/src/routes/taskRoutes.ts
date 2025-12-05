// src/routes/taskRoutes.ts

import { Router } from 'express';
// FIX 1: Impor fungsi getTasksByAssignedUser
import { getTasks, updateTaskStatus, getTasksByAssignedUser } from '../controllers/taskController'; 

const router = Router();

// Endpoint 1: GET /api/task/:workspaceId (Daftar Semua Tugas - PM View)
router.get('/:workspaceId', getTasks); 

// Endpoint 2: PATCH /api/task/:taskId/status (Update Status)
router.patch('/:taskId/status', updateTaskStatus); 

// Endpoint 3: GET /api/task/user/:workspaceId/:userId (Daftar Tugas User - Member View)
// FIX 2: Tutup route dengan benar
router.get('/user/:workspaceId/:userId', getTasksByAssignedUser); 

export default router;