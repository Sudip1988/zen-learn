import { verifyToken, checkRateLimit, ok, err } from "./_lib.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { uid } = await verifyToken(req);

    const { model, max_tokens, messages, _action } = req.body;

    // Count rate limit only for full educator discovery (not quick filters)
    if (_action === "discoverEducators") {
      await checkRateLimit(uid);
    }

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model, max_tokens, messages }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      throw Object.assign(
        new Error(data.error?.message ?? `Anthropic error ${upstream.status}`),
        { status: upstream.status }
      );
    }

    return ok(res, { text: data.content[0].text });
  } catch (e) {
    return err(res, e);
  }
}
