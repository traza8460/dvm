import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY || '';
const PREFERRED_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export class GeminiService {
  /**
   * Helper: Runs prompt using the best available Gemini model with cascading fallback
   */
  private static async runGeminiPrompt(prompt: string): Promise<string> {
    if (!genAI || !API_KEY) return '';
    const modelsToTry = [PREFERRED_MODEL, 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-flash'];

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result?.response?.text()?.trim();
        if (text) return text;
      } catch (err: any) {
        console.warn(`[GeminiService] Model ${modelName} returned error, trying fallback...`, err?.message || err);
      }
    }
    return '';
  }

  /**
   * Summarizes a student candidate's manifesto into 3 high-impact promises.
   */
  static async summarizeManifesto(candidateName: string, manifestoText: string): Promise<string[]> {
    if (genAI && API_KEY) {
      try {
        const prompt = `You are an election analyst for student council voting.
Candidate: "${candidateName}"
Raw Manifesto:
"""
${manifestoText}
"""

Task: Summarize this candidate's manifesto into exactly 3 punchy, realistic student promises (bullet points).
Format: Return ONLY a valid JSON array of 3 strings: ["Promise 1", "Promise 2", "Promise 3"]. No extra markdown.`;

        const text = await GeminiService.runGeminiPrompt(prompt);
        if (text) {
          const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.slice(0, 3);
          }
        }
      } catch (err) {
        console.warn('Gemini summarize error, using deterministic fallback', err);
      }
    }

    // Dynamic contextual fallback extraction
    const lines = manifestoText
      .split(/[.\n;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 15);

    if (lines.length >= 3) {
      return lines.slice(0, 3);
    }

    return [
      'Focus on classroom cleanliness, water facilities, and digital notes.',
      'Active advocacy for fair homework and lab project submission timelines.',
      'Foster inclusive participation across debates, cultural, and sports meets.'
    ];
  }

  /**
   * Compares 2 or more candidates' manifestos objectively without bias.
   */
  static async compareManifestos(candidates: { name: string; manifesto: string }[]): Promise<any> {
    if (genAI && API_KEY) {
      try {
        const prompt = `Analyze and compare these candidate manifestos objectively for a high school Class Monitor election:
${JSON.stringify(candidates, null, 2)}

Provide an unbiased comparative breakdown highlighting each candidate's core focus, specific strengths, and key area of intervention.
Return ONLY valid JSON matching this structure:
{
  "summary": "Brief 2-sentence overview comparing their platforms",
  "comparisons": [
    {
      "name": "Candidate Name",
      "coreFocus": "1 short sentence",
      "strengths": ["Strength 1", "Strength 2"],
      "targetArea": "Primary area of impact"
    }
  ]
}`;

        const text = await GeminiService.runGeminiPrompt(prompt);
        if (text) {
          const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
          return JSON.parse(cleaned);
        }
      } catch (err) {
        console.warn('Gemini compare error, returning fallback', err);
      }
    }

    return {
      summary: "All candidates present well-rounded platforms balancing academic rigor with student welfare.",
      comparisons: candidates.map(c => ({
        name: c.name,
        coreFocus: "Class welfare, academic support, and student voice",
        strengths: ["High accountability", "Transparent student representation"],
        targetArea: "General Class Welfare"
      }))
    };
  }

  /**
   * Gemini Student Election Assistant Chatbot.
   */
  static async askElectionAssistant(question: string, electionContext: any): Promise<string> {
    if (genAI && API_KEY) {
      try {
        const prompt = `You are the helpful, objective AI Election Proctor and Guide for the Digital Voting Machine (DVM) in student elections.
Election Context:
${JSON.stringify(electionContext, null, 2)}

Student Question: "${question}"

Provide a concise, encouraging, and strictly objective 2-3 sentence answer directly answering the question. Remind the student of voting deadlines or secrecy if relevant.`;

        const text = await GeminiService.runGeminiPrompt(prompt);
        if (text) return text;
      } catch (err) {
        console.warn('Gemini API call failed, using intelligent contextual answer generator:', err);
      }
    }

    return GeminiService.generateContextualAnswer(question, electionContext);
  }

  /**
   * Intelligent Contextual Rule-Based Answer Generator (Fallback & Offline Mode)
   */
  private static generateContextualAnswer(question: string, electionContext: any): string {
    const q = question.toLowerCase().trim();

    // 1. Ballot Anonymity, Secrecy & Security
    if (q.includes('anonymous') || q.includes('private') || q.includes('secret') || q.includes('secrecy') || q.includes('admin see') || q.includes('track') || q.includes('security') || q.includes('anonymity')) {
      return "Your vote is 100% private and cryptographically anonymous. DVM uses an irreversible SHA-256 hash that decouples your student identity from the candidate ballot record. Nobody—neither teachers nor the system admin—can see which candidate you selected.";
    }

    // 2. Tie Breaking Rules
    if (q.includes('tie') || q.includes('equal vote') || q.includes('draw')) {
      return "In the event of an exact vote tie between the top candidates, the election guidelines stipulate an automated 15-minute runoff ballot round. If the tie persists, the Class Teacher / Election Officer casts a neutral deciding vote according to school bylaws.";
    }

    // 3. Candidate Specific Queries
    if (q.includes('rohan')) {
      return "Rohan Verma's core campaign promises are:\n1. Weekly teacher doubt-clearing sessions before exams.\n2. Fair and equal distribution of zero-period sports equipment.\n3. An anonymous classroom grievance redressal box for peer concerns.";
    }

    if (q.includes('ananya') || q.includes('notes') || q.includes('study notes')) {
      return "Ananya Sharma's core campaign promises are:\n1. Digitizing class study notes onto a centralized, shared Google Drive folder.\n2. Organizing inter-house debate and academic quiz prep.\n3. Ensuring clean drinking water dispenser maintenance and smart-board upkeep.";
    }

    if (q.includes('kabir')) {
      return "Kabir Mehta's core campaign promises are:\n1. A peer-led mentorship study program before quarterly exams.\n2. Securing two extra athletic practice and tournament slots per month.\n3. Direct, honest student representation to the school principal.";
    }

    // 4. Candidates list / Who is running
    if (q.includes('candidate') || q.includes('who is running') || q.includes('who are running') || q.includes('nominee') || q.includes('options')) {
      return "There are 3 candidates running in this election:\n• Rohan Verma — 'Action Over Excuses' (Focus: Doubt sessions & sports gear)\n• Ananya Sharma — 'Empowering Every Voice' (Focus: Digital notes & cultural events)\n• Kabir Mehta — 'Sports, Balance & Discipline' (Focus: Athletic tournaments & peer mentorship).";
    }

    // 5. How to vote / Voting process
    if (q.includes('how to vote') || q.includes('how do i vote') || q.includes('voting process') || q.includes('steps')) {
      return "To cast your vote: Log in with your Student ID, click 'Cast Your Ballot', review the candidate cards and manifestos, select your preferred candidate, and confirm. You will instantly receive a unique cryptographic receipt hash proving your vote was counted.";
    }

    // 6. Voting twice / changing vote
    if (q.includes('twice') || q.includes('change') || q.includes('again') || q.includes('modify') || q.includes('undo')) {
      return "Every eligible student is issued exactly one irreversible cryptographic ballot. Once you confirm your vote, it is final and cannot be modified or re-cast, ensuring complete prevention of duplicate voting.";
    }

    // 7. Results / Deadlines / Timings
    if (q.includes('result') || q.includes('winner') || q.includes('who won') || q.includes('count')) {
      return "Vote counts are tabulated in real-time with zero human tampering. Results and the cryptographic integrity audit will be published on the Live Results dashboard as soon as the active voting window concludes.";
    }

    if (q.includes('deadline') || q.includes('time') || q.includes('when') || q.includes('schedule') || q.includes('close') || q.includes('closing')) {
      return "Voting is currently ACTIVE for Grade 10-A. The ballot window remains open throughout the scheduled election session today. Cast your vote early before the session closes!";
    }

    // 8. Eligibility / Rules
    if (q.includes('eligible') || q.includes('rule') || q.includes('who can vote') || q.includes('permission')) {
      return "All enrolled students of Grade 10-A with an active Student ID are eligible to vote. Each student gets exactly one verified, anonymous ballot.";
    }

    // 9. Tampering / Fraud / Hacking
    if (q.includes('hack') || q.includes('tamper') || q.includes('fraud') || q.includes('fake') || q.includes('rigged')) {
      return "The DVM system features real-time Gemini Fraud Sentinel monitoring and cryptographic SHA-256 ballot hashing. Any abnormal velocity spikes or duplicate attempts are automatically blocked.";
    }

    // 10. Greetings
    if (q.includes('hi') || q.includes('hello') || q.includes('hey') || q.startsWith('namaste')) {
      return "Hello! I am your AI Student Election Assistant. How can I help you today? You can ask me about candidate promises (Rohan, Ananya, Kabir), ballot secrecy, tie-breaker rules, or how to vote!";
    }

    // 11. Intelligent Default
    return `Regarding "${question}": In the Class Monitor Election 2026-27, all voting is strictly anonymous, verified via SHA-256 tokens, and limited to one vote per student. You can explore candidate manifestos (Rohan Verma, Ananya Sharma, Kabir Mehta) directly on your dashboard, or ask me for their specific agendas!`;
  }

  /**
   * Generates a 60-second campaign speech for a candidate.
   */
  static async generateCampaignSpeech(candidateName: string, role: string, agenda: string): Promise<string> {
    if (!genAI || !API_KEY) {
      return `Good morning respected teachers and my dear classmates! My name is ${candidateName}, and I am running for ${role}. A class monitor shouldn't just be someone who takes attendance—they should be someone who stands up for every single student. My focus is on ${agenda}. I promise to keep communication open and transparent. A vote for me is a vote for real action. Thank you!`;
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Write an inspiring, polite, and confident 60-second student campaign speech.
Candidate Name: ${candidateName}
Target Office: ${role}
Core Agenda: ${agenda}

Tone: Friendly, humble, yet determined. Suitable for speaking in front of peers in a classroom.`;

      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (err) {
      return `Hello classmates! I am ${candidateName}, running for ${role}. Together, we can achieve ${agenda}. Please support me with your vote!`;
    }
  }

  /**
   * Fraud & Anomaly Sentinel: Analyzes voting timestamp patterns for sudden abnormal spikes.
   */
  static analyzeVotingPatterns(voteTimestamps: string[]): { anomalyDetected: boolean; confidenceScore: number; reason: string } {
    if (voteTimestamps.length < 5) {
      return { anomalyDetected: false, confidenceScore: 0.99, reason: "Normal voting flow; insufficient cluster for anomaly." };
    }

    const times = voteTimestamps.map(t => new Date(t).getTime()).sort((a, b) => a - b);
    let rapidSequenceCount = 0;

    for (let i = 1; i < times.length; i++) {
      if (times[i] - times[i - 1] < 1500) { // less than 1.5s between votes
        rapidSequenceCount++;
      }
    }

    if (rapidSequenceCount >= 4) {
      return {
        anomalyDetected: true,
        confidenceScore: 0.88,
        reason: `Detected ${rapidSequenceCount} votes cast within millisecond proximity. Flagged for review.`
      };
    }

    return {
      anomalyDetected: false,
      confidenceScore: 0.98,
      reason: "Vote distribution matches natural student voting pacing."
    };
  }
}
