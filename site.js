/* Anna Bettini · portfolio · shared behaviour (vanilla JS, no dependencies) */
(()=>{
'use strict';
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
const root=document.documentElement;
const TR=window.__T||{};const T=s=>(TR[s]!==undefined?TR[s]:s);
const LANG=(root.lang||'it').slice(0,2);
const LOC={it:'it-IT',en:'en-US',fr:'fr-FR',es:'es-ES',de:'de-DE'}[LANG]||'it-IT';
const [GS,DS]={it:['.',','],en:[',','.'],fr:['\u202f',','],es:['.',','],de:['.',',']}[LANG]||['.',','];
const ICON={play:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" fill="currentColor"/></svg>'};

/* ---------- clock ---------- */
const clk=$('#clock');
if(clk){
  const t=()=>{
    const n=new Date(),o={timeZone:'Europe/Rome'};
    const d=n.toLocaleDateString(LOC,{...o,weekday:'short',day:'numeric',month:'short'}).replace(',','');
    const h=n.toLocaleTimeString(LOC,{...o,hour:LANG==='en'?'numeric':'2-digit',minute:'2-digit'});
    clk.innerHTML='<span class="cd">'+d+'</span> <span>'+h+'</span>';
  };
  t();setInterval(t,15e3);
}

/* ---------- notification banner ---------- */
let nt=null,ntT=0;
function notify(title,html,initials){
  if(!nt){
    nt=document.createElement('div');nt.className='nt';nt.setAttribute('role','status');nt.setAttribute('aria-live','polite');
    nt.innerHTML='<div class="nt__i" aria-hidden="true"></div><div><b></b><span></span></div>';
    document.body.appendChild(nt);
  }
  $('.nt__i',nt).textContent=initials||'AB';
  $('b',nt).textContent=title;
  $('span',nt).innerHTML=html;
  void nt.offsetWidth;
  nt.classList.add('is-on');
  clearTimeout(ntT);ntT=setTimeout(()=>nt.classList.remove('is-on'),5200);
}
const WA=$('[data-wa]')?$('[data-wa]').href:'https://wa.me/393319333084';

/* ---------- menu bar popovers ---------- */
const trig=$$('.st>button[aria-controls]');
function closePops(except){
  trig.forEach(b=>{
    if(b===except)return;
    b.setAttribute('aria-expanded','false');
    const p=document.getElementById(b.getAttribute('aria-controls'));if(p)p.hidden=true;
  });
}
trig.forEach(b=>b.addEventListener('click',e=>{
  e.stopPropagation();
  const p=document.getElementById(b.getAttribute('aria-controls')),open=b.getAttribute('aria-expanded')==='true';
  closePops();
  if(!open){b.setAttribute('aria-expanded','true');p.hidden=false;}
}));
document.addEventListener('click',e=>{if(!e.target.closest('.st'))closePops()});
/* language links keep the current section */
$$('#lang-list a').forEach(a=>a.addEventListener('click',()=>{a.href=a.href.split('#')[0]+location.hash}));

/* wi-fi */
const wsw=$('#wifi-sw'),wl=$('#wifi-list'),wb=$('#wifi-btn');
if(wsw){
  wsw.addEventListener('click',()=>{
    const on=wsw.getAttribute('aria-checked')!=='true';
    wsw.setAttribute('aria-checked',on);wl.hidden=!on;wb.classList.toggle('is-off',!on);
    if(!on)notify(T('Wi-Fi disattivato'),T('Nemmeno offline smetto di avere idee. Riaccendilo e scrivimi.'));
  });
  $$('.net',wl).forEach(n=>n.addEventListener('click',()=>{
    if(n.classList.contains('is-on'))notify('Anna_Creative_Studio',T('Rete personale di Anna: qui nascono brand, social e idee.'));
    else notify(T('Password richiesta'),'<b style="display:inline;font-size:inherit">'+n.dataset.hint+'</b> <a href="'+WA+'" target="_blank" rel="noopener noreferrer">'+T('Scrivimi su WhatsApp')+'</a>','Wi');
  }));
}
/* battery */
const bb=$('#bat-lv');
if(bb&&navigator.getBattery){
  navigator.getBattery().then(b=>{
    const u=()=>{
      const l=Math.round(b.level*100);
      $('#bat-pct').textContent=l+'%';
      $('#bat-bar').style.setProperty('--lv',l+'%');
      $('#bat-ic').setAttribute('width',(17*l/100).toFixed(1));
      $('#bat-st').textContent=b.charging?T('In carica'):T('Batteria');
      $('#bat-note').textContent=b.charging?T('Il tuo dispositivo è collegato alla corrente.'):T('Questo è il livello della batteria del tuo dispositivo.');
    };
    u();b.addEventListener('levelchange',u);b.addEventListener('chargingchange',u);
  }).catch(()=>{});
}

/* ---------- spotlight ---------- */
const spBtn=$('#sp-btn');let sp=null,spLast=null,spSel=0;
const norm=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
function spBuild(){
  if(sp)return;
  sp=document.createElement('div');sp.className='sp';sp.hidden=true;
  sp.innerHTML='<div class="sp__box" role="dialog" aria-modal="true" aria-label="'+T('Cerca nel portfolio')+'"><div class="sp__in"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg><input type="text" placeholder="'+T('Cerca progetti, sezioni, contatti')+'" aria-label="'+T('Cerca')+'" autocomplete="off" spellcheck="false"><kbd>esc</kbd></div><ul class="sp__ls" role="listbox"></ul></div>';
  document.body.appendChild(sp);
  const inp=$('input',sp),ul=$('.sp__ls',sp);
  const data=window.__SP||[];
  const render=()=>{
    const q=norm(inp.value.trim());
    const list=data.filter(i=>!q||norm(i.t+' '+(i.s||'')+' '+i.g).includes(q));
    let g='',h='';
    list.forEach((i,n)=>{
      if(i.g!==g){g=i.g;h+='<li class="sp__h" role="presentation">'+g+'</li>'}
      h+='<li role="presentation"><a role="option" href="'+i.u+'"'+(i.x?' target="_blank" rel="noopener noreferrer"':'')+' data-i="'+n+'"><span class="k" aria-hidden="true">'+i.k+'</span>'+i.t+(i.s?'<small>'+i.s+'</small>':'')+'</a></li>';
    });
    ul.innerHTML=h||(q?'<li class="sp__h" role="presentation">'+T('Nessun risultato')+'</li>':'');
    spSel=0;mark();
  };
  const mark=()=>{$$('a',ul).forEach((a,n)=>a.setAttribute('aria-selected',n===spSel));const a=$$('a',ul)[spSel];if(a)a.scrollIntoView({block:'nearest'})};
  inp.addEventListener('input',render);
  inp.addEventListener('keydown',e=>{
    const n=$$('a',ul).length;
    if(e.key==='ArrowDown'){e.preventDefault();spSel=(spSel+1)%Math.max(n,1);mark()}
    else if(e.key==='ArrowUp'){e.preventDefault();spSel=(spSel-1+n)%Math.max(n,1);mark()}
    else if(e.key==='Enter'){const a=$$('a',ul)[spSel];if(a){spClose();a.click()}}
  });
  ul.addEventListener('mousemove',e=>{const a=e.target.closest('a');if(a){spSel=+a.dataset.i;mark()}});
  ul.addEventListener('click',e=>{if(e.target.closest('a'))spClose()});
  sp.addEventListener('mousedown',e=>{if(e.target===sp)spClose()});
  sp._r=render;
}
function spOpen(){
  spBuild();closePops();spLast=document.activeElement;sp.hidden=false;$('input',sp).value='';sp._r();$('input',sp).focus();
  if(spBtn)spBtn.setAttribute('aria-expanded','true');
}
function spClose(){
  if(!sp||sp.hidden)return;sp.hidden=true;if(spBtn)spBtn.setAttribute('aria-expanded','false');
  if(spLast&&spLast.focus)spLast.focus();
}
if(spBtn)spBtn.addEventListener('click',e=>{e.stopPropagation();sp&&!sp.hidden?spClose():spOpen()});
document.addEventListener('keydown',e=>{
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();sp&&!sp.hidden?spClose():spOpen()}
  else if(e.key==='/'&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)&&!(pv&&!pv.hidden)){e.preventDefault();spOpen()}
});

/* ---------- reveal ---------- */
const io='IntersectionObserver' in window?new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;e.target.classList.add('in');io.unobserve(e.target);
  if(e.target._calc)e.target._calc.countUp();
}),{threshold:.2}):null;
$$('.rv').forEach(e=>io?io.observe(e):e.classList.add('in'));

