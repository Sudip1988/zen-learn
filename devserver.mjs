// Local dev API server — replaces Vercel serverless functions for localhost
// Skips Firebase auth. Reads keys from .env.local then .env as fallback.
import http from "http";
import { readFileSync, existsSync } from "fs";

function loadEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    const val = t.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadEnv(".env.local");
loadEnv(".env");

const PORT = 3001;

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString();
}

async function handleClaude(req, res) {
  const { model, max_tokens, messages } = JSON.parse(await readBody(req));
  const apiKey =
    process.env.ANTHROPIC_API_KEY || process.env.VITE_DEFAULT_ANTHROPIC_API_KEY;
  if (!apiKey) return sendJson(res, 500, { error: "ANTHROPIC_API_KEY not set in .env" });

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({ model, max_tokens, messages }),
  });
  const data = await upstream.json();
  if (!upstream.ok)
    return sendJson(res, upstream.status, {
      error: data.error?.message ?? `Anthropic error ${upstream.status}`,
    });
  sendJson(res, 200, { text: data.content[0].text });
}

async function handleYoutube(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const params = Object.fromEntries(url.searchParams);
  const { _r, ...rest } = params;

  const ALLOWED = new Set(["search", "channels", "videos"]);
  if (!_r || !ALLOWED.has(_r))
    return sendJson(res, 400, { error: "Invalid YouTube resource" });

  const apiKey =
    process.env.YOUTUBE_API_KEY || process.env.VITE_DEFAULT_YOUTUBE_API_KEY;
  if (!apiKey) return sendJson(res, 500, { error: "YOUTUBE_API_KEY not set in .env" });

  const qs = new URLSearchParams(rest);
  qs.set("key", apiKey);

  const upstream = await fetch(
    `https://www.googleapis.com/youtube/v3/${_r}?${qs}`,
    { headers: { Referer: "http://localhost:5173/" } }
  );
  const data = await upstream.json();

  const itemCount = data.items?.length ?? "err";
  const q = rest.q || rest.id?.slice(0, 30) || rest.forHandle || "";
  console.log(`[yt] ${_r} | items:${itemCount} | ${q}${data.error ? " | ERROR: " + data.error.message : ""}`);

  sendJson(res, upstream.status, data);
}

http
  .createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.writeHead(204).end();

    const path = new URL(req.url, `http://localhost:${PORT}`).pathname;
    try {
      if (path === "/api/claude" && req.method === "POST")
        return await handleClaude(req, res);
      if (path === "/api/youtube" && req.method === "GET")
        return await handleYoutube(req, res);
      sendJson(res, 404, { error: "Not found" });
    } catch (e) {
      sendJson(res, 500, { error: e.message });
    }
  })
  .listen(PORT, () => {
    console.log(`[dev-api] running at http://localhost:${PORT}`);
    console.log(`[dev-api] Claude key: ${process.env.ANTHROPIC_API_KEY || process.env.VITE_DEFAULT_ANTHROPIC_API_KEY ? "✓ found" : "✗ MISSING"}`);
    console.log(`[dev-api] YouTube key: ${process.env.YOUTUBE_API_KEY || process.env.VITE_DEFAULT_YOUTUBE_API_KEY ? "✓ found" : "✗ MISSING"}`);
  });
