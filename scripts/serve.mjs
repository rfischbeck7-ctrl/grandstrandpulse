import { fileURLToPath } from "node:url";
// Tiny local preview server: npm run preview, then open http://localhost:8080
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".xml": "application/xml", ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".txt": "text/plain" };
const port = Number(process.env.PORT || 8080);
http.createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p.endsWith("/")) p += "index.html";
  const file = path.join(dist, path.normalize(p));
  if (!file.startsWith(dist)) { res.writeHead(403).end(); return; }
  try {
    const body = await fs.readFile(file);
    res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" }).end(body);
  } catch {
    try { res.writeHead(404, { "Content-Type": types[".html"] }).end(await fs.readFile(path.join(dist, "404.html"))); }
    catch { res.writeHead(404).end("Not found"); }
  }
}).listen(port, () => console.log(`Preview at http://localhost:${port}`));
