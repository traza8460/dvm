import nodemailer from 'nodemailer';

export interface ReceiptEmailPayload {
  toEmail: string;
  studentName: string;
  studentId: string;
  electionTitle: string;
  receiptCode: string;
  votedAt: string;
}

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  private static getTransporter() {
    if (this.transporter) return this.transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      // In development / demo environment without SMTP credentials,
      // create a json/stream transport that logs reliably without blocking or failing
      this.transporter = nodemailer.createTransport({
        jsonTransport: true
      });
    }

    return this.transporter;
  }

  /**
   * Dispatches official vote receipt directly to voter's registered email
   */
  static async sendVoterReceipt(payload: ReceiptEmailPayload): Promise<{ success: boolean; messageId?: string; previewUrl?: string }> {
    const { toEmail, studentName, studentId, electionTitle, receiptCode, votedAt } = payload;

    const transporter = this.getTransporter();

    const formattedTime = new Date(votedAt).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'medium'
    });

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 24px; }
        .card { max-width: 540px; margin: 0 auto; background: #12131e; border: 1px solid #27273a; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.6); }
        .header { background: linear-gradient(135deg, #1e1b4b 0%, #311042 100%); padding: 28px 24px; text-align: center; border-bottom: 1px solid #3730a3; }
        .logo { font-size: 24px; font-weight: 900; letter-spacing: 1px; color: #ffffff; }
        .logo span { color: #818cf8; }
        .title { font-size: 14px; color: #a5b4fc; margin-top: 6px; text-transform: uppercase; letter-spacing: 1.5px; }
        .body-content { padding: 28px 24px; }
        .greeting { font-size: 16px; font-weight: 600; color: #ffffff; margin-bottom: 8px; }
        .text { font-size: 13px; color: #a1a1aa; line-height: 1.6; margin-bottom: 20px; }
        .receipt-box { background: #0b0c14; border: 2px dashed #4ade80; border-radius: 14px; padding: 20px; text-align: center; margin: 24px 0; }
        .receipt-label { font-size: 11px; font-family: monospace; font-weight: 700; color: #86efac; text-transform: uppercase; letter-spacing: 1px; }
        .receipt-code { font-size: 32px; font-family: monospace; font-weight: 900; color: #4ade80; letter-spacing: 3px; margin: 8px 0; }
        .details-table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
        .details-table td { padding: 8px 0; border-bottom: 1px solid #1f2030; }
        .details-label { color: #71717a; }
        .details-val { color: #e4e4e7; font-weight: 600; text-align: right; }
        .footer { padding: 20px 24px; background: #0b0c14; border-top: 1px solid #1f2030; font-size: 11px; color: #52525b; text-align: center; line-height: 1.5; }
        .badge { display: inline-block; background: rgba(74, 222, 128, 0.15); border: 1px solid rgba(74, 222, 128, 0.4); color: #4ade80; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">Digital <span>Voting</span> Machine</div>
          <div class="title">Official Voter Participation Slip</div>
        </div>
        <div class="body-content">
          <div class="greeting">Hello, ${studentName}!</div>
          <p class="text">
            Your ballot has been cryptographically cast and verified in the official school election: <strong>${electionTitle}</strong>.
          </p>
          
          <div class="receipt-box">
            <div class="receipt-label">Official Receipt Slip Code</div>
            <div class="receipt-code">${receiptCode}</div>
            <div class="badge">✓ BALLOT CONFIRMED</div>
          </div>

          <table class="details-table">
            <tr>
              <td class="details-label">Student ID</td>
              <td class="details-val">${studentId}</td>
            </tr>
            <tr>
              <td class="details-label">Voter Name</td>
              <td class="details-val">${studentName}</td>
            </tr>
            <tr>
              <td class="details-label">Time of Ballot Cast</td>
              <td class="details-val">${formattedTime}</td>
            </tr>
            <tr>
              <td class="details-label">Cryptographic Status</td>
              <td class="details-val" style="color: #4ade80;">Decoupled & Irreversible</td>
            </tr>
          </table>
        </div>
        <div class="footer">
          🛡️ <strong>Ballot Secrecy Guarantee:</strong> This receipt proves your participation without disclosing which candidate you voted for. Store this receipt ID for your records.
        </div>
      </div>
    </body>
    </html>
    `;

    try {
      const info = await transporter.sendMail({
        from: '"Digital Voting Machine" <noreply@dvm-elections.edu>',
        to: toEmail,
        subject: `🗳️ [DVM Official Receipt] Your Vote Receipt Slip: ${receiptCode}`,
        text: `Hello ${studentName},\n\nYour vote has been cast in ${electionTitle}.\n\nOfficial Receipt Code: ${receiptCode}\nTime Cast: ${formattedTime}\nStudent ID: ${studentId}\n\nThis receipt proves your participation. Keep it for your records.`,
        html: htmlContent
      });

      console.log(`📧 [Email Dispatched] Receipt ${receiptCode} sent to ${toEmail}`);
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.warn(`⚠️ [Email Warning] Could not send receipt to ${toEmail}:`, err.message);
      return { success: false };
    }
  }
}

