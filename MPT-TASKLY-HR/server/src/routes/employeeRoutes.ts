// src/routes/employeeRoutes.ts

import { Router } from 'express';
import { getMembers, updateMemberRole } from '../controllers/memberController'; // <--- Tambahkan updateMemberRole

const router = Router();

// Endpoint 1: GET /api/member/list/:workspaceId (Daftar User)
router.get('/list/:workspaceId', getMembers);

// Endpoint 2: PATCH /api/member/role/:memberId (Update Role)
router.patch('/role/:memberId', updateMemberRole); // <--- ROUTE BARU

export default router;