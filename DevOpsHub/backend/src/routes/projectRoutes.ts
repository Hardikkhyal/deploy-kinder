import { Router } from 'express';
import { getProjects, createProject, deployProject, deleteProject } from '../controllers/projectController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getProjects);
router.post('/', createProject);
router.post('/:id/deploy', deployProject);
router.delete('/:id', deleteProject);

export default router;
