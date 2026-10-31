import { Request, Response } from 'express';
import { GeminiService } from '../services/geminiService.js';
import { db } from '../db.js';

export async function summarizeManifestoHandler(req: Request, res: Response) {
  try {
    const { candidateName, manifesto } = req.body;
    if (!manifesto) {
      return res.status(400).json({ error: 'Manifesto text required' });
    }

    const promises = await GeminiService.summarizeManifesto(candidateName || 'Candidate', manifesto);
    return res.json({ candidateName, promises });
  } catch (err: any) {
    return res.status(500).json({ error: 'AI_ERROR', message: err.message });
  }
}

export async function compareManifestosHandler(req: Request, res: Response) {
  try {
    const { electionId } = req.body;
    const election = db.elections.get(electionId);
    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    const candidateData = election.candidates.map(c => ({
      name: c.fullName,
      manifesto: c.manifesto
    }));

    const comparison = await GeminiService.compareManifestos(candidateData);
    return res.json(comparison);
  } catch (err: any) {
    return res.status(500).json({ error: 'AI_ERROR', message: err.message });
  }
}

export async function askAssistantHandler(req: Request, res: Response) {
  try {
    const { question, electionId, electionContext } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question required' });
    }

    const election = electionId 
      ? db.elections.get(electionId) 
      : (electionContext || Array.from(db.elections.values())[0]);
      
    const reply = await GeminiService.askElectionAssistant(question, election);

    return res.json({ reply, answer: reply });
  } catch (err: any) {
    return res.status(500).json({ error: 'AI_ERROR', message: err.message });
  }
}

export async function generateSpeechHandler(req: Request, res: Response) {
  try {
    const { candidateName, role, agenda } = req.body;
    const speech = await GeminiService.generateCampaignSpeech(
      candidateName || 'Student',
      role || 'Class Monitor',
      agenda || 'classroom improvement and transparent student voice'
    );
    return res.json({ speech });
  } catch (err: any) {
    return res.status(500).json({ error: 'AI_ERROR', message: err.message });
  }
}
