import { Router } from 'express';
import { 
  getActiveElections, 
  castVote, 
  getElectionResults, 
  createElection,
  getDatabaseRegistryHandler,
  getAdminVoteAuditHandler 
} from '../controllers/electionController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// 🔒 STRICT ADMIN ONLY: Confidential Audit of who voted for whom
router.get('/admin/vote-audit', requireAuth, requireRole(['ADMIN']), getAdminVoteAuditHandler);
router.get('/:id/admin/vote-audit', requireAuth, requireRole(['ADMIN']), getAdminVoteAuditHandler);

// Public / Authenticated Election Endpoints
router.get('/active', getActiveElections);
router.get('/database/all', getDatabaseRegistryHandler);
router.get('/:id/database-registry', getDatabaseRegistryHandler);
router.get('/:id/results', getElectionResults);
router.post('/vote', requireAuth, castVote);

// Admin Only - Create Election
router.post('/admin', requireAuth, requireRole(['ADMIN']), createElection);

export default router;
