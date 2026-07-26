/**
 * Email delivery abstraction.
 * Without a provider configured, development logs the message and production
 * still returns success to the caller so flows do not leak account existence —
 * operators must configure RESEND_API_KEY (or replace this service) for real mail.
 *
 * White-label: From-name / template slots belong in BrandingConfig
 * (docs/WHITE_LABEL_ARCHITECTURE.md) — do not hard-code customer brands here.
 * Platform default remains EMAIL_FROM until white-label product ships.
 */
export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
};

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.EMAIL_FROM ?? "TheStrongestManager <onboarding@resend.dev>";

  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[email] RESEND_API_KEY is not set. Password-reset email was not delivered.",
      );
    } else {
      console.info("[email:dev]", {
        to: input.to,
        subject: input.subject,
        text: input.text,
      });
    }
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to send email: ${response.status} ${body}`);
  }
}
