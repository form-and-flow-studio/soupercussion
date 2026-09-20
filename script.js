const reduced=matchMedia('(prefers-reduced-motion: reduce)'),toggle=document.querySelector('.motion-toggle');
function setMotion(paused){document.body.classList.toggle('motion-off',paused);toggle.setAttribute('aria-pressed',String(paused));toggle.textContent=translate(paused?'▶ Motion':'Ⅱ Motion');toggle.setAttribute('aria-label',translate(paused?'Enable page animations':'Pause page animations'))}
setMotion(reduced.matches);toggle.addEventListener('click',()=>setMotion(!document.body.classList.contains('motion-off')));reduced.addEventListener('change',e=>setMotion(e.matches));
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.06});document.querySelectorAll('.story-images,.story-copy,.section-heading,.session,.album-art,.album-copy,.timeline article,.video-grid article,.second-feature,.gallery-photo').forEach((el,i)=>{el.classList.add('reveal');el.style.transitionDelay=(i%3)*70+'ms';observer.observe(el)});document.body.classList.add('ready')}
let ticking=false;function progress(){const max=document.documentElement.scrollHeight-innerHeight;document.querySelector('.reading-progress').style.transform='scaleX('+(max>0?scrollY/max:0)+')';ticking=false}addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(progress);ticking=true}},{passive:true});addEventListener('resize',progress);progress();
const dialog=document.querySelector('.lightbox'),photos=[...document.querySelectorAll('.gallery-photo')];let photoIndex=0,lastFocus=null;
function showPhoto(index){photoIndex=(index+photos.length)%photos.length;const photo=photos[photoIndex];dialog.querySelector('img').src=photo.dataset.photo;dialog.querySelector('img').alt=photo.dataset.caption;dialog.querySelector('figcaption').textContent=photo.dataset.caption;dialog.querySelector('.lightbox-count').textContent=(photoIndex+1)+' / '+photos.length}
photos.forEach((button,index)=>button.addEventListener('click',()=>{lastFocus=button;showPhoto(index);dialog.showModal();document.body.style.overflow='hidden'}));
dialog.querySelector('.lightbox-close').addEventListener('click',()=>dialog.close());dialog.querySelector('.lightbox-prev').addEventListener('click',()=>showPhoto(photoIndex-1));dialog.querySelector('.lightbox-next').addEventListener('click',()=>showPhoto(photoIndex+1));dialog.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();showPhoto(photoIndex+1)}if(event.key==='ArrowLeft'){event.preventDefault();showPhoto(photoIndex-1)}});dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});dialog.addEventListener('close',()=>{document.body.style.overflow='';lastFocus?.focus()});

document.addEventListener("languagechange",()=>{setMotion(document.body.classList.contains("motion-off"));if(dialog.open)showPhoto(photoIndex);progress()});
let preferredLanguage="en";try{preferredLanguage=localStorage.getItem("soupercussion-language")||"en"}catch{}setLanguage(preferredLanguage);

const menuButton=document.querySelector('.menu-toggle'), navigation=document.querySelector('#main-navigation');
function setMenu(open,restoreFocus=false){
 document.querySelector('header').classList.toggle('menu-open',open);
 menuButton.setAttribute('aria-expanded',String(open));
 menuButton.setAttribute('aria-label',translate(open?'Close navigation menu':'Open navigation menu'));
 menuButton.querySelector('span').textContent=open?'✕':'☰';
 if(restoreFocus)menuButton.focus();
}
menuButton.addEventListener('click',()=>setMenu(menuButton.getAttribute('aria-expanded')!=='true'));
navigation.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menuButton.getAttribute('aria-expanded')==='true')setMenu(false,true)});
document.addEventListener('click',event=>{if(!event.target.closest('header'))setMenu(false)});
document.addEventListener('focusin',event=>{if(!event.target.closest('header'))setMenu(false)});
matchMedia('(max-width:900px)').addEventListener('change',()=>setMenu(false));
document.addEventListener('languagechange',()=>setMenu(menuButton.getAttribute('aria-expanded')==='true'));
setMenu(false);
