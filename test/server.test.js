"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "santafe-test-"));
process.env.ADMIN_PASSWORD = "test-password-long-enough";
const server = require("../server");

test("administra fotos y anuncios con acceso protegido y almacenamiento persistente", async () => {
  await new Promise(resolve => server.listen(0, resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = (route, method, data, cookie) => fetch(base + route, {
    method, headers: { Origin: base, "Content-Type": "application/json", ...(cookie && { Cookie: cookie }) },
    ...(data && { body: JSON.stringify(data) })
  });
  try {
    assert.equal((await request("/api/photos", "POST", { caption: "sin acceso" })).status, 401);
    assert.equal((await request("/api/login", "POST", { password: "incorrecta" })).status, 401);
    const login = await request("/api/login", "POST", { password: process.env.ADMIN_PASSWORD });
    assert.equal(login.status, 200);
    const cookie = login.headers.get("set-cookie").split(";")[0];
    const png = Buffer.from("89504e470d0a1a0a" + "00".repeat(40), "hex");
    const created = await request("/api/photos", "POST", { caption: "Patrulla nocturna", image: "data:image/png;base64," + png.toString("base64") }, cookie);
    assert.equal(created.status, 201);
    const photo = await created.json();
    assert.equal(photo.caption, "Patrulla nocturna");
    assert.equal((await fetch(base + photo.url)).status, 200);
    assert.equal((await request("/api/posts", "POST", { type: "event", title: "Carrera", description: "Esta noche", date: "23:00" }, cookie)).status, 201);
    assert.equal((await (await fetch(base + "/api/posts")).json()).length, 1);
    assert.equal(JSON.parse(fs.readFileSync(path.join(process.env.DATA_DIR, "content.json"))).photos.length, 1);
    assert.equal((await request("/api/photos/" + photo.id, "DELETE", {}, null)).status, 401);
    assert.equal((await request("/api/photos/" + photo.id, "DELETE", {}, cookie)).status, 200);
    assert.equal((await (await fetch(base + "/api/photos")).json()).length, 0);
    assert.equal((await fetch(base + "/server.js")).status, 404);
  } finally {
    await new Promise(resolve => server.close(resolve));
    fs.rmSync(process.env.DATA_DIR, { recursive: true, force: true });
  }
});
