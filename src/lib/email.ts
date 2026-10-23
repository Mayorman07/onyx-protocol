import "server-only";
import { Resend } from "resend";

// Server-only: holds RESEND_API_KEY. Never import from a "use client" file.

let client: Resend | undefined;

function env(name: "RESEND_API_KEY" | "EMAIL_FROM_HANDLER" | "EMAIL_FROM_AGENT" | "NEXT_PUBLIC_SITE_URL"): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function resend(): Resend {
  client ??= new Resend(env("RESEND_API_KEY"));
  return client;
}

type Email = { from: string; to: string; subject: string; html: string; text: string };

/** Sends one email. Throws if Resend rejects it. */
async function send(email: Email): Promise<void> {
  const { error } = await resend().emails.send(email);
  if (error) throw new Error(`Resend ${error.name}: ${error.message}`);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Simple single-column layout with inline styles, so it renders in most email clients.
const FONT = "'Courier New', Courier, monospace";
const SERIF = "Georgia, 'Times New Roman', serif";

function layout(body: string): string {
  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:#0c0d0d;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0c0d0d;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#161818;border:1px solid #2b2f2e;border-top:3px solid #f2e35b;">
        <tr><td style="padding:28px 24px;font-family:${FONT};font-size:16px;line-height:1.6;color:#e2e4e1;">
          <p style="margin:0 0 18px;"><span style="display:inline-block;border:2px solid #c0392b;color:#c0392b;padding:2px 10px;letter-spacing:3px;font-weight:bold;font-size:12px;">TOP SECRET</span></p>
          ${body}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 18px;font-family:${SERIF};font-size:26px;line-height:1.2;color:#d4af37;letter-spacing:1px;text-transform:uppercase;">${text}</h1>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;">${text}</p>`;
}

function signOff(name: string): string {
  return `<p style="margin:24px 0 0;color:#8b908d;letter-spacing:2px;text-transform:uppercase;font-size:13px;">— ${name}</p>`;
}

export async function sendEnlistmentConfirmation(to: string): Promise<void> {
  await send({
    from: env("EMAIL_FROM_HANDLER"),
    to,
    subject: "Mission Accepted — Await Further Instructions",
    html: layout(
      heading("Mission Accepted") +
        paragraph("Agent, your enlistment is logged. Await further instructions.") +
        paragraph(`<span style="color:#c0392b;font-weight:bold;">Keep your eyes open — the walls have ears.</span>`) +
        signOff("The Handler"),
    ),
    text: [
      "MISSION ACCEPTED",
      "",
      "Agent, your enlistment is logged. Await further instructions.",
      "Keep your eyes open — the walls have ears.",
      "",
      "— The Handler",
    ].join("\n"),
  });
}

/** The teaser only: codename and a link. The full dossier stays on the private page. */
export async function sendDossierEmail({ to, displayName, slug }: { to: string; displayName: string; slug: string }) {
  const url = `${env("NEXT_PUBLIC_SITE_URL").replace(/\/+$/, "")}/agent/${encodeURIComponent(slug)}`;
  const name = escapeHtml(displayName);

  await send({
    from: env("EMAIL_FROM_AGENT"),
    to,
    subject: "Your Cover Identity Has Been Assigned",
    html: layout(
      paragraph(`<span style="color:#8b908d;letter-spacing:2px;text-transform:uppercase;font-size:13px;">// Identity assignment</span>`) +
        paragraph("The briefing is over. Your cover has been chosen.") +
        heading(`Agent, you are now <span style="color:#f2e35b;">${name}</span>.`) +
        paragraph("Everyone in that room wants something. Now, so do you.") +
        `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;"><tr>
          <td style="background:#c0392b;">
            <a href="${escapeHtml(url)}" style="display:inline-block;padding:14px 24px;font-family:${FONT};font-size:15px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#ffffff;text-decoration:none;">Open your dossier</a>
          </td>
        </tr></table>` +
        paragraph(`<span style="color:#8b908d;font-size:13px;">Read it alone. Commit it to memory. Trust no one.</span>`) +
        signOff("The Onyx Protocol"),
    ),
    text: [
      "YOUR COVER IDENTITY HAS BEEN ASSIGNED",
      "",
      "The briefing is over. Your cover has been chosen.",
      `Agent, you are now ${displayName}.`,
      "Everyone in that room wants something. Now, so do you.",
      "",
      `Open your dossier: ${url}`,
      "",
      "Read it alone. Commit it to memory. Trust no one.",
      "",
      "— The Onyx Protocol",
    ].join("\n"),
  });
}