/* ---------- finder filter ---------- */
const side=$$('.side button');
if(side.length){
  const tiles=$$('.tile'),cnt=$('#fin-n'),path=$('#fin-p');
  side.forEach(b=>b.addEventListener('click',()=>{
    side.forEach(x=>x.setAttribute('aria-pressed',x===b));
    let n=0;tiles.forEach(t=>{const h=b.dataset.f!=='all'&&t.dataset.cat!==b.dataset.f;t.hidden=h;if(!h)n++});
    if(cnt)cnt.textContent=n+' '+(n===1?T('elemento'):T('elementi'));
    if(path)path.textContent=b.dataset.l;
  }));
}

/* ---------- draggable desktop items (mouse / pen only) ---------- */
let zTop=10;
$$('.stk[data-drag]').forEach(el=>{
  const stage=el.closest('.stage');if(!stage)return;
  let st=null,moved=false,raf=0,nx=0,ny=0,blk=false;
  const gv=n=>parseFloat(el.style.getPropertyValue(n))||0;
  el.addEventListener('pointerdown',e=>{
    if(e.pointerType==='touch'||e.button!==0)return;
    const r=el.getBoundingClientRect(),s=stage.getBoundingClientRect();
    st={x:e.clientX,y:e.clientY,dx:gv('--dx'),dy:gv('--dy'),x0:s.left-r.left,x1:s.right-r.right,y0:s.top-r.top,y1:s.bottom-r.bottom};
    moved=false;el.style.zIndex=++zTop;
    try{el.setPointerCapture(e.pointerId)}catch(_){}
  });
  el.addEventListener('pointermove',e=>{
    if(!st)return;
    const mx=e.clientX-st.x,my=e.clientY-st.y;
    if(!moved){if(Math.hypot(mx,my)<4)return;moved=true;el.classList.add('is-drag')}
    nx=st.dx+Math.min(Math.max(mx,st.x0),st.x1);ny=st.dy+Math.min(Math.max(my,st.y0),st.y1);
    if(!raf)raf=requestAnimationFrame(()=>{raf=0;el.style.setProperty('--dx',nx.toFixed(1)+'px');el.style.setProperty('--dy',ny.toFixed(1)+'px')});
  });
  const end=()=>{if(!st)return;st=null;el.classList.remove('is-drag');if(moved){blk=true;setTimeout(()=>blk=false,0)}};
  el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
  el.addEventListener('click',e=>{if(blk){e.preventDefault();e.stopImmediatePropagation()}},true);
  el.addEventListener('dragstart',e=>e.preventDefault());
  if(fine)el.classList.add('is-mouse');
});

