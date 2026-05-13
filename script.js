document.addEventListener("contextmenu", e => e.preventDefault());
document.addEventListener("dragstart", e => e.preventDefault());

const observer = new IntersectionObserver(entries =>
{
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('show'); });
});
document.querySelectorAll('.fade').forEach(el => observer.observe(el));

const totalImages = 64;
var host = window.location.origin;

const numbers = Array.from({ length: totalImages }, (_, i) => i + 1);

for (let i = numbers.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
}

const images = numbers.map(num => `${host}/photos/photo${String(num).padStart(5, '0')}.webp`);

const gallery = document.getElementById('gallery');
images.forEach(src => {
  const div = document.createElement('div');
  div.className = 'gallery-item';
  const img = document.createElement('img');
  img.src = src;
  img.onload = () => img.style.opacity = '1';
  div.appendChild(img);
  const ov = document.createElement('div');
  ov.className = 'overlay';
  div.appendChild(ov);
  gallery.appendChild(div);
});

const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lightbox-img');
let allImgs = [...document.querySelectorAll('.gallery img')];
let idx = 0;
allImgs.forEach((img,i) => { img.onclick = () => { idx = i; show(); }; });

function show(){
  lb.style.display='flex';
  lbImg.src = allImgs[idx].src;
}

function prev(){
  idx=(idx-1+allImgs.length)%allImgs.length;
  show();
}

function next(){
  idx=(idx+1)%allImgs.length;
  show();
}

lb.onclick = e => { if(e.target===lb) lb.style.display='none'; };
document.getElementById('lb-close').onclick = () => lb.style.display='none';
document.getElementById('lb-prev').onclick = prev;
document.getElementById('lb-next').onclick = next;

document.addEventListener('keydown', e => {
  if(lb.style.display!=='flex') return;
  if(e.key==='Escape') lb.style.display='none';
  if(e.key==='ArrowLeft') prev();
  if(e.key==='ArrowRight') next();
});

let startX=0;
lb.addEventListener('touchstart', e => startX = e.touches[0].clientX);
lb.addEventListener('touchend', e => {
  let diff = e.changedTouches[0].clientX - startX;
  if(diff>50) prev();
  if(diff<-50) next();
});

document.getElementById('btn').onclick = () => {
  const n = document.getElementById('name').value.trim();
  const em = document.getElementById('email').value.trim();
  const msg = document.getElementById('msg');
  if(!n) return msg.textContent = 'Enter your name';
  if(!em.includes('@')) return msg.textContent = 'Enter a valid email';
  msg.textContent = 'Sending...';

  fetch('https://api/book',
  {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({name:n,email:em})
  })
  .then(() => msg.textContent='Thanks! I will contact you soon.')
  .catch(() => msg.textContent='Error submitting.');
};
