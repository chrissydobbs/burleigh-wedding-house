/* Burleigh Wedding House — prototype interactions */

// --- mobile nav ---
function toggleNav(){document.getElementById('navLinks').classList.toggle('open');}

// --- graceful image fallback: if a photo fails, keep the elegant gradient ---
function bgImg(el,url){
  const img=new Image();
  img.onload=()=>{el.style.backgroundImage=`linear-gradient(0deg,rgba(43,41,38,.06),rgba(43,41,38,.06)),url('${url}')`;};
  img.src=url;
}
function hydrateImages(){
  document.querySelectorAll('[data-img]').forEach(el=>bgImg(el,el.getAttribute('data-img')));
}

// --- a small curated photo set (loads if reachable, else stays as gradient) ---
const PHOTOS={
  coastal:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=70',
  ceremony:'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=70',
  florals:'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=70',
  table:'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=70',
  candles:'https://images.unsplash.com/photo-1602874801006-e26c4c5b5d44?auto=format&fit=crop&w=900&q=70',
  couple:'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=70',
  dress:'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=900&q=70',
  rings:'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=900&q=70',
  venue:'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=70'
};

// =================== CONSULTATION ===================
const C={step:0,total:5,data:{}};
function showStep(n){
  const steps=document.querySelectorAll('.step');
  if(n<0||n>=steps.length)return;
  steps.forEach(s=>s.classList.remove('active'));
  steps[n].classList.add('active');
  C.step=n;
  const p=document.querySelector('.progress span');
  if(p)p.style.width=((n+1)/steps.length*100)+'%';
  window.scrollTo({top:0,behavior:'smooth'});
}
function nextStep(){
  // capture values on current step
  const cur=document.querySelectorAll('.step')[C.step];
  cur.querySelectorAll('input,textarea,select').forEach(f=>{if(f.name)C.data[f.name]=f.value;});
  showStep(C.step+1);
}
function prevStep(){showStep(C.step-1);}
function pick(el,name,val){
  el.parentNode.querySelectorAll('.choice').forEach(c=>c.classList.remove('sel'));
  el.classList.add('sel');
  C.data[name]=val;
}

function generate(){
  const cur=document.querySelectorAll('.step')[C.step];
  cur.querySelectorAll('input,textarea,select').forEach(f=>{if(f.name)C.data[f.name]=f.value;});
  // need an email to "save"
  if(!C.data.email){alert('Please add your email so we can save Your Wedding and send your story.');return;}
  document.getElementById('formArea').style.display='none';
  document.getElementById('loader').classList.add('active');
  setTimeout(()=>{
    document.getElementById('loader').classList.remove('active');
    renderStory();
    localStorage.setItem('bwh', JSON.stringify(C.data));
  },2600);
}

function renderStory(){
  const d=C.data;
  const names=d.names||'You';
  const place=d.location||'the coast';
  const season=d.season||'';
  const guests=d.guests||'your closest people';
  const styleWord={
    'Coastal & relaxed':'sun-warmed and barefoot-elegant',
    'Moody & romantic':'candlelit, intimate and quietly dramatic',
    'Heritage & timeless':'gracious, storied and beautifully composed',
    'Wild & natural':'unstructured, green and full of movement'
  }[d.style]||'unmistakably yours';

  const story=`There is a version of your wedding that already exists — and from what you've told me, it is ${styleWord}.<br><br>`+
  `I picture ${names} at ${place}${season?', '+season.toLowerCase():''}. The light does most of the work. ${guests==='your closest people'?'Your closest people':guests+' guests} gather close, candle by candle, as the afternoon softens into evening. Nothing feels staged. Everything feels like you.<br><br>`+
  `This is the kind of day I love to build — where the styling, the words spoken, and the small handmade details all belong to the same story. I'd be honoured to help you shape it.`;

  document.getElementById('storyText').innerHTML=story;
  document.getElementById('storyTitle').textContent=(d.names? d.names+'’s Wedding' : 'Your Wedding Story');

  // moodboard
  const keys=['ceremony','florals','candles','table','dress','venue'];
  document.querySelectorAll('#mood .m').forEach((m,i)=>{if(PHOTOS[keys[i]])bgImg(m,PHOTOS[keys[i]]);});

  document.getElementById('results').style.display='block';
  window.scrollTo({top:0,behavior:'smooth'});
}

// =================== DASHBOARD ===================
function loadDashboard(){
  const raw=localStorage.getItem('bwh');
  const d=raw?JSON.parse(raw):{};
  const names=d.names||'Lovely';
  const firstName=names.split('&')[0].trim().split(' ')[0]||names;
  const greetEl=document.getElementById('greet');
  if(greetEl)greetEl.textContent='Welcome back, '+firstName;
  const storyEl=document.getElementById('dashStory');
  if(storyEl && d.location){
    storyEl.textContent=`A ${ (d.style||'timeless').toLowerCase() } celebration ${d.location? 'at '+d.location:''}${d.season? ', '+d.season.toLowerCase():''} — for ${d.guests||'your closest people'}${(d.guests&&!isNaN(d.guests))?' guests':''}.`;
  }
  // countdown
  const cEl=document.getElementById('countdown');
  if(cEl){
    let target=d.date?new Date(d.date):null;
    if(!target||isNaN(target)){target=new Date();target.setMonth(target.getMonth()+11);}
    const days=Math.max(0,Math.ceil((target-new Date())/86400000));
    cEl.textContent=days;
  }
  // budget
  if(d.budget){
    const b=parseInt(String(d.budget).replace(/[^0-9]/g,''))||35000;
    const spent=Math.round(b*0.34);
    const be=document.getElementById('budTotal');if(be)be.textContent='$'+b.toLocaleString();
    const se=document.getElementById('budSpent');if(se)se.textContent='$'+spent.toLocaleString()+' allocated';
    const ba=document.getElementById('budBar');if(ba)ba.style.width='34%';
  }
}

// run on load
document.addEventListener('DOMContentLoaded',()=>{
  hydrateImages();
  if(document.body.dataset.page==='dashboard')loadDashboard();
});
