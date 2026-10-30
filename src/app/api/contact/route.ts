/**
 * Contact API route validates submissions, rejects honeypot spam, and sends emails through Resend.
 * Props: standard Next.js Request object.
 * Used in: client contact form POST requests.
 * TODO: Swap the onboarding sender for your verified production domain when ready.
 */
import { NextResponse } from "next/server";
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

export async function POST(request: Request) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const contactToEmail =
      process.env.CONTACT_TO_EMAIL ?? "amar.kumar.career@gmail.com";
    const contactFromEmail = process.env.CONTACT_FROM_EMAIL;

    if (!resendApiKey || !contactFromEmail) {
      console.error("Missing contact email environment variables.");

      return NextResponse.json(
        { error: "not_configured" },
        { status: 503 },
      );
    }

    const body = (await request.json()) as ContactPayload;
    const name = body.name?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const message = body.message?.trim() ?? "";
    const company = body.company?.trim() ?? "";
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (company) {
      return NextResponse.json(
        { error: "Spam submission rejected." },
        { status: 400 },
      );
    }

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are all required." },
        { status: 400 },
      );
    }

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 },
      );
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
      console.error(inboxError);

      return NextResponse.json(
        { error: "Failed to send email." },
        { status: 500 },
      );
    }

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
      console.error(confirmationError);

      return NextResponse.json(
        {
          error:
            "Your message was received, but the confirmation email could not be sent.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Message sent successfully!",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
