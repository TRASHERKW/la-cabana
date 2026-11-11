/**
 * Envío de correos. Usa Resend o SendGrid según la llave que tengas en .env.local.
 * Si no hay ninguna, imprime el correo en la terminal (útil para probar en tu compu).
 */
type Mail = { to: string; subject: string; html: string; text: string };

export async function sendMail({ to, subject, html, text }: Mail): Promise<void> {
  const from = process.env.MAIL_FROM || "La Cabaña <onboarding@resend.dev>";

  if (process.env.RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html, text }),
    });
    if (!res.ok) throw new Error(`Resend respondió ${res.status}: ${await res.text().catch(() => "")}`);
    return;
  }

  if (process.env.SENDGRID_API_KEY) {
    const match = from.match(/^(.*)<(.+)>$/);
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: match ? { name: match[1].trim(), email: match[2].trim() } : { email: from },
        subject,
        content: [
          { type: "text/plain", value: text },
          { type: "text/html", value: html },
        ],
      }),
    });
    if (!res.ok) throw new Error(`SendGrid respondió ${res.status}: ${await res.text().catch(() => "")}`);
    return;
  }

  // Sin proveedor configurado: modo desarrollo
  console.log(`\n📧 [Correo de prueba — configura RESEND_API_KEY para enviarlo de verdad]\nPara: ${to}\nAsunto: ${subject}\n${text}\n`);
}

export function resetEmail(name: string, link: string) {
  const text = `Hola ${name},\n\nRecibimos una solicitud para cambiar tu contraseña de La Cabaña.\nAbre este enlace para crear una nueva (vence en 1 hora):\n${link}\n\nSi no fuiste tú, ignora este correo: tu contraseña sigue igual.`;
  const html = `<div style="font-family:Georgia,serif;max-width:480px;margin:auto;padding:32px;background:#fff8e7;border-radius:16px;color:#2b2224">
  <h1 style="color:#5a2a2a;font-weight:normal;margin:0 0 16px">La Cabaña</h1>
  <p>Hola ${escapeHtml(name)},</p>
  <p>Recibimos una solicitud para cambiar tu contraseña. Da clic en el botón para crear una nueva:</p>
  <p style="text-align:center;margin:28px 0"><a href="${link}" style="background:#b8604a;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-family:Arial,sans-serif;font-weight:bold">Cambiar mi contraseña</a></p>
  <p style="font-size:13px;color:#666">El enlace vence en 1 hora. Si no fuiste tú, ignora este correo: tu contraseña sigue igual.</p>
</div>`;
  return { text, html };
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
