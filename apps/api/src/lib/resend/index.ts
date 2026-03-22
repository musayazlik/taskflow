/**
 * @fileoverview Resend email client: transactional sends with a dev fallback when no API key is set.
 * @module @api/lib/resend
 */

import { Resend } from "resend";
import { env } from "@api/lib/env";
import { logger } from "@api/lib/logger";

/**
 * Resend SDK instance, or `null` when `RESEND_API_KEY` is missing.
 *
 * @remarks Callers should check {@link isEmailConfigured} before relying on delivery.
 */
export const resend = env.RESEND_API_KEY
  ? new Resend(env.RESEND_API_KEY)
  : null;

/**
 * Default `From:` address (`env.FROM_EMAIL` or Resend onboarding placeholder).
 *
 * @remarks Verify your domain in Resend for production deliverability.
 */
export const FROM_EMAIL = env.FROM_EMAIL || "onboarding@resend.dev";

/**
 * @returns `true` if Resend client exists and API key is defined.
 */
export const isEmailConfigured = (): boolean => {
  return resend !== null && env.RESEND_API_KEY !== undefined;
};

/**
 * Options for {@link sendEmail}.
 */
export interface SendEmailOptions {
  /** Recipient(s). */
  to: string | string[];
  /** Email subject line. */
  subject: string;
  /** HTML body (either `html` or `text` should usually be set). */
  html?: string;
  /** Plain-text body. */
  text?: string;
  /** Optional Reply-To header. */
  replyTo?: string;
}

/**
 * Sends a transactional email via Resend.
 *
 * @param options - Recipients, subject, and body content.
 * @returns Resend API response data, or a dev `{ id: "dev-..." }` when unconfigured.
 *
 * @remarks
 * - Without `RESEND_API_KEY`, logs a preview via {@link logger} and returns a fake id — **no network call**.
 * - On Resend failure, logs and throws.
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
