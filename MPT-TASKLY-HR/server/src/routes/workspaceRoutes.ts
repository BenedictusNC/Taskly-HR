import { Router } from 'express';
import { createWorkspace, joinWorkspace } from '../controllers/workspaceController';

const router = Router();

router.post('/create', createWorkspace);
router.post('/join', joinWorkspace);

export default router;