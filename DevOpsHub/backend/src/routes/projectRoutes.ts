import { Router } from 'express';
import { getProjects, createProject, deployProject, deleteProject, pauseProject, resumeProject, restartProject, getProjectResourceStats } from '../controllers/projectController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getProjects);
router.get('/stats', getProjectResourceStats);
router.post('/', createProject);
router.post('/:id/deploy', deployProject);
router.post('/:id/pause', pauseProject);
router.post('/:id/resume', resumeProject);
router.post('/:id/restart', restartProject);
router.delete('/:id', deleteProject);

export default router;
