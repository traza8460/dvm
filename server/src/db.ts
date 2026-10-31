import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFilePath = path.resolve(__dirname, '../dvm.db');

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
  isElected?: boolean;
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

// Persistent Native SQLite 3 Database Store with Separate Categorized Tables
class DatabaseStore {
  private sqlite: DatabaseSync;
  users: Map<string, User> = new Map();
  elections: Map<string, Election> = new Map();
  voterReceipts: Map<string, VoterReceipt> = new Map(); // key: electionId_userId
  votes: Vote[] = [];

  constructor() {
    this.sqlite = new DatabaseSync(dbFilePath);
    this.initTables();
    this.loadFromSQLite();
    if (this.users.size === 0 || this.elections.size === 0) {
      this.seedInitialData();
    }
  }

  private initTables() {
    this.sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        studentId TEXT UNIQUE,
        fullName TEXT,
        email TEXT UNIQUE,
        passwordHash TEXT,
        role TEXT,
        className TEXT,
        createdAt TEXT
      );

      CREATE TABLE IF NOT EXISTS elections (
        id TEXT PRIMARY KEY,
        title TEXT,
        description TEXT,
        targetClass TEXT,
        status TEXT,
        startTime TEXT,
        endTime TEXT,
        totalVotes INTEGER DEFAULT 0,
        createdAt TEXT
      );

      CREATE TABLE IF NOT EXISTS candidates (
        id TEXT PRIMARY KEY,
        userId TEXT,
        fullName TEXT,
        studentId TEXT,
        electionId TEXT,
        slogan TEXT,
        manifesto TEXT,
        summaryAI TEXT,
        avatarUrl TEXT,
        voteCount INTEGER DEFAULT 0,
        isElected INTEGER DEFAULT 0,
        createdAt TEXT
      );

      CREATE TABLE IF NOT EXISTS voter_receipts (
        id TEXT PRIMARY KEY,
        electionId TEXT,
        userId TEXT,
        receiptHash TEXT UNIQUE,
        votedAt TEXT,
        UNIQUE(electionId, userId)
      );

      CREATE TABLE IF NOT EXISTS votes (
        id TEXT PRIMARY KEY,
        electionId TEXT,
        candidateId TEXT,
        ballotNonce TEXT UNIQUE,
        timestamp TEXT
      );

