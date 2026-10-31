import { Request, Response } from 'express';
import { db } from '../db.js';
import { GeminiService } from '../services/geminiService.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

const SALT = process.env.VOTE_ANONYMIZATION_SALT || 'dvm_cyber_secrecy_salt_98471932479';

export async function getActiveElections(req: AuthenticatedRequest, res: Response) {
  try {
    const active = Array.from(db.elections.values()).filter(e => e.status === 'ACTIVE');
    
    // Check if the requesting user has already voted
    const userId = req.user?.id;
    const electionsWithUserStatus = active.map(elec => {
      const hasVoted = userId ? db.voterReceipts.has(`${elec.id}_${userId}`) : false;
      return {
        ...elec,
        hasVoted
      };
    });

    return res.json({
      count: electionsWithUserStatus.length,
      elections: electionsWithUserStatus
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
}

export async function castVote(req: AuthenticatedRequest, res: Response) {
  try {
    const { electionId, candidateId } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'You must sign in with your Student ID to vote.' });
    }

    if (!electionId || !candidateId) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Election ID and Candidate ID are required.' });
    }

    // Atomic execution with cryptographic receipt
    const result = await db.castVoteAtomic(user.id, user.studentId, electionId, candidateId, SALT);

    return res.status(200).json({
      success: true,
      message: 'Ballot verified and recorded with cryptographic anonymity.',
      receiptHash: result.receiptHash,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    if (err.message.startsWith('DUPLICATE_VOTE')) {
      return res.status(409).json({ error: 'DUPLICATE_VOTE', message: err.message });
    }
    return res.status(400).json({ error: 'VOTE_FAILED', message: err.message });
  }
}

export async function getElectionResults(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    const election = db.elections.get(id);

    if (!election) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Election not found.' });
    }

    const totalVotes = Math.max(election.totalVotes, 1);
    const candidateResults = election.candidates.map(c => {
      const percentage = ((c.voteCount / totalVotes) * 100).toFixed(1);
      return {
        id: c.id,
        fullName: c.fullName,
        studentId: c.studentId,
        slogan: c.slogan,
        avatarUrl: c.avatarUrl,
        voteCount: c.voteCount,
        percentage: Number(percentage)
      };
    }).sort((a, b) => b.voteCount - a.voteCount);

    // Run anomaly sentinel
    const timestamps = db.votes.filter(v => v.electionId === id).map(v => v.timestamp);
    const anomalyReport = GeminiService.analyzeVotingPatterns(timestamps);

    return res.json({
      electionId: election.id,
      title: election.title,
      status: election.status,
      totalVotes: election.totalVotes,
      results: candidateResults,
      anomalyReport
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
}

export async function createElection(req: AuthenticatedRequest, res: Response) {
  try {
    const { title, description, targetClass, candidates } = req.body;

    if (!title || !description || !candidates || !Array.isArray(candidates)) {
      return res.status(400).json({ error: 'INVALID_PAYLOAD', message: 'Title, description and candidates list are required.' });
    }

    const newElectionId = `elec-${Date.now()}`;
    const candidateList = candidates.map((c: any, idx: number) => ({
      id: `cand-${newElectionId}-${idx + 1}`,
      userId: `user-cand-${idx + 1}`,
      fullName: c.fullName,
      studentId: c.studentId || `STU-${idx + 10}`,
      electionId: newElectionId,
      slogan: c.slogan,
      manifesto: c.manifesto || c.slogan,
      summaryAI: c.summaryAI,
      avatarUrl: c.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      voteCount: 0,
      createdAt: new Date().toISOString()
    }));

    const newElection = {
      id: newElectionId,
      title,
      description,
      targetClass: targetClass || 'ALL',
      status: 'ACTIVE' as any,
      startTime: new Date().toISOString(),
      totalVotes: 0,
      candidates: candidateList,
      createdAt: new Date().toISOString()
    };

    db.saveElection(newElection);
    return res.status(201).json({ message: 'Election launched successfully', election: newElection });
  } catch (err: any) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
}

export async function getDatabaseRegistryHandler(req: Request, res: Response) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const registry = db.getDatabaseRegistry(id);
    return res.json(registry);
  } catch (err: any) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
}
