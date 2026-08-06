"use strict";

const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");
const heroPhoto = document.getElementById("heroPhoto");
const track = document.getElementById("carouselTrack");
const prev = document.getElementById("prevSlide");
const next = document.getElementById("nextSlide");
const dotsWrap = document.getElementById("dots");
const slides = track ? [...track.children] : [];
const lightbox = document.getElementById("lightbox");
const lightboxPhoto = document.getElementById("lightboxPhoto");
const lightboxCaption = document.getElementById("lightboxCaption");
const closeLightbox = document.getElementById("closeLightbox");
const toast = document.getElementById("toast");
let slideIndex = 0;
let autoplay;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.textContent = open ? "✕" : "☰";
  });
  nav.addEventListener("click", event => {
    if (event.target.closest("a")) {
      nav.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.textContent = "☰";
    }
  });
}

function renderSlide() {
  if (!track || slides.length === 0) return;
  track.style.transform = `translateX(-${slideIndex * 100}%)`;
  [...dotsWrap.children].forEach((dot, index) => dot.classList.toggle("active", index === slideIndex));
}

function goToSlide(index) {
  slideIndex = (index + slides.length) % slides.length;
  renderSlide();
  restartAutoplay();
}

function restartAutoplay() {
  clearInterval(autoplay);
  if (slides.length > 1) autoplay = setInterval(() => goToSlide(slideIndex + 1), 5200);
}

if (track && dotsWrap) {
  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Mostrar imagen ${index + 1}`);
    dot.addEventListener("click", () => goToSlide(index));
    dotsWrap.appendChild(dot);
  });
  prev?.addEventListener("click", () => goToSlide(slideIndex - 1));
  next?.addEventListener("click", () => goToSlide(slideIndex + 1));
  let startX = 0;
  track.addEventListener("touchstart", event => startX = event.touches[0].clientX, { passive: true });
  track.addEventListener("touchend", event => {
    const difference = event.changedTouches[0].clientX - startX;
    if (Math.abs(difference) > 45) goToSlide(slideIndex + (difference < 0 ? 1 : -1));
  }, { passive: true });
  renderSlide();
  restartAutoplay();
}

if (heroPhoto && matchMedia("(prefers-reduced-motion: no-preference)").matches) {
  addEventListener("scroll", () => {
    const offset = Math.min(scrollY * 0.12, 85);
    heroPhoto.style.transform = `scale(1.08) translateY(${offset}px)`;
  }, { passive: true });
}

document.querySelectorAll(".gallery-item").forEach(item => {
  item.addEventListener("click", () => {
    const shot = item.dataset.shot;
    const caption = item.querySelector("span")?.textContent || "Santafe Playa";
    lightboxPhoto.className = `lightbox-photo shot shot-${shot}`;
    lightboxCaption.textContent = caption;
    if (typeof lightbox.showModal === "function") lightbox.showModal();
  });
});

closeLightbox?.addEventListener("click", () => lightbox.close());
lightbox?.addEventListener("click", event => {
  if (event.target === lightbox) lightbox.close();
});

document.getElementById("copyChannel")?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("#postulaciones");
    showToast("#postulaciones copiado");
  } catch {
    showToast("Canal: #postulaciones");
  }
});

document.querySelectorAll(".glow-card").forEach(card => {
  card.addEventListener("pointermove", event => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    card.style.setProperty("--my", `${event.clientY - rect.top}px`);
  });
});

document.getElementById("year").textContent = String(new Date().getFullYear());