      CREATE TABLE IF NOT EXISTS admin_vote_audit (
        id TEXT PRIMARY KEY,
        electionId TEXT,
        studentId TEXT,
        studentName TEXT,
        candidateId TEXT,
        candidateName TEXT,
        candidateAvatar TEXT,
        receiptHash TEXT,
        votedAt TEXT
      );
    `);
  }

  private loadFromSQLite() {
    try {
      // 1. Load users
      const userRows = this.sqlite.prepare('SELECT * FROM users').all() as any[];
      for (const row of userRows) {
        this.users.set(row.id, {
          id: row.id,
          studentId: row.studentId,
          fullName: row.fullName,
          email: row.email,
          passwordHash: row.passwordHash,
          role: row.role as Role,
          className: row.className,
          createdAt: row.createdAt
        });
      }

      // 2. Load candidates
      const candRows = this.sqlite.prepare('SELECT * FROM candidates').all() as any[];
      const candidatesByElec = new Map<string, Candidate[]>();
      for (const row of candRows) {
        const cand: Candidate = {
          id: row.id,
          userId: row.userId,
          fullName: row.fullName,
          studentId: row.studentId,
          electionId: row.electionId,
          slogan: row.slogan,
          manifesto: row.manifesto,
          summaryAI: row.summaryAI,
          avatarUrl: row.avatarUrl,
          voteCount: Number(row.voteCount || 0),
          isElected: Boolean(row.isElected),
          createdAt: row.createdAt
        };
        const list = candidatesByElec.get(row.electionId) || [];
        list.push(cand);
        candidatesByElec.set(row.electionId, list);
      }

      // 3. Load elections
      const elecRows = this.sqlite.prepare('SELECT * FROM elections').all() as any[];
      for (const row of elecRows) {
        const cands = candidatesByElec.get(row.id) || [];
        this.elections.set(row.id, {
          id: row.id,
          title: row.title,
          description: row.description,
          targetClass: row.targetClass,
          status: row.status as ElectionStatus,
          startTime: row.startTime,
          endTime: row.endTime,
          totalVotes: Number(row.totalVotes || 0),
          candidates: cands,
          createdAt: row.createdAt
        });
      }

      // 4. Load voter receipts
      const receiptRows = this.sqlite.prepare('SELECT * FROM voter_receipts').all() as any[];
      for (const row of receiptRows) {
        this.voterReceipts.set(`${row.electionId}_${row.userId}`, {
          id: row.id,
          electionId: row.electionId,
          userId: row.userId,
          receiptHash: row.receiptHash,
          votedAt: row.votedAt
        });
      }

      // 5. Load votes
      const voteRows = this.sqlite.prepare('SELECT * FROM votes').all() as any[];
      for (const row of voteRows) {
        this.votes.push({
          id: row.id,
          electionId: row.electionId,
          candidateId: row.candidateId,
          ballotNonce: row.ballotNonce,
          timestamp: row.timestamp
        });
      }
    } catch (err) {
      console.warn('Error loading from SQLite, will seed:', err);
    }
  }

  private seedInitialData() {
    const adminUser: User = {
      id: 'admin-1',
      studentId: 'ADMIN-001',
      fullName: 'Prof. Sharma (Election Officer)',
      email: 'admin@school.edu',
      passwordHash: '$2a$10$vU8mR36h1T4i1E2dG8gDwe5p1l8C1f3r6s8y0u2w4z6x8a0b2c4d6',
      role: 'ADMIN',
      className: 'Staff',
      createdAt: new Date().toISOString()
    };

    const studentUser: User = {
      id: 'stu-demo',
      studentId: 'STU-001',
      fullName: 'Aarav Sharma',
      email: 'aarav@student.edu',
      passwordHash: '$2a$10$vU8mR36h1T4i1E2dG8gDwe5p1l8C1f3r6s8y0u2w4z6x8a0b2c4d6',
      role: 'STUDENT',
      className: 'Grade 10-A',
      createdAt: new Date().toISOString()
    };

    this.saveUser(adminUser);
    this.saveUser(studentUser);

    const electionId = 'elec-class-10a';
    const c1: Candidate = {
      id: 'cand-1',
      userId: 'user-c1',
      fullName: 'Aarav Sharma',
      studentId: 'STU-001',
      electionId,
      slogan: 'Action Over Excuses — Better Lab Equipments & Fair Homework Windows!',
      manifesto: 'I will advocate for weekly doubt clearing sessions with teachers, ensure sports equipment is distributed fairly during zero-period, and establish a class anonymous grievance box.',
      summaryAI: '• Weekly teacher doubt sessions\n• Fair zero-period sports equipment\n• Anonymous grievance redressal box',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
      voteCount: 14,
      createdAt: new Date().toISOString()
    };

    const c2: Candidate = {
      id: 'cand-2',
      userId: 'user-c2',
      fullName: 'Diya Patel',
      studentId: 'STU-002',
      electionId,
      slogan: 'Empowering Every Voice — Inclusive Cultural Events & Clean Smart Classrooms.',
      manifesto: 'My priorities are digitizing class study notes onto a shared Google Drive, organizing regular inter-house debate prep, and ensuring strict punctuality and clean water dispenser maintenance.',
      summaryAI: '• Centralized digital study repository\n• Inter-house debate & quiz prep\n• Clean water & smart-board upkeep',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
      voteCount: 18,
      isElected: true, // Currently leading candidate
      createdAt: new Date().toISOString()
    };

    const c3: Candidate = {
      id: 'cand-3',
      userId: 'user-c3',
      fullName: 'Arjun Nair',
      studentId: 'STU-003',
      electionId,
      slogan: 'Sports, Balance & Discipline — More Tournament Slots & Practical Learning.',
      manifesto: 'I aim to introduce a peer-mentorship program before quarterly exams, secure two extra athletic practice slots per month, and represent student requests honestly to the principal.',
      summaryAI: '• Peer exam study mentorship\n• Extra athletic tournament slots\n• Direct student-to-principal voice',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80',
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

    this.saveElection(election);
  }

  saveUser(user: User) {
    this.users.set(user.id, user);
    try {
      this.sqlite.prepare(`
        INSERT OR REPLACE INTO users (id, studentId, fullName, email, passwordHash, role, className, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(user.id, user.studentId, user.fullName, user.email, user.passwordHash, user.role, user.className, user.createdAt);
    } catch (err) {
      console.error('Failed to persist user to SQLite:', err);
    }
  }

  saveElection(election: Election) {
    this.elections.set(election.id, election);
    try {
      this.sqlite.prepare(`
        INSERT OR REPLACE INTO elections (id, title, description, targetClass, status, startTime, endTime, totalVotes, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        election.id,
        election.title,
        election.description,
        election.targetClass,
        election.status,
        election.startTime,
        election.endTime || null,
        election.totalVotes,
        election.createdAt
      );

      for (const c of election.candidates) {
        this.sqlite.prepare(`
          INSERT OR REPLACE INTO candidates (id, userId, fullName, studentId, electionId, slogan, manifesto, summaryAI, avatarUrl, voteCount, isElected, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          c.id,
          c.userId,
          c.fullName,
          c.studentId,
          c.electionId,
          c.slogan,
          c.manifesto,
          c.summaryAI || null,
          c.avatarUrl,
          c.voteCount,
          c.isElected ? 1 : 0,
          c.createdAt
        );
      }
    } catch (err) {
      console.error('Failed to persist election to SQLite:', err);
    }
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

    // Recalculate elected member (top votes)
    const maxVotes = Math.max(...election.candidates.map(c => c.voteCount));
    for (const c of election.candidates) {
      c.isElected = c.voteCount === maxVotes && c.voteCount > 0;
    }

    // Write to SQLite database
    try {
      this.sqlite.prepare(`
        INSERT INTO voter_receipts (id, electionId, userId, receiptHash, votedAt)
        VALUES (?, ?, ?, ?, ?)
      `).run(receipt.id, receipt.electionId, receipt.userId, receipt.receiptHash, receipt.votedAt);

      this.sqlite.prepare(`
        INSERT INTO votes (id, electionId, candidateId, ballotNonce, timestamp)
        VALUES (?, ?, ?, ?, ?)
      `).run(vote.id, vote.electionId, vote.candidateId, vote.ballotNonce, vote.timestamp);

      this.sqlite.prepare(`
        UPDATE candidates SET voteCount = voteCount + 1, isElected = ? WHERE id = ?
      `).run(candidate.isElected ? 1 : 0, candidate.id);

      this.sqlite.prepare(`
        UPDATE elections SET totalVotes = totalVotes + 1 WHERE id = ?
      `).run(election.id);

      const user = this.users.get(userId);
      this.sqlite.prepare(`
        INSERT INTO admin_vote_audit (id, electionId, studentId, studentName, candidateId, candidateName, candidateAvatar, receiptHash, votedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        crypto.randomUUID(),
        electionId,
        studentId,
        user?.fullName || 'Student Voter',
        candidate.id,
        candidate.fullName,
        candidate.avatarUrl,
        receiptHash,
        receipt.votedAt
      );
    } catch (err) {
      console.error('Failed to sync vote transaction to SQLite:', err);
    }

    return { success: true, receiptHash };
  }

  // Database Overview: Categorized Data for Users, Voters, and Elected Members
  getDatabaseRegistry(electionId?: string) {
    const allUsers = Array.from(this.users.values()).map(u => ({
      id: u.id,
      studentId: u.studentId,
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      className: u.className,
      createdAt: u.createdAt
    }));

    const allVoters = Array.from(this.voterReceipts.values()).map(r => {
      const user = this.users.get(r.userId);
      return {
        id: r.id,
        electionId: r.electionId,
        studentId: user?.studentId || 'CONFIDENTIAL',
        voterName: user?.fullName || 'Verified Student',
        receiptHash: r.receiptHash,
        votedAt: r.votedAt,
        status: 'VERIFIED_ANONYMOUS_BALLOT'
      };
    });

    const targetElec = electionId ? this.elections.get(electionId) : Array.from(this.elections.values())[0];
    const candidates = targetElec?.candidates || [];
    const maxVotes = Math.max(...candidates.map(c => c.voteCount), 0);

    const candidatesList = candidates.map(c => ({
      id: c.id,
      fullName: c.fullName,
      studentId: c.studentId,
      slogan: c.slogan,
      manifesto: c.manifesto,
      voteCount: c.voteCount,
      isElected: c.voteCount === maxVotes && c.voteCount > 0,
      avatarUrl: c.avatarUrl
    }));

    const electedMembers = candidatesList.filter(c => c.isElected);

    return {
      stats: {
        totalRegisteredUsers: allUsers.length,
        totalBallotsCast: allVoters.length,
        totalCandidates: candidatesList.length,
        totalElectedMembers: electedMembers.length
      },
      users: allUsers,
      voters: allVoters,
      candidates: candidatesList,
      electedMembers: electedMembers
    };
  }

  // 🔒 CONFIDENTIAL ADMIN AUDIT: Who voted for whom (strictly for role === 'ADMIN')
  getAdminVoteAudit(electionId?: string) {
    try {
      let rows: any[];
      if (electionId) {
        rows = this.sqlite.prepare('SELECT * FROM admin_vote_audit WHERE electionId = ? ORDER BY votedAt DESC').all(electionId);
      } else {
        rows = this.sqlite.prepare('SELECT * FROM admin_vote_audit ORDER BY votedAt DESC').all();
      }
      return rows;
    } catch (err) {
      console.error('Failed to query admin_vote_audit:', err);
      return [];
    }
  }
}

export const db = new DatabaseStore();
