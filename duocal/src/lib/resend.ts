import "server-only";

import { Resend } from "resend";
import { formatJoinCode } from "./utils";

let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

interface InviteEmailParams {
  to: string;
  workspaceName: string;
  joinCode: string;
  inviterName: string;
}

export async function sendWorkspaceInvite({
  to,
  workspaceName,
  joinCode,
  inviterName,
}: InviteEmailParams) {
  const formattedCode = formatJoinCode(joinCode);
  const from = process.env.RESEND_FROM_EMAIL ?? "DuoCal <onboarding@resend.dev>";

  const { error } = await getResend().emails.send({
    from,
    to,
    subject: `${inviterName} invited you to ${workspaceName} on DuoCal`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #090D16; color: #E2E8F0; margin: 0; padding: 40px 20px; }
    .container { max-width: 520px; margin: 0 auto; background: #0F172A; border-radius: 16px; border: 1px solid #1E3A5F; overflow: hidden; }
    .header { background: linear-gradient(135deg, #2563EB, #3B82F6); padding: 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; color: white; letter-spacing: -0.5px; }
    .body { padding: 32px; }
    .code-box { background: #090D16; border: 2px solid #2563EB; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; box-shadow: 0 0 30px rgba(37,99,235,0.3); }
    .code { font-size: 36px; font-weight: 700; letter-spacing: 6px; color: #3B82F6; font-family: monospace; }
    .footer { padding: 16px 32px; background: #090D16; text-align: center; font-size: 12px; color: #64748B; }
    p { line-height: 1.6; color: #94A3B8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>DuoCal</h1></div>
    <div class="body">
      <p><strong style="color:#E2E8F0">${inviterName}</strong> has invited you to join the shared calendar workspace:</p>
      <p style="font-size: 20px; color: #E2E8F0; font-weight: 600;">${workspaceName}</p>
      <p>Use this private join code to access the workspace. Non-members cannot see any workspace details.</p>
      <div class="code-box"><div class="code">${formattedCode}</div></div>
      <p>Open DuoCal, click <strong>Join Workspace</strong>, and enter the code above.</p>
    </div>
    <div class="footer">&copy; DuoCal &mdash; Privacy-first shared calendars</div>
  </div>
</body>
</html>`,
  });

  if (error) throw new Error(error.message);
}
