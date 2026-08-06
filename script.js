"use strict";

const DISCORD_URL = "https://discord.gg/z4BShMXrx";

// Estilos de seguridad: el contenido nunca debe quedar oculto aunque falle una animación.
const repairStyles = document.createElement("style");
repairStyles.textContent = `
  .reveal { opacity: 1 !important; visibility: visible !important; transform: none !important; }
  img.image-fallback { object-fit: cover; background: linear-gradient(135deg,#111811,#26351e 55%,#101410); }
  .hero-bg {
    background:
      linear-gradient(90deg,rgba(5,7,5,.98) 0 42%,rgba(5,7,5,.50) 68%,rgba(5,7,5,.90)),
      linear-gradient(0deg,rgba(5,7,5,.92),transparent 55%),
      url('city.svg') center/cover no-repeat !important;
  }
  .dept-art {
    min-height: 240px;
    background-color: #151b13 !important;
    background-image:
      linear-gradient(0deg,rgba(5,8,5,.9),rgba(5,8,5,.08)),
      url('city.svg') !important;
    background-size: cover !important;
    background-position: center !important;
  }
  .dept-medical { filter: hue-rotate(300deg); }
  .dept-mechanic { filter: sepia(.25) saturate(1.4); }
  .dept-lspd,.dept-sheriff,.dept-highway,.dept-border { filter: saturate(.75) contrast(1.05); }
`;
document.head.appendChild(repairStyles);

const menu = document.getElementById("menu-btn");
const nav = document.getElementById("nav");
const soundButton = document.getElementById("sound-btn");
const toast = document.getElementById("toast");
const cursor = document.getElementById("cursor-light");
let soundEnabled = true;
let audioContext = null;

function audio() {
  if (!soundEnabled) return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!audioContext) audioContext = new AudioCtx();
  if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
  return audioContext;
}

function tone(freq = 280, duration = 0.045, type = "triangle", volume = 0.018) {
  try {
    const ctx = audio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  } catch (_) {}
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

// Reemplaza automáticamente cualquier imagen inexistente por ilustraciones reales del repositorio.
const fallbackImages = ["gallery-1.svg", "gallery-2.svg", "gallery-3.svg", "city.svg", "logo.svg"];
let fallbackIndex = 0;
document.querySelectorAll("img").forEach((img) => {
  img.addEventListener("error", () => {
    if (img.dataset.repaired === "true") return;
    img.dataset.repaired = "true";
    img.classList.add("image-fallback");
    img.src = fallbackImages[fallbackIndex % fallbackImages.length];
    fallbackIndex += 1;
  });
});

if (menu && nav) {
  menu.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menu.setAttribute("aria-expanded", String(open));
    menu.textContent = open ? "✕" : "☰";
    tone(open ? 420 : 250);
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      nav.classList.remove("open");
      menu.setAttribute("aria-expanded", "false");
      menu.textContent = "☰";
    }
  });
}

if (soundButton) {
  soundButton.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundButton.textContent = soundEnabled ? "🔊" : "🔇";
    soundButton.setAttribute("aria-label", soundEnabled ? "Silenciar efectos" : "Activar efectos");
    if (soundEnabled) tone(620, 0.08, "sine", 0.025);
    showToast(soundEnabled ? "Efectos activados" : "Efectos silenciados");
  });
}

if (cursor) {
  document.addEventListener("pointermove", (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  });
}

document.addEventListener("pointerdown", (event) => {
  const target = event.target.closest?.(".fx-btn");
  if (!target) return;
  tone(220, 0.05, "square", 0.018);
  const rect = target.getBoundingClientRect();
  const wave = document.createElement("span");
  wave.className = "ripple";
  wave.style.left = `${event.clientX - rect.left}px`;
  wave.style.top = `${event.clientY - rect.top}px`;
  wave.style.width = wave.style.height = `${Math.max(rect.width, rect.height) / 2}px`;
  target.append(wave);
  setTimeout(() => wave.remove(), 600);
});

// Se muestran inmediatamente; IntersectionObserver solo conserva una animación ligera cuando está disponible.
document.querySelectorAll(".reveal").forEach((element) => element.classList.add("visible"));

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.05 });
  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

if (window.matchMedia?.("(hover:hover) and (pointer:fine)").matches) {
  document.querySelectorAll(".tilt").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(850px) rotateX(${-y * 3.5}deg) rotateY(${x * 4}deg) translateY(-2px)`;
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });
}

if (nav && "IntersectionObserver" in window) {
  const sections = [...document.querySelectorAll("main section[id]")];
  const navLinks = [...nav.querySelectorAll("a")];
  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: "-35% 0px -55% 0px" });
  sections.forEach((section) => activeObserver.observe(section));
}

const copyDiscord = document.getElementById("copy-discord");
if (copyDiscord) {
  copyDiscord.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(DISCORD_URL);
      tone(760, 0.08, "sine", 0.025);
      showToast("Invitación de Discord copiada");
    } catch (_) {
      showToast(DISCORD_URL);
    }
  });
}

const copyChannel = document.getElementById("copy-channel");
if (copyChannel) {
  copyChannel.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText("#postulaciones");
      showToast("#postulaciones copiado");
    } catch (_) {
      showToast("Canal: #postulaciones");
    }
  });
}

const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());