/* ---------- dock ---------- */
const dock=$('.dock');
if(dock){
  const apps=$$('.app',dock);
  let base=[],raf=0,mx=0,on=false;
  const measure=()=>{
    apps.forEach(a=>{a.style.setProperty('--x','0px');a.style.setProperty('--s',1)});
    base=apps.map(a=>{const r=a.getBoundingClientRect();return{c:r.left+r.width/2,w:r.width}});
  };
  const frame=()=>{
    raf=0;
    const sc=base.map(b=>on?1+.52*Math.exp(-Math.pow(mx-b.c,2)/(2*58*58)):1);
    const ex=sc.map((s,i)=>(s-1)*base[i].w),tot=ex.reduce((a,b)=>a+b,0);
    let acc=0;
    apps.forEach((a,i)=>{
      a.style.setProperty('--s',sc[i].toFixed(3));
      a.style.setProperty('--x',(-tot/2+acc+ex[i]/2).toFixed(1)+'px');
      a.style.setProperty('--lift',ex[i].toFixed(1)+'px');
      acc+=ex[i];
    });
  };
  if(fine&&!rm){
    dock.addEventListener('pointerenter',e=>{if(e.pointerType==='touch')return;measure();apps.forEach(a=>a.classList.add('is-mag'));on=true;mx=e.clientX;raf||(raf=requestAnimationFrame(frame))});
    dock.addEventListener('pointermove',e=>{if(!on)return;mx=e.clientX;raf||(raf=requestAnimationFrame(frame))});
    dock.addEventListener('pointerleave',()=>{on=false;raf||(raf=requestAnimationFrame(frame));setTimeout(()=>{if(!on)apps.forEach(a=>a.classList.remove('is-mag'))},220)});
    addEventListener('resize',()=>{if(!on)measure()});
  }
  // touch: tap on non-link apps shows the label
  apps.forEach(a=>{
    if(a.tagName==='BUTTON'&&!a.dataset.trash){
      a.addEventListener('click',()=>{apps.forEach(x=>x.classList.remove('is-tip'));a.classList.add('is-tip');setTimeout(()=>a.classList.remove('is-tip'),1600)});
    }
  });
  const tr=$('[data-trash]',dock);
  if(tr)tr.addEventListener('click',()=>{
    tr.classList.remove('shake');void tr.offsetWidth;tr.classList.add('shake');
    notify(T('Cestino vuoto'),T('Qui non si butta via niente: le idee migliori si tengono tutte.'),'Ct');
  });
}

