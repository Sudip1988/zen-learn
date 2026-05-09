import { verifyToken, err } from "./_lib.js";

const YT_BASE = "https://www.googleapis.com/youtube/v3";

// Allowed YouTube resources — whitelist to prevent abuse
const ALLOWED_RESOURCES = new Set(["search", "channels", "videos"]);

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    await verifyToken(req);

    const { _r, ...rest } = req.query;

    if (!_r || !ALLOWED_RESOURCES.has(_r)) {
      return res.status(400).json({ error: "Invalid YouTube resource" });
    }

    const params = new URLSearchParams(rest);
    params.set("key", process.env.YOUTUBE_API_KEY);

    const upstream = await fetch(`${YT_BASE}/${_r}?${params}`);
    const data = await upstream.json();

    res.setHeader("Content-Type", "application/json");
    return res.status(upstream.status).json(data);
  } catch (e) {
    return err(res, e);
  }
}
