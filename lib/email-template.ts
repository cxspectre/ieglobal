/**
 * Shared email template for IE Global transactional emails.
 * Uses hosted logo URL (not base64) for reliable display in email clients.
 * No emojis - professional, clean design.
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ie-global.net';
const LOGO_URL = `${BASE_URL.replace(/\/$/, '')}/logo.png`;

export function emailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IE Global</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
        line-height: 1.6;
        color: #0B1930;
        margin: 0;
        padding: 0;
        background: #f7f9fc;
      }
      .wrapper {
        max-width: 600px;
        margin: 0 auto;
        padding: 40px 20px;
      }
      .card {
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(11, 25, 48, 0.06);
      }
      .header {
        background: #0B1930;
        padding: 32px 40px;
        text-align: left;
      }
      .header img {
        display: block;
        width: 120px;
        height: auto;
        filter: brightness(0) invert(1);
      }
      .content {
        padding: 32px 40px;
      }
      .content p {
        margin: 0 0 16px 0;
      }
      .content p:last-child {
        margin-bottom: 0;
      }
      .button {
        display: inline-block;
        padding: 14px 28px;
        background: #E63946;
        color: white !important;
        text-decoration: none;
        font-weight: 600;
        border-radius: 8px;
        margin: 20px 0;
      }
      .footer {
        padding: 24px 40px;
        background: #f7f9fc;
        border-top: 1px solid #e2e8f0;
        font-size: 13px;
        color: #64748b;
      }
      .footer a {
        color: #E63946;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="card">
        <div class="header">
          <img src="${LOGO_URL}" alt="IE Global" width="120">
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <strong>IE Global</strong> – Digital Systems &amp; Engineering<br>
          <a href="https://ie-global.net">ie-global.net</a> · <a href="mailto:hello@ie-global.net">hello@ie-global.net</a>
        </div>
      </div>
    </div>
  </body>
</html>
`.trim();
}
