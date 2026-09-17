function json(data, status=200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function clean(value, max=5000) {
  return String(value ?? "").trim().slice(0, max);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      if (request.method !== "POST") {
        return json({ error: "Method not allowed." }, 405);
      }

      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid request." }, 400);
      }

      // Honeypot field: bots often fill hidden fields.
      if (clean(body.website, 200)) {
        return json({ ok: true });
      }

      const name = clean(body.name, 100);
      const phone = clean(body.phone, 30);
      const email = clean(body.email, 160);
      const service = clean(body.service, 120);
      const message = clean(body.message, 5000);

      if (!name || !phone || !email || !service || !message) {
        return json({ error: "Please complete all required fields." }, 400);
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json({ error: "Please enter a valid email address." }, 400);
      }

      if (!env.RESEND_API_KEY) {
        return json({ error: "Email service is not configured yet." }, 500);
      }

      const safe = {
        name: escapeHtml(name),
        phone: escapeHtml(phone),
        email: escapeHtml(email),
        service: escapeHtml(service),
        message: escapeHtml(message).replaceAll("\n", "<br>")
      };

      const subject = `New Estimate Request - ${service}`;
      const emailHtml = `
        <div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#0b2239">
          <h2 style="margin-bottom:4px">New Estimate Request</h2>
          <p style="margin-top:0;color:#566">Submitted from the ELECTROLED LLC website.</p>
          <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%">
            <tr><td style="font-weight:bold;width:150px">Name</td><td>${safe.name}</td></tr>
            <tr><td style="font-weight:bold">Phone</td><td>${safe.phone}</td></tr>
            <tr><td style="font-weight:bold">Email</td><td>${safe.email}</td></tr>
            <tr><td style="font-weight:bold">Service</td><td>${safe.service}</td></tr>
          </table>
          <h3>Project Details</h3>
          <div style="padding:16px;background:#f5f7fa;border-radius:8px">${safe.message}</div>
        </div>`;

      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "ELECTROLED Website <website@forms.electroledllc.net>",
          to: ["support@electroledllc.net"],
          reply_to: email,
          subject,
          html: emailHtml,
          text: `New Estimate Request

Name: ${name}
Phone: ${phone}
Email: ${email}
Service: ${service}

Project Details:
${message}`
        })
      });

      if (!resendResponse.ok) {
        const details = await resendResponse.text();
        console.error("Resend error:", resendResponse.status, details);
        return json({ error: "We could not send your request right now. Please call 914 319 2256 or email support@electroledllc.net." }, 502);
      }

      return json({ ok: true });
    }

    return env.ASSETS.fetch(request);
  }
};
