"use strict";

const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");
const copyChannel = document.getElementById("copyChannel");
const toast = document.getElementById("toast");
const year = document.getElementById("year");

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
    menuBtn.textContent = isOpen ? "✕" : "☰";
  });

  nav.addEventListener("click", event => {
    if (event.target.closest("a")) {
      nav.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.textContent = "☰";
    }
  });
}

if (copyChannel) {
  copyChannel.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText("#postulaciones");
      showToast("#postulaciones copiado");
    } catch {
      showToast("Canal: #postulaciones");
    }
  });
}

if (year) year.textContent = String(new Date().getFullYear());

// Si una imagen no existe, se sustituye por una imagen local disponible.
document.querySelectorAll("img").forEach(image => {
  image.addEventListener("error", () => {
    if (image.dataset.fallbackApplied === "true") return;
    image.dataset.fallbackApplied = "true";
    image.src = "city.svg";
  });
});

// Cierra el menú al cambiar a escritorio.
window.addEventListener("resize", () => {
  if (window.innerWidth > 980 && nav && menuBtn) {
    nav.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.textContent = "☰";
  }
});