/* ---------- calculators ---------- */
function fmt(n){
  if(!isFinite(n))return T('Errore');
  n=Number(n.toPrecision(12));
  const a=Math.abs(n);
  if(a>=1e9||(a>0&&a<1e-6))return n.toExponential(3).replace('.',DS).replace('e+','e');
  const ip=Math.floor(a).toString().length,dec=Math.max(0,9-ip);
  return grp(n.toLocaleString('en-US',{maximumFractionDigits:dec,useGrouping:false}).replace('.',','));
}
function grp(s){ // group the integer part of a raw typed string like "1234,5" (internal decimal mark is always a comma)
  const [i,d]=s.split(',');
  return i.replace(/\B(?=(\d{3})+(?!\d))/g,GS)+(d!==undefined?DS+d:'');
}
class Calc{
  constructor(el){
    this.el=el;el._calc=this;
    this.d=$('.calc__d',el);this.c=$('.calc__c',el);
    this.stat=+el.dataset.n;this.cap=this.c.textContent;
    this.t=0;this.mode='stat';this.raw='0';this.acc=null;this.op=null;this.fresh=true;this.last=null;
    $$('button',el).forEach(b=>{
      b.tabIndex=-1;
      b.addEventListener('click',()=>this.press(b.dataset.k));
      b.addEventListener('pointerdown',()=>{b.classList.add('is-p');setTimeout(()=>b.classList.remove('is-p'),140)});
    });
    el.addEventListener('keydown',e=>{
      if(e.ctrlKey||e.metaKey||e.altKey)return;
      let k=e.key;
      if(/^[0-9]$/.test(k)){this.press(k)}
      else if(k===','||k==='.'){this.press(',')}
      else if(k==='+'||k==='-'||k==='*'||k==='/'){this.press({'+':'+','-':'−','*':'×','/':'÷'}[k])}
      else if(k==='Enter'||k==='='){this.press('=')}
      else if(k==='Backspace'||k==='Delete'||k==='Escape'){this.press('AC')}
      else if(k==='%'){this.press('%')}
      else return;
      e.preventDefault();
    });
  }
  countUp(){
    if(this.mode!=='stat')return;
    if(rm){this.show(fmt(this.stat));return}
    const n=this.stat,s=performance.now(),f=x=>{
      if(this.mode!=='stat')return;
      const p=Math.min((x-s)/1300,1);
      this.show(fmt(Math.round(n*(1-Math.pow(1-p,3)))));
      if(p<1)requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  }
  show(t){
    this.d.textContent=t;
    const w=this.el.clientWidth-36;this.d.style.fontSize='';
    let fs=parseFloat(getComputedStyle(this.d).fontSize);
    while(this.d.scrollWidth>w&&fs>22){fs-=2;this.d.style.fontSize=fs+'px'}
  }
  toStat(){
    this.mode='stat';this.raw='0';this.acc=null;this.op=null;this.fresh=true;
    $$('.op',this.el).forEach(b=>b.classList.remove('is-a'));
    this.c.textContent=this.cap;this.show(fmt(this.stat));
  }
  idle(){clearTimeout(this.t);this.t=setTimeout(()=>this.toStat(),9000)}
  val(){return parseFloat(this.raw.replace(',','.'))||0}
  calc(a,op,b){return op==='+'?a+b:op==='−'?a-b:op==='×'?a*b:op==='÷'?(b===0?NaN:a/b):b}
  press(k){
    if(this.mode==='stat'){this.mode='calc';this.raw='0';this.fresh=true;this.c.textContent=T('Fai pure i tuoi conti: dopo qualche secondo torna il dato.')}
    this.idle();
    $$('.op',this.el).forEach(b=>b.classList.remove('is-a'));
    if(/^[0-9]$/.test(k)){
      if(this.fresh){this.raw='0';this.fresh=false}
      if(this.raw.replace(/[^0-9]/g,'').length>=9)return;
      this.raw=this.raw==='0'?k:this.raw+k;this.show(grp(this.raw));
    }else if(k===','){
      if(this.fresh){this.raw='0';this.fresh=false}
      if(!this.raw.includes(','))this.raw+=',';this.show(grp(this.raw));
    }else if(k==='AC'){
      this.raw='0';this.acc=null;this.op=null;this.fresh=true;this.show('0');
    }else if(k==='±'){
      const v=-this.val();this.raw=String(v).replace('.',',');this.show(fmt(v));
    }else if(k==='%'){
      const v=this.val()/100;this.raw=String(v).replace('.',',');this.show(fmt(v));this.fresh=true;
    }else if(k==='='){
      if(this.op!==null){
        const b=this.fresh&&this.last!==null?this.last:this.val(),r=this.calc(this.acc,this.op,b);
        this.last=b;this.raw=String(r).replace('.',',');this.show(fmt(r));this.acc=null;this.fresh=true;
        this.eqOp=this.op;this.op=null;
        if(!isFinite(r)){this.raw='0'}
      }
    }else{ // operator
      if(this.op!==null&&!this.fresh){const r=this.calc(this.acc,this.op,this.val());this.acc=r;this.show(fmt(r))}
      else this.acc=this.val();
      this.op=k;this.fresh=true;this.last=null;
      const b=$$('.op',this.el).find(x=>x.dataset.k===k);if(b)b.classList.add('is-a');
    }
  }
}
$$('.calc').forEach(el=>{const c=new Calc(el);if(!io)c.countUp()});

/* ---------- preview (images) & quicktime (video) ---------- */
let pv=null,pvItems=[],pvI=0,pvZ=1,pvLast=null,pvVideo=false,pvBase=1;
const ZS=[.5,.75,1,1.5,2,3];
function pvBuild(){
  if(pv)return;
  pv=document.createElement('div');pv.className='pv';pv.hidden=true;
  pv.innerHTML=
  '<div class="pv__w" role="dialog" aria-modal="true" aria-label="'+T('Anteprima')+'">'+
   '<div class="tb"><div class="tl tl--live"><button class="c" type="button" aria-label="'+T('Chiudi')+'"></button><button class="m" type="button" aria-label="'+T('Riduci a icona')+'"></button><button class="z" type="button" aria-label="'+T('Schermo intero finestra')+'"></button></div>'+
   '<div class="tb__t"><span class="pv__n"></span><small class="pv__s">'+T('Anteprima')+'</small></div>'+
   '<div class="pv__tools"><button type="button" data-a="side" aria-label="'+T('Mostra o nascondi miniature')+'" aria-pressed="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M9.5 5v14"/></svg></button>'+
   '<button type="button" data-a="out" aria-label="'+T('Riduci zoom')+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M8 10.5h5M15.5 15.5L21 21"/></svg></button>'+
   '<button type="button" data-a="in" aria-label="'+T('Aumenta zoom')+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M8 10.5h5M10.5 8v5M15.5 15.5L21 21"/></svg></button><span class="zl" aria-live="polite">'+T('Adatta')+'</span></div>'+'</div>'+
   '<div class="pv__body"><div class="pv__side" hidden></div><div class="pv__st" tabindex="-1"><button class="pv__arr pv__arr--p" type="button" aria-label="'+T('Immagine precedente')+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button><button class="pv__arr pv__arr--n" type="button" aria-label="'+T('Immagine successiva')+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></button></div></div>'+
   '<div class="pv__ft"><span class="pv__c"></span><a class="pv__l" hidden></a></div></div>';
  document.body.appendChild(pv);
  pv.addEventListener('mousedown',e=>{if(e.target===pv)pvClose()});
  $('.c',pv).addEventListener('click',pvClose);
  $('.m',pv).addEventListener('click',pvClose);
  $('.z',pv).addEventListener('click',()=>{pv.classList.toggle('is-full');setTimeout(pvFit,30)});
  $('[data-a=in]',pv).addEventListener('click',()=>pvZoom(1));
  $('[data-a=out]',pv).addEventListener('click',()=>pvZoom(-1));
  $('[data-a=side]',pv).addEventListener('click',e=>{const s=$('.pv__side',pv),b=e.currentTarget,on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on);s.hidden=!on;setTimeout(pvFit,30)});
  $('.pv__arr--p',pv).addEventListener('click',()=>pvGo(-1));
  $('.pv__arr--n',pv).addEventListener('click',()=>pvGo(1));
  $('.zl',pv).addEventListener('click',()=>{pvZ=1;pvFit()});
  addEventListener('resize',()=>{if(!pv.hidden&&!pvVideo)pvFit()});
  // touch swipe
  let tx=null;const st=$('.pv__st',pv);
  st.addEventListener('touchstart',e=>{tx=e.touches.length===1&&pvZ===1?e.touches[0].clientX:null},{passive:true});
  st.addEventListener('touchend',e=>{if(tx===null||pvVideo)return;const dx=e.changedTouches[0].clientX-tx;tx=null;if(Math.abs(dx)>60)pvGo(dx<0?1:-1)},{passive:true});
  st.addEventListener('dblclick',e=>{if(pvVideo||e.target.tagName!=='IMG')return;pvZ=pvZ>1?1:2;pvFit()});
}
function pvZoom(d){
  let i=ZS.findIndex(z=>Math.abs(z-pvZ)<.01);if(i<0)i=2;
  i=Math.min(Math.max(i+d,0),ZS.length-1);pvZ=ZS[i];pvFit();
}
function pvFit(){
  if(!pv||pvVideo)return;
  const img=$('.pv__st img',pv),st=$('.pv__st',pv);if(!img||!img.naturalWidth)return;
  const aw=st.clientWidth-32,ah=st.clientHeight-32;
  pvBase=Math.min(aw/img.naturalWidth,ah/img.naturalHeight);
  img.style.width=Math.round(img.naturalWidth*pvBase*pvZ)+'px';img.style.height='auto';
  $('.zl',pv).textContent=pvZ===1?T('Adatta'):Math.round(pvZ*100)+'%';
  st.style.placeItems=pvZ>1?'safe center':'center';
}
function pvShow(){
  const it=pvItems[pvI],st=$('.pv__st',pv);
  $('.pv__n',pv).textContent=it.name;
  $('.pv__s',pv).textContent=pvItems.length>1?T('Anteprima')+' · '+(pvI+1)+' '+T('di')+' '+pvItems.length:T('Anteprima');
  $('.pv__c',pv).textContent=it.cap||'';
  const l=$('.pv__l',pv);if(it.link){l.hidden=false;l.href=it.link;l.textContent=it.lt||T('Apri il progetto →')}else l.hidden=true;
  $('.pv__arr--p',pv).hidden=pvI===0;$('.pv__arr--n',pv).hidden=pvI===pvItems.length-1;
  $$('.pv__side button',pv).forEach((b,n)=>b.setAttribute('aria-current',n===pvI));
  let img=$('img',st);
  if(!img){img=new Image();st.prepend(img)}
  pvZ=1;img.classList.add('is-load');
  img.onload=()=>{img.classList.remove('is-load');pvFit()};
  img.alt=it.cap||it.name;img.decoding='async';img.src=it.url;
  if(img.complete&&img.naturalWidth){img.classList.remove('is-load');pvFit()}
}
function pvGo(d){const n=pvI+d;if(n<0||n>=pvItems.length)return;pvI=n;pvShow();const a=$$('.pv__side button',pv)[pvI];if(a)a.scrollIntoView({block:'nearest'})}
function pvOpen(list,i,trigger){
  pvBuild();pvVideo=false;pv.classList.remove('pv--v');pvItems=list;pvI=i;pvLast=trigger||document.activeElement;
  pv.classList.toggle('is-ph',matchMedia('(max-width:860px)').matches);
  const sd=$('.pv__side',pv);
  $('.pv__tools',pv).hidden=false;
  const wide=matchMedia('(min-width:861px)').matches&&list.length>1;
  sd.innerHTML=list.map((it,n)=>'<button type="button" data-n="'+n+'" aria-label="'+it.name+'"><img src="'+(it.th||it.url)+'" alt="" decoding="async"></button>').join('');
  sd.hidden=!wide;$('[data-a=side]',pv).setAttribute('aria-pressed',wide);$('[data-a=side]',pv).hidden=list.length<2;
  $$('button',sd).forEach(b=>b.addEventListener('click',()=>{pvI=+b.dataset.n;pvShow()}));
  const st=$('.pv__st',pv);$$('video',st).forEach(v=>v.remove());
  pv.hidden=false;root.style.overflow='hidden';pvShow();
  $('.c',pv).focus({preventScroll:true});
}
function pvOpenVideo(d,trigger){
  pvBuild();pvVideo=true;pvLast=trigger||document.activeElement;
  pv.classList.add('pv--v');pv.classList.toggle('is-ph',matchMedia('(max-width:860px)').matches);
  const st=$('.pv__st',pv);$$('img',st).forEach(i=>i.remove());$$('video',st).forEach(v=>v.remove());
  $('.pv__side',pv).hidden=true;$('.pv__tools',pv).hidden=true;
  $('.pv__arr--p',pv).hidden=true;$('.pv__arr--n',pv).hidden=true;
  $('.pv__n',pv).textContent=d.name;$('.pv__s',pv).textContent='QuickTime Player';$('.pv__c',pv).textContent=d.cap||'';
  const l=$('.pv__l',pv);if(d.link){l.hidden=false;l.href=d.link;l.textContent=d.lt||T('Apri il progetto →')}else l.hidden=true;
  const v=document.createElement('video');v.controls=true;v.playsInline=true;v.setAttribute('playsinline','');v.preload='auto';v.poster=d.poster||'';v.src=d.url;v.setAttribute('aria-label',d.cap||d.name);
  st.prepend(v);
  pv.hidden=false;root.style.overflow='hidden';
  $('.c',pv).focus({preventScroll:true});
  const p=v.play();if(p&&p.catch)p.catch(()=>{});
}
function pvClose(){
  if(!pv||pv.hidden)return;
  $$('video',pv).forEach(v=>{v.pause();v.removeAttribute('src');v.load();v.remove()});
  pv.hidden=true;pv.classList.remove('is-full');root.style.overflow='';
  if(pvLast&&pvLast.focus&&document.contains(pvLast))pvLast.focus({preventScroll:true});
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-pv]');
  if(b){
    e.preventDefault();
    const g=b.dataset.g||'',all=$$('[data-pv]').filter(x=>(x.dataset.g||'')===g);
    const list=all.map(x=>({url:x.dataset.pv,th:x.dataset.th,name:x.dataset.name||T('immagine'),cap:x.dataset.cap,link:x.dataset.link,lt:x.dataset.lt}));
    pvOpen(list,all.indexOf(b),b);return;
  }
  const v=e.target.closest('[data-qt]');
  if(v){e.preventDefault();pvOpenVideo({url:v.dataset.qt,poster:v.dataset.poster,name:v.dataset.name||'video.mp4',cap:v.dataset.cap,link:v.dataset.link,lt:v.dataset.lt},v)}
});
document.addEventListener('keydown',e=>{
  if(sp&&!sp.hidden){if(e.key==='Escape'){e.preventDefault();spClose()}return}
  if(pv&&!pv.hidden){
    if(e.key==='Escape'){e.preventDefault();pvClose();return}
    if(!pvVideo){
      if(e.key==='ArrowRight'){e.preventDefault();pvGo(1)}
      else if(e.key==='ArrowLeft'){e.preventDefault();pvGo(-1)}
      else if(e.key==='+'||e.key==='='){e.preventDefault();pvZoom(1)}
      else if(e.key==='-'){e.preventDefault();pvZoom(-1)}
      else if(e.key==='0'){e.preventDefault();pvZ=1;pvFit()}
    }
    if(e.key==='Tab'){
      const f=$$('button:not([hidden]),a[href]:not([hidden]),video[controls]',pv).filter(x=>x.offsetParent!==null);
      if(!f.length)return;
      const a=f[0],z=f[f.length-1];
      if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}
      else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}
    }
    return;
  }
  if(e.key==='Escape')closePops();
});
})();
