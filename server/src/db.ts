import crypto from 'crypto';

export type Role = 'STUDENT' | 'CANDIDATE' | 'ADMIN';
export type ElectionStatus = 'UPCOMING' | 'ACTIVE' | 'CLOSED';

export interface User {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: Role;
  className: string;
  createdAt: string;
}

export interface Candidate {
  id: string;
  userId: string;
  fullName: string;
  studentId: string;
  electionId: string;
  slogan: string;
  manifesto: string;
  summaryAI?: string;
  avatarUrl: string;
  voteCount: number;
  createdAt: string;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  targetClass: string;
  status: ElectionStatus;
  startTime: string;
  endTime?: string;
  totalVotes: number;
  candidates: Candidate[];
  createdAt: string;
}

export interface VoterReceipt {
  id: string;
  electionId: string;
  userId: string;
  receiptHash: string; // SHA-256(studentId + electionId + salt)
  votedAt: string;
}

export interface Vote {
  id: string;
  electionId: string;
  candidateId: string;
  ballotNonce: string; // Decoupled anonymous ballot token
  timestamp: string;
}

// In-Memory Thread-Safe & Atomic Database Store with Seed Data
class DatabaseStore {
  users: Map<string, User> = new Map();
  elections: Map<string, Election> = new Map();
  voterReceipts: Map<string, VoterReceipt> = new Map(); // key: electionId_userId
  votes: Vote[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Seed Demo Students & Admin
    const adminUser: User = {
      id: 'admin-1',
      studentId: 'ADMIN-001',
      fullName: 'Prof. Sharma (Election Officer)',
      email: 'admin@school.edu',
      passwordHash: '$2a$10$vU8mR36h1T4i1E2dG8gDwe5p1l8C1f3r6s8y0u2w4z6x8a0b2c4d6', // demoPassword123
      role: 'ADMIN',
      className: 'Staff',
      createdAt: new Date().toISOString()
    };

    const studentUser: User = {
      id: 'stu-demo',
      studentId: 'STU2026-042',
      fullName: 'Aarav Patel',
      email: 'aarav@student.edu',
      passwordHash: '$2a$10$vU8mR36h1T4i1E2dG8gDwe5p1l8C1f3r6s8y0u2w4z6x8a0b2c4d6',
      role: 'STUDENT',
      className: 'Grade 10-A',
      createdAt: new Date().toISOString()
    };

    this.users.set(adminUser.id, adminUser);
    this.users.set(studentUser.id, studentUser);

    // 2. Seed Active Election: "Class Monitor Election 2026-27"
    const electionId = 'elec-class-10a';
    const c1: Candidate = {
      id: 'cand-1',
      userId: 'user-c1',
      fullName: 'Rohan Verma',
      studentId: 'STU2026-015',
      electionId,
      slogan: 'Action Over Excuses — Better Lab Equipments & Fair Homework Windows!',
      manifesto: 'I will advocate for weekly doubt clearing sessions with teachers, ensure sports equipment is distributed fairly during zero-period, and establish a class anonymous grievance box.',
      summaryAI: '• Weekly teacher doubt sessions\n• Fair zero-period sports equipment\n• Anonymous grievance redressal box',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
      voteCount: 14,
      createdAt: new Date().toISOString()
    };

    const c2: Candidate = {
      id: 'cand-2',
      userId: 'user-c2',
      fullName: 'Ananya Sharma',
      studentId: 'STU2026-028',
      electionId,
      slogan: 'Empowering Every Voice — Inclusive Cultural Events & Clean Smart Classrooms.',
      manifesto: 'My priorities are digitizing class study notes onto a shared Google Drive, organizing regular inter-house debate prep, and ensuring strict punctuality and clean water dispenser maintenance.',
      summaryAI: '• Centralized digital study repository\n• Inter-house debate & quiz prep\n• Clean water & smart-board upkeep',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      voteCount: 18,
      createdAt: new Date().toISOString()
    };

    const c3: Candidate = {
      id: 'cand-3',
      userId: 'user-c3',
      fullName: 'Kabir Mehta',
      studentId: 'STU2026-033',
      electionId,
      slogan: 'Sports, Balance & Discipline — More Tournament Slots & Practical Learning.',
      manifesto: 'I aim to introduce a peer-mentorship program before quarterly exams, secure two extra athletic practice slots per month, and represent student requests honestly to the principal.',
      summaryAI: '• Peer exam study mentorship\n• Extra athletic tournament slots\n• Direct student-to-principal voice',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      voteCount: 9,
      createdAt: new Date().toISOString()
    };

    const election: Election = {
      id: electionId,
      title: 'Class Monitor Election 2026-27',
      description: 'Vote for your Class Representative for Grade 10-A. One vote per student, strictly anonymous and verified.',
      targetClass: 'Grade 10-A',
      status: 'ACTIVE',
      startTime: new Date().toISOString(),
      totalVotes: 41,
      candidates: [c1, c2, c3],
      createdAt: new Date().toISOString()
    };

    this.elections.set(election.id, election);
  }

  // Atomic Vote Submission with Fraud Prevention & Ballot Secrecy
  async castVoteAtomic(userId: string, studentId: string, electionId: string, candidateId: string, salt: string): Promise<{ success: boolean; receiptHash: string }> {
    const receiptKey = `${electionId}_${userId}`;

    // 1. Double Vote Check
    if (this.voterReceipts.has(receiptKey)) {
      throw new Error('DUPLICATE_VOTE: You have already cast your ballot in this election.');
    }

    const election = this.elections.get(electionId);
    if (!election) {
      throw new Error('ELECTION_NOT_FOUND: The requested election does not exist.');
    }

    if (election.status !== 'ACTIVE') {
      throw new Error('ELECTION_INACTIVE: Voting is currently closed for this election.');
    }

    const candidate = election.candidates.find(c => c.id === candidateId);
    if (!candidate) {
      throw new Error('CANDIDATE_NOT_FOUND: Invalid candidate selected.');
    }

    // 2. Generate Irreversible Cryptographic Receipt Hash
    // SHA-256(studentId + electionId + salt)
    const receiptHash = crypto
      .createHash('sha256')
      .update(`${studentId}_${electionId}_${salt}`)
      .digest('hex');

    // 3. Decoupled Anonymous Ballot Nonce
    const ballotNonce = crypto.randomBytes(16).toString('hex');

    // 4. Atomic Mutation
    const receipt: VoterReceipt = {
      id: crypto.randomUUID(),
      electionId,
      userId,
      receiptHash,
      votedAt: new Date().toISOString()
    };

    const vote: Vote = {
      id: crypto.randomUUID(),
      electionId,
      candidateId,
      ballotNonce,
      timestamp: new Date().toISOString()
    };

    this.voterReceipts.set(receiptKey, receipt);
    this.votes.push(vote);

    candidate.voteCount += 1;
    election.totalVotes += 1;

    return { success: true, receiptHash };
  }
}

export const db = new DatabaseStore();
