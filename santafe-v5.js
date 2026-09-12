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
  const gallery=document.getElementById("galleryGrid"),status=document.getElementById("galleryStatus");
  gallery?.addEventListener("click",event=>{
    const btn=event.target.closest("button[data-img]");
    if(!btn||!gallery.contains(btn)||!dialog||!img)return;
    img.src=btn.dataset.img;
    img.alt=btn.dataset.caption||"Santafe Playa";
    dialog.showModal();
  });
  // El repositorio es publico; solo quienes tienen permiso de escritura pueden subir.
  // Se consultan los nombres al cargar para que las fotos nuevas aparezcan sin editar HTML.
  async function loadGallery(){
    if(!gallery)return;
    try{
      const response=await fetch("https://api.github.com/repos/rjaviermachado-creator/SantafePlaya/contents/assets/gallery?ref=main",{headers:{"Accept":"application/vnd.github+json"}});
      if(!response.ok)throw new Error("No se pudo consultar la carpeta");
      const entries=await response.json();
      if(!Array.isArray(entries))throw new Error("Respuesta inesperada");
      const photos=entries.filter(file=>file.type==="file"&&/\.(?:jpe?g|png|webp)$/i.test(file.name)).sort((a,b)=>b.name.localeCompare(a.name,"es"));
      if(!photos.length){status.textContent="Aun no hay capturas del servidor. Puedes subir la primera.";return;}
      const fragment=document.createDocumentFragment();
      photos.forEach(file=>{
        const caption=file.name.replace(/\.[^.]+$/,"").replace(/^\d{4}-\d{2}-\d{2}[-_ ]?/,"").replace(/[-_]+/g," ").trim()||"Santafe Playa";
        const url="assets/gallery/"+encodeURIComponent(file.name);
        const button=document.createElement("button");
        button.type="button";
        button.style.backgroundImage='url("'+url+'")';
        button.dataset.img=url;
        button.dataset.caption=caption;
        button.setAttribute("aria-label","Ver foto: "+caption);
        const label=document.createElement("span");
        label.textContent=caption;
        button.append(label);
        fragment.append(button);
      });
      gallery.replaceChildren(fragment);
      document.getElementById("galleryCredit")?.remove();
      status.textContent=photos.length===1?"1 foto de la comunidad":photos.length+" fotos de la comunidad";
    }catch{
      status.textContent="Las fotos no se pudieron cargar ahora. Intentalo de nuevo mas tarde.";
    }
  }
  loadGallery();
  if(close&&dialog)close.addEventListener("click",()=>dialog.close());
  if(dialog)dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close();});
  const sections=[...document.querySelectorAll("main section[id]")];
  const navLinks=[...document.querySelectorAll('.nav a[href^="#"]')];
  if("IntersectionObserver" in window){const obs=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;navLinks.forEach(a=>a.classList.toggle("active",a.getAttribute("href")==="#"+entry.target.id));});},{rootMargin:"-35% 0px -55%",threshold:0});sections.forEach(s=>obs.observe(s));}
  const year=document.getElementById("year");if(year)year.textContent=new Date().getFullYear();
});
