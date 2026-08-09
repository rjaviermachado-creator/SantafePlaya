"use strict";

// Añadimos las capturas restantes antes de que se inicialice el carrusel principal.
(()=>{
  const track=document.getElementById("carouselTrack");
  if(!track || track.dataset.expanded==="true") return;
  const extra=[
    ["06","CIUDAD","PATRULLA URBANA",5],
    ["07","VIDA CIVIL","LOS SANTOS EN MOVIMIENTO",6],
    ["08","MRPD","BASE DE OPERACIONES",7],
    ["09","TACTICAL","COMMAND CENTER",9],
    ["10","LOS SANTOS","PANORÁMICA DE LA CIUDAD",2]
  ];
  extra.forEach(([num,small,title,shot])=>{
    const article=document.createElement("article");
    article.className=`slide shot shot-${shot}`;
    article.innerHTML=`<span>${num}</span><div><small>${small}</small><h3>${title}</h3></div>`;
    track.appendChild(article);
  });
  track.dataset.expanded="true";
})();

document.addEventListener("DOMContentLoaded",()=>{
  document.querySelectorAll(".faq-item button").forEach(button=>{
    button.addEventListener("click",()=>{
      const item=button.closest(".faq-item");
      const open=item.classList.toggle("open");
      button.setAttribute("aria-expanded",String(open));
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(link=>{
    link.addEventListener("click",()=>{
      const nav=document.getElementById("nav");
      const menu=document.getElementById("menuBtn");
      if(nav) nav.classList.remove("open");
      if(menu) menu.setAttribute("aria-expanded","false");
    });
  });

  const roles=document.querySelector(".roles-grid");
  if(roles && !roles.querySelector('[data-extra-role="ems"]')){
    const ems=document.createElement("article");
    ems.className="role glow-card";
    ems.dataset.extraRole="ems";
    ems.innerHTML='<div class="role-photo shot shot-6"></div><div><small>EMERGENCY MEDICAL SERVICES</small><h3>EMS</h3><p>Atención médica, rescates, emergencias y apoyo sanitario en toda la ciudad.</p></div>';
    const highway=document.createElement("article");
    highway.className="role glow-card";
    highway.dataset.extraRole="highway";
    highway.innerHTML='<div class="role-photo shot shot-5"></div><div><small>HIGHWAY PATROL</small><h3>HIGHWAY PATROL</h3><p>Control de carreteras, tráfico, persecuciones y apoyo a otras unidades.</p></div>';
    roles.append(ems,highway);
  }

  // Nueva sección visual usando las capturas reales ya guardadas en la web.
  const gallery=document.getElementById("galeria");
  if(gallery && !document.getElementById("momentos")){
    const section=document.createElement("section");
    section.className="section city-stories";
    section.id="momentos";
    section.innerHTML=`
      <div class="heading city-stories-head">
        <div><p class="kicker">06 // HISTORIAS DE LA CIUDAD</p><h2>MÁS QUE<br><span>UNA PARTIDA.</span></h2></div>
        <p>Una selección extra de escenas de Santafe Playa: operaciones, motor, patrullas y momentos cotidianos de Los Santos.</p>
      </div>
      <div class="story-grid">
        <button class="story-card story-main shot shot-10" data-story-shot="10" aria-label="Ver patrulla nocturna ampliada"><div><small>NOCHE · LOS SANTOS</small><h3>PATRULLA NOCTURNA</h3><p>Luces, tráfico y servicio cuando la ciudad cambia de ritmo.</p></div></button>
        <button class="story-card shot shot-4" data-story-shot="4" aria-label="Ver vehículos exclusivos ampliados"><div><small>MOTOR</small><h3>VEHÍCULOS EXCLUSIVOS</h3></div></button>
        <button class="story-card shot shot-3" data-story-shot="3" aria-label="Ver unidad aérea ampliada"><div><small>AIR UNIT</small><h3>VIGILANCIA AÉREA</h3></div></button>
        <button class="story-card shot shot-7" data-story-shot="7" aria-label="Ver MRPD ampliado"><div><small>MRPD</small><h3>BASE OPERATIVA</h3></div></button>
        <button class="story-card shot shot-6" data-story-shot="6" aria-label="Ver vida civil ampliada"><div><small>CIVIL</small><h3>VIDA EN LA CIUDAD</h3></div></button>
        <button class="story-card story-wide shot shot-2" data-story-shot="2" aria-label="Ver Los Santos ampliado"><div><small>PANORÁMICA</small><h3>TODO LOS SANTOS POR DESCUBRIR</h3></div></button>
      </div>`;
    gallery.insertAdjacentElement("afterend",section);

    section.querySelectorAll("[data-story-shot]").forEach(button=>{
      button.addEventListener("click",()=>{
        const original=document.querySelector(`.gallery-item[data-shot="${button.dataset.storyShot}"]`);
        if(original) original.click();
      });
    });
  }

  const nav=document.getElementById("nav");
  if(nav && !nav.querySelector('a[href="#momentos"]')){
    const discord=nav.querySelector(".discord-small");
    const link=document.createElement("a");
    link.href="#momentos";
    link.textContent="Momentos";
    if(discord) nav.insertBefore(link,discord); else nav.appendChild(link);
  }
});