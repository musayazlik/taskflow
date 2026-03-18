import { Resend } from "resend";
import { env } from "@api/lib/env";
import { logger } from "@api/lib/logger";

/**
 * Resend client instance
 * Used for sending transactional emails
 */
export const resend = env.RESEND_API_KEY
  ? new Resend(env.RESEND_API_KEY)
  : null;

/**
 * Default email sender
 * Falls back to a default if not configured
 */
export const FROM_EMAIL = env.FROM_EMAIL || "onboarding@resend.dev";

/**
 * Check if email service is configured
 */
export const isEmailConfigured = (): boolean => {
  return resend !== null && env.RESEND_API_KEY !== undefined;
};

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
}

/**
 * Send email using Resend
 * In development without RESEND_API_KEY, logs email to console
 */
export const sendEmail = async (options: SendEmailOptions) => {
  const recipients = Array.isArray(options.to) ? options.to : [options.to];

  // Development mode: Log email to logger if no API key
  if (!resend) {
    logger.info({
      to: recipients,
      from: FROM_EMAIL,
      subject: options.subject,
      text: options.text?.split("\n").slice(0, 10).join("\n"),
    }, "EMAIL (Development Mode - No RESEND_API_KEY)");
    return { id: `dev-${Date.now()}` };
  }

  try {
    const emailData: any = {
      from: FROM_EMAIL,
      to: recipients,
      subject: options.subject,
      replyTo: options.replyTo,
    };

    if (options.html) emailData.html = options.html;
    if (options.text) emailData.text = options.text;

    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      logger.error({ err: error, recipients, subject: options.subject }, "Failed to send email");
      throw new Error(`Failed to send email: ${error.message}`);
    }

    logger.info({ emailId: data?.id, recipients, subject: options.subject }, "Email sent successfully");
    return data;
  } catch (error) {
    logger.error({ err: error, recipients, subject: options.subject }, "Email sending error");
    throw error;
  }
};
