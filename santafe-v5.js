"use strict";
document.addEventListener("DOMContentLoaded",()=>{
  const menu=document.getElementById("menuBtn"),nav=document.getElementById("nav");
  if(menu&&nav){
    menu.addEventListener("click",()=>{const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open));});
    nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menu.setAttribute("aria-expanded","false");}));
  }
  const toast=document.getElementById("toast");
  let toastTimer;
  const showToast=(text)=>{if(!toast)return;clearTimeout(toastTimer);toast.textContent=text;toast.classList.add("show");toastTimer=setTimeout(()=>toast.classList.remove("show"),1800);};
  const copy=document.getElementById("copyChannel");
  if(copy)copy.addEventListener("click",async()=>{try{await navigator.clipboard.writeText("#postulaciones");showToast("#postulaciones copiado");}catch{showToast("Canal: #postulaciones");}});
  document.querySelectorAll(".faq-item button").forEach(btn=>btn.addEventListener("click",()=>{const item=btn.closest(".faq-item");const open=item.classList.toggle("open");btn.setAttribute("aria-expanded",String(open));}));
  const dialog=document.getElementById("lightbox"),img=document.getElementById("lightboxImg"),close=document.getElementById("closeLightbox");
  document.querySelectorAll(".gallery button[data-img]").forEach(btn=>btn.addEventListener("click",()=>{if(!dialog||!img)return;img.src=btn.dataset.img;img.alt=btn.dataset.caption||"Santafe Playa";dialog.showModal();}));
  if(close&&dialog)close.addEventListener("click",()=>dialog.close());
  if(dialog)dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close();});
  const sections=[...document.querySelectorAll("main section[id]")];
  const navLinks=[...document.querySelectorAll('.nav a[href^="#"]')];
  if("IntersectionObserver" in window){const obs=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;navLinks.forEach(a=>a.classList.toggle("active",a.getAttribute("href")==="#"+entry.target.id));});},{rootMargin:"-35% 0px -55%",threshold:0});sections.forEach(s=>obs.observe(s));}
  const year=document.getElementById("year");if(year)year.textContent=new Date().getFullYear();
});
