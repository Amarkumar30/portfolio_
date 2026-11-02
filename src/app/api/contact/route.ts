/**
 * Contact API route validates submissions, rejects honeypot spam, and sends emails through Resend.
 * Responds { ok: true } (200) once the message reaches Amar's inbox, or { ok: false, error } with a
 * 4xx/5xx status. The confirmation email to the sender is best-effort: it runs after the response
 * and a failure there is only logged.
 * Props: standard Next.js Request object.
 * Used in: client contact form POST requests.
 * TODO: Swap the onboarding sender for your verified production domain when ready.
 */
import { after, NextResponse } from "next/server";
import { Resend } from "resend";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface ContactPayload {
  name?: string;
  email?: string;
  message?: string;
  company?: string;
}

function fail(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(request: Request) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const contactToEmail =
      process.env.CONTACT_TO_EMAIL ?? "amar.kumar.career@gmail.com";
    const contactFromEmail = process.env.CONTACT_FROM_EMAIL;

    if (!resendApiKey || !contactFromEmail) {
      console.error("Missing contact email environment variables.");

      return fail("not_configured", 503);
    }

    let body: ContactPayload;
    try {
      body = (await request.json()) as ContactPayload;
    } catch {
      return fail("Invalid request.", 400);
    }

    const name = body.name?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const message = body.message?.trim() ?? "";
    const company = body.company?.trim() ?? "";
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (company) {
      return fail("Spam submission rejected.", 400);
    }

    if (!name || !email || !message) {
      return fail("Name, email, and message are all required.", 400);
    }

    if (!emailPattern.test(email)) {
      return fail("Please provide a valid email address.", 400);
    }

    const resend = new Resend(resendApiKey);
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

    const { error: inboxError } = await resend.emails.send({
      from: contactFromEmail,
      to: contactToEmail,
      subject: `New portfolio contact from ${name}`,
      replyTo: email,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #16211d;">
          <h2>New Portfolio Contact Submission</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Message:</strong></p>
          <p>${safeMessage}</p>
        </div>
      `,
    });

    if (inboxError) {
      console.error("[contact] inbox email failed", inboxError);

      return fail("Failed to send email.", 502);
    }

    // The message has arrived, so the visitor sees success no matter what happens here.
    // (With the onboarding@resend.dev sender, Resend rejects mail to anyone but the account owner.)
    after(async () => {
      try {
        const { error: confirmationError } = await resend.emails.send({
          from: contactFromEmail,
          to: email,
          subject: "Thanks for reaching out to Amar Kumar",
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #16211d;">
              <h2>Message received</h2>
              <p>Hi ${safeName},</p>
              <p>Thanks for reaching out through my portfolio website. I’ve received your message and will get back to you as soon as I can.</p>
              <p>Best regards,<br />Amar Kumar</p>
            </div>
          `,
        });

        if (confirmationError) {
          console.error("[contact] confirmation email failed", confirmationError);
        }
      } catch (error) {
        console.error("[contact] confirmation email failed", error);
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[contact]", error);

    return fail("Something went wrong.", 500);
  }
}
