import { Router } from 'express';
import { 
  getActiveElections, 
  castVote, 
  getElectionResults, 
  createElection,
  getDatabaseRegistryHandler 
} from '../controllers/electionController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Public / Authenticated Election Endpoints
router.get('/active', getActiveElections);
router.get('/database/all', getDatabaseRegistryHandler);
router.get('/:id/database-registry', getDatabaseRegistryHandler);
router.get('/:id/results', getElectionResults);
router.post('/vote', requireAuth, castVote);

// Admin Only
router.post('/admin', requireAuth, requireRole(['ADMIN']), createElection);

export default router;
