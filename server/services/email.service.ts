import { ENV } from "../_core/env";

/**
 * Email service using Gmail SMTP via nodemailer.
 * Falls back to a no-op when SMTP credentials are not configured.
 */

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private configured: boolean;

  constructor() {
    this.configured = !!(ENV.smtpUser && ENV.smtpPass);
  }

  isConfigured(): boolean {
    return this.configured;
  }

  /** Send an email via Gmail SMTP */
  async send(options: EmailOptions): Promise<EmailResult> {
    if (!this.configured) {
      return {
        success: false,
        error:
          "Email service not configured — SMTP_USER and SMTP_PASS required",
      };
    }

    try {
      // Lazy-load nodemailer to avoid startup errors when not installed
      const nodemailer = await import("nodemailer").catch(() => null);
      if (!nodemailer) {
        return {
          success: false,
          error: "nodemailer not installed — run: npm install nodemailer",
        };
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: ENV.smtpUser,
          pass: ENV.smtpPass,
        },
      });

      const from = options.from ?? `CEPHO <${ENV.smtpUser}>`;
      const info = await transporter.sendMail({
        from,
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        replyTo: options.replyTo,
        cc: options.cc
          ? Array.isArray(options.cc)
            ? options.cc.join(", ")
            : options.cc
          : undefined,
        bcc: options.bcc
          ? Array.isArray(options.bcc)
            ? options.bcc.join(", ")
            : options.bcc
          : undefined,
      });

      return { success: true, messageId: info.messageId };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }

  /** Send a simple plain-text notification */
  async sendNotification(
    to: string,
    subject: string,
    body: string
  ): Promise<EmailResult> {
    return this.send({ to, subject, text: body });
  }

  /** Send an HTML email */
  async sendHtml(
    to: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<EmailResult> {
    return this.send({ to, subject, html, text });
  }

  /** Test connection by verifying SMTP credentials */
  async testConnection(): Promise<{
    ok: boolean;
    user?: string;
    error?: string;
  }> {
    if (!this.configured) {
      return { ok: false, error: "SMTP credentials not configured" };
    }

    try {
      const nodemailer = await import("nodemailer").catch(() => null);
      if (!nodemailer) {
        return { ok: false, error: "nodemailer not installed" };
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: ENV.smtpUser, pass: ENV.smtpPass },
      });

      await transporter.verify();
      return { ok: true, user: ENV.smtpUser };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  }
}

export const emailService = new EmailService();
