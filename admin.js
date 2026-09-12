"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);
  const notice = (message, error = false) => { $("notice").textContent = message; $("notice").classList.toggle("error", error); };
  async function api(route, options = {}) {
    const response = await fetch("api/" + route, { credentials: "same-origin", ...options });
    let payload;
    try { payload = await response.json(); } catch { throw new Error("El servidor de contenido no está disponible en este alojamiento."); }
    if (!response.ok) throw new Error(payload.error || "No se pudo guardar");
    return payload;
  }
  const post = (route, data) => api(route, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  function show(authorized) { $("loginArea").hidden = authorized; $("dashboard").hidden = !authorized; }
  async function refresh() {
    const [photos, posts] = await Promise.all([api("photos"), api("posts")]);
    const container = $("published"); container.replaceChildren();
    for (const [kind, entries] of [["photos", photos], ["posts", posts]]) for (const entry of entries) {
      const row = document.createElement("div"); row.className = "published-item";
      const label = document.createElement("span");
      if (entry.url) { const img = document.createElement("img"); img.src = entry.url; img.alt = ""; label.append(img); }
      const text = document.createElement("strong"); text.textContent = entry.caption || entry.title; label.append(text);
      const remove = document.createElement("button"); remove.type = "button"; remove.textContent = "Eliminar";
      remove.addEventListener("click", async () => {
        if (!confirm("¿Eliminar esta publicación de la web?")) return;
        try { await api(kind + "/" + entry.id, { method: "DELETE", headers: { "Content-Type": "application/json" } }); await refresh(); notice("Publicación eliminada."); }
        catch (error) { notice(error.message, true); }
      });
      row.append(label, remove); container.append(row);
    }
    if (!container.children.length) container.textContent = "Todavía no hay contenido publicado.";
  }
  api("session").then(async state => { show(state.admin); if (state.admin) await refresh(); }).catch(error => notice(error.message, true));
  $("loginForm").addEventListener("submit", async event => {
    event.preventDefault();
    try { await post("login", { password: $("password").value }); $("password").value = ""; show(true); await refresh(); notice("Sesión iniciada."); }
    catch (error) { notice(error.message, true); }
  });
  $("logout").addEventListener("click", async () => { try { await post("logout", {}); show(false); notice("Sesión cerrada."); } catch (error) { notice(error.message, true); } });
  $("photoFile").addEventListener("change", () => {
    const file = $("photoFile").files[0];
    if (!file) return;
    if (!$("caption").value) $("caption").value = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
    const reader = new FileReader();
    reader.onload = () => { $("preview").src = reader.result; $("preview").hidden = false; };
    reader.readAsDataURL(file);
  });
  $("photoForm").addEventListener("submit", async event => {
    event.preventDefault();
    const file = $("photoFile").files[0], button = event.submitter;
    if (!file || file.size > 5 * 1024 * 1024) return notice("La foto debe pesar menos de 5 MB.", true);
    button.disabled = true;
    try {
      const image = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
      await post("photos", { image, caption: $("caption").value });
      $("photoForm").reset(); $("preview").hidden = true; await refresh(); notice("Foto publicada correctamente.");
    } catch (error) { notice(error.message, true); } finally { button.disabled = false; }
  });
  $("postType").addEventListener("change", () => { $("dateRow").hidden = $("postType").value !== "event"; });
  $("postForm").addEventListener("submit", async event => {
    event.preventDefault(); const button = event.submitter; button.disabled = true;
    try {
      await post("posts", { type: $("postType").value, title: $("postTitle").value, description: $("postDescription").value, date: $("postDate").value });
      $("postForm").reset(); $("dateRow").hidden = true; await refresh(); notice("Contenido publicado correctamente.");
    } catch (error) { notice(error.message, true); } finally { button.disabled = false; }
  });
});
