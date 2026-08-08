"use strict";
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
});