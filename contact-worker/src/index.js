import { EmailMessage } from 'cloudflare:email';

const ALLOWED_ORIGINS = [
  'https://e-isola.dev',
  'https://www.e-isola.dev',
];

function corsHeaders(origin) {
  const allowed =
    ALLOWED_ORIGINS.includes(origin) || origin?.endsWith('.pages.dev');
  return {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin),
    },
  });
}

function buildRawEmail({ fromAddr, toAddr, replyTo, subject, text }) {
  return [
    'MIME-Version: 1.0',
    `From: "Portfolio Contact" <${fromAddr}>`,
    `To: ${toAddr}`,
    `Reply-To: ${replyTo}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    text,
  ].join('\r\n');
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') ?? '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, origin);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON' }, 400, origin);
    }

    const { name, email, message } = body ?? {};
    if (!name || !email || !message) {
      return json({ error: 'name, email, and message are required' }, 400, origin);
    }

    const fromAddr = env.FROM_EMAIL;
    const toAddr = env.DEST_EMAIL;

    const raw = buildRawEmail({
      fromAddr,
      toAddr,
      replyTo: email,
      subject: `Portfolio message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });

    const emailMessage = new EmailMessage(fromAddr, toAddr, raw);
    await env.EMAIL.send(emailMessage);

    return json({ success: true }, 200, origin);
  },
};
