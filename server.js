"use strict";

// Servidor sin dependencias: fotos y anuncios persistentes para Santafe Playa.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = __dirname;
const dataDir = path.resolve(process.env.DATA_DIR || path.join(root, "data"));
const uploadsDir = path.join(dataDir, "uploads");
const dbFile = path.join(dataDir, "content.json");
const port = Number(process.env.PORT || 3000);
const password = process.env.ADMIN_PASSWORD;
if (!password || password.length < 12) {
  console.error("Configura ADMIN_PASSWORD con al menos 12 caracteres antes de arrancar.");
  process.exit(1);
}
fs.mkdirSync(uploadsDir, { recursive: true });
let db = { photos: [], posts: [] };
if (fs.existsSync(dbFile)) {
  db = JSON.parse(fs.readFileSync(dbFile, "utf8"));
  if (!Array.isArray(db.photos) || !Array.isArray(db.posts)) throw new Error("Datos invalidos");
}
const sessions = new Map();
const loginAttempts = new Map();
const mime = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".json": "application/json" };

function send(res, code, body, type = "application/json") {
  res.writeHead(code, { "Content-Type": type + "; charset=utf-8", "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" });
  res.end(type === "application/json" ? JSON.stringify(body) : body);
}
function persist() {
  const temp = dbFile + ".tmp";
  fs.writeFileSync(temp, JSON.stringify(db, null, 2));
  fs.renameSync(temp, dbFile);
}
function cookie(req) {
  return (req.headers.cookie || "").split(";").map(s => s.trim()).find(s => s.startsWith("sp_session="))?.slice(11);
}
function admin(req) {
  const token = cookie(req);
  const expiry = token && sessions.get(token);
  if (expiry && expiry > Date.now()) return true;
  if (token) sessions.delete(token);
  return false;
}
function sameOrigin(req) {
  try { return new URL(req.headers.origin).host === req.headers.host; } catch { return false; }
}
function body(req) {
  return new Promise((resolve, reject) => {
    let bytes = 0, chunks = [];
    req.on("data", chunk => {
      bytes += chunk.length;
      if (bytes > 8 * 1024 * 1024) { reject(new Error("Archivo demasiado grande")); req.destroy(); }
      else chunks.push(chunk);
    });
    req.on("end", () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
      catch { reject(new Error("JSON invalido")); }
    });
    req.on("error", reject);
  });
}
function safeText(value, max) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
function detectImage(buffer) {
  if (buffer.length >= 3 && buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return ["jpg", "image/jpeg"];
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return ["png", "image/png"];
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return ["webp", "image/webp"];
  return null;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  try {
    if (url.pathname === "/api/health" && req.method === "GET") return send(res, 200, { ready: true });
    if (url.pathname === "/api/session" && req.method === "GET") return send(res, 200, { admin: admin(req) });
    if (url.pathname === "/api/photos" && req.method === "GET") return send(res, 200, db.photos);
    if (url.pathname === "/api/posts" && req.method === "GET") return send(res, 200, db.posts);

    if (url.pathname.startsWith("/api/") && req.method !== "GET") {
      if (!sameOrigin(req)) return send(res, 403, { error: "Origen no permitido" });
      if (req.headers["content-type"]?.split(";")[0] !== "application/json") return send(res, 415, { error: "Se requiere JSON" });
      if (url.pathname === "/api/login" && req.method === "POST") {
        const ip = req.socket.remoteAddress;
        const attempts = (loginAttempts.get(ip) || []).filter(time => time > Date.now() - 900000);
        if (attempts.length >= 5) return send(res, 429, { error: "Demasiados intentos. Espera 15 minutos." });
        const input = await body(req);
        const a = crypto.createHash("sha256").update(String(input.password || "")).digest();
        const b = crypto.createHash("sha256").update(password).digest();
        if (!crypto.timingSafeEqual(a, b)) {
          attempts.push(Date.now()); loginAttempts.set(ip, attempts);
          return send(res, 401, { error: "Contraseña incorrecta" });
        }
        loginAttempts.delete(ip);
        const token = crypto.randomBytes(32).toString("hex");
        sessions.set(token, Date.now() + 12 * 3600000);
        res.setHeader("Set-Cookie", `sp_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
        return send(res, 200, { admin: true });
      }
      if (!admin(req)) return send(res, 401, { error: "Acceso de administrador necesario" });
      if (url.pathname === "/api/logout" && req.method === "POST") {
        sessions.delete(cookie(req));
        res.setHeader("Set-Cookie", "sp_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0");
        return send(res, 200, { admin: false });
      }
      if (url.pathname === "/api/photos" && req.method === "POST") {
        const input = await body(req);
        if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(input.image || "")) return send(res, 400, { error: "Selecciona JPG, PNG o WebP" });
        const buffer = Buffer.from(input.image.split(",")[1], "base64");
        const format = detectImage(buffer);
        if (!format || buffer.length > 5 * 1024 * 1024 || buffer.length < 32) return send(res, 400, { error: "Imagen no valida o superior a 5 MB" });
        const id = crypto.randomUUID(), filename = `${id}.${format[0]}`;
        fs.writeFileSync(path.join(uploadsDir, filename), buffer, { flag: "wx" });
        const photo = { id, caption: safeText(input.caption, 80) || "Santafe Playa", url: `/uploads/${filename}`, createdAt: new Date().toISOString() };
        db.photos.unshift(photo); persist(); return send(res, 201, photo);
      }
      if (url.pathname === "/api/posts" && req.method === "POST") {
        const input = await body(req);
        const title = safeText(input.title, 100), description = safeText(input.description, 1000);
        if (!title || !description || !["news", "event"].includes(input.type)) return send(res, 400, { error: "Completa los campos" });
        const post = { id: crypto.randomUUID(), type: input.type, title, description, date: input.type === "event" ? safeText(input.date, 40) : "", createdAt: new Date().toISOString() };
        db.posts.unshift(post); persist(); return send(res, 201, post);
      }
      const match = url.pathname.match(/^\/api\/(photos|posts)\/([0-9a-f-]{36})$/);
      if (match && req.method === "DELETE") {
        const list = match[1], item = db[list].find(entry => entry.id === match[2]);
        if (!item) return send(res, 404, { error: "No encontrado" });
        db[list] = db[list].filter(entry => entry.id !== item.id); persist();
        if (list === "photos") fs.rmSync(path.join(uploadsDir, path.basename(item.url)), { force: true });
        return send(res, 200, { deleted: true });
      }
      return send(res, 404, { error: "Ruta no encontrada" });
    }
    if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, { error: "Metodo no permitido" });
    let target;
    if (url.pathname.startsWith("/uploads/")) target = path.resolve(uploadsDir, "." + decodeURIComponent(url.pathname.slice(8)));
    else target = path.resolve(root, "." + decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname));
    const base = url.pathname.startsWith("/uploads/") ? uploadsDir : root;
    if ((!target.startsWith(base + path.sep) && target !== base) || (base === root && target.startsWith(dataDir + path.sep)) || /(^|\/)\./.test(url.pathname) || target === path.join(root, "server.js") || target === path.join(root, "package.json") || target.includes(path.sep + "test" + path.sep) || !fs.existsSync(target) || !fs.statSync(target).isFile()) return send(res, 404, { error: "No encontrado" });
    res.writeHead(200, { "Content-Type": (mime[path.extname(target)] || "application/octet-stream"), "X-Content-Type-Options": "nosniff" });
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(target).pipe(res);
  } catch (error) {
    if (!res.headersSent && !res.destroyed) send(res, 400, { error: error.message || "Solicitud invalida" });
  }
});
if (require.main === module) server.listen(port, () => console.log(`Santafe Playa: http://localhost:${port}`));
module.exports = server;
