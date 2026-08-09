"use strict";
document.addEventListener("DOMContentLoaded",()=>{
  const menu=document.getElementById("menuBtn"),nav=document.getElementById("nav");
  menu?.addEventListener("click",()=>{const open=nav?.classList.toggle("open");menu.setAttribute("aria-expanded",String(Boolean(open)));});
  document.querySelectorAll('#nav a').forEach(a=>a.addEventListener('click',()=>{nav?.classList.remove('open');menu?.setAttribute('aria-expanded','false');}));
  document.getElementById('year').textContent=String(new Date().getFullYear());
  const toast=document.getElementById('toast');
  const showToast=(msg)=>{if(!toast)return;toast.textContent=msg;toast.classList.add('show');clearTimeout(window.__spToast);window.__spToast=setTimeout(()=>toast.classList.remove('show'),1800);};
  document.getElementById('copyChannel')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText('#postulaciones');showToast('Canal copiado: #postulaciones');}catch{showToast('Busca #postulaciones en Discord');}});
  document.querySelectorAll('.faq-item button').forEach(btn=>btn.addEventListener('click',()=>{const item=btn.closest('.faq-item');const open=item.classList.toggle('open');btn.setAttribute('aria-expanded',String(open));}));
  const dialog=document.getElementById('lightbox'),photo=document.getElementById('lightboxPhoto'),caption=document.getElementById('lightboxCaption');
  document.querySelectorAll('[data-shot]').forEach(btn=>btn.addEventListener('click',()=>{const n=btn.dataset.shot;if(!dialog||!photo)return;photo.className=`lightbox-photo shot shot-${n}`;caption.textContent=btn.dataset.caption||btn.textContent.trim()||'Santafe Playa';if(typeof dialog.showModal==='function')dialog.showModal();}));
  document.getElementById('closeLightbox')?.addEventListener('click',()=>dialog?.close());
  dialog?.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  const slides=[...document.querySelectorAll('.carousel-v3 .slide-v3')],track=document.getElementById('carouselTrackV3'),dots=document.getElementById('carouselDotsV3');let index=0,timer;
  if(track&&slides.length){slides.forEach((_,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',`Ir a imagen ${i+1}`);b.addEventListener('click',()=>go(i,true));dots?.appendChild(b);});
    const go=(i,user=false)=>{index=(i+slides.length)%slides.length;track.style.transform=`translateX(-${index*100}%)`;dots?.querySelectorAll('button').forEach((b,j)=>b.classList.toggle('active',j===index));if(user)restart();};
    const restart=()=>{clearInterval(timer);timer=setInterval(()=>go(index+1),5200);};window.goSantafeSlide=go;go(0);restart();
    document.getElementById('prevSlideV3')?.addEventListener('click',()=>go(index-1,true));document.getElementById('nextSlideV3')?.addEventListener('click',()=>go(index+1,true));
    let startX=0;track.addEventListener('touchstart',e=>startX=e.touches[0].clientX,{passive:true});track.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-startX;if(Math.abs(dx)>45)go(index+(dx<0?1:-1),true);},{passive:true});
  }
});
