import { Router } from 'express';
import { getActiveElections, castVote, getElectionResults, createElection } from '../controllers/electionController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Public / Authenticated Election Endpoints
router.get('/active', getActiveElections);
router.get('/:id/results', getElectionResults);
router.post('/vote', requireAuth, castVote);

// Admin Only
router.post('/admin', requireAuth, requireRole(['ADMIN']), createElection);

export default router;
