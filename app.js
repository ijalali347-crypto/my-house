const S=40,P=24,WALLH=2.6;
const T={
  sofa:{g:'Living room',w:2.1,h:.95,c:'#6d8fa6',n:'Sofa'},
  sofabed:{g:'Living room',w:2,h:1.05,c:'#8a9a7b',n:'Sofa bed'},
  armchair:{g:'Living room',w:.9,h:.9,c:'#b9855a',n:'Armchair'},
  coffee:{g:'Living room',w:1,h:.6,c:'#8a6a4a',n:'Coffee table'},
  tv:{g:'Living room',w:1.6,h:.4,c:'#5c4632',n:'TV unit'},
  shelf:{g:'Living room',w:1,h:.3,c:'#8a6a4a',n:'Bookshelf'},
  rug:{g:'Living room',w:2.4,h:1.6,c:'#c76f6f',n:'Rug'},
  bed:{g:'Bedroom',w:1.6,h:2,c:'#7d6b8f',n:'Bed'},
  wardrobe:{g:'Bedroom',w:1.2,h:.6,c:'#9a8f80',n:'Wardrobe'},
  desk:{g:'Work and dining',w:1.2,h:.6,c:'#b58a5a',n:'Desk'},
  chair:{g:'Work and dining',w:.5,h:.5,c:'#4a4f57',n:'Chair'},
  dining:{g:'Work and dining',w:1.8,h:1.8,c:'#b58a5a',n:'Dining set'},
  fridge:{g:'Kitchen and washroom',w:.7,h:.7,c:'#dfe5e8',n:'Fridge'},
  stove:{g:'Kitchen and washroom',w:.6,h:.6,c:'#c9ced1',n:'Stove'},
  sink:{g:'Kitchen and washroom',w:1.2,h:.6,c:'#cfc8bd',n:'Kitchen sink'},
  bath:{g:'Kitchen and washroom',w:1.7,h:.75,c:'#f4f6f7',n:'Bathtub'},
  toilet:{g:'Kitchen and washroom',w:.4,h:.7,c:'#f4f6f7',n:'Toilet'},
  basin:{g:'Kitchen and washroom',w:.6,h:.45,c:'#e9e5dc',n:'Wash basin'},
  shower:{g:'Kitchen and washroom',w:.9,h:.9,c:'#e9f1f4',n:'Shower'},
  lamp:{g:'Decor',w:.4,h:.4,c:'#f2d675',n:'Lamp'},
  plant:{g:'Decor',w:.5,h:.5,c:'#4f9d69',n:'Plant'},
  tree:{g:'Garden',w:1.2,h:1.2,c:'#4f9d69',n:'Tree'},
  bush:{g:'Garden',w:.8,h:.8,c:'#4f9d69',n:'Bush'},
  bench:{g:'Garden',w:1.5,h:.5,c:'#8a6a4a',n:'Bench'},
  flower:{g:'Garden',w:2,h:.8,c:'#e85d75',n:'Flower bed'},
  path:{g:'Garden',w:1,h:2.4,c:'#cfcabd',n:'Garden path'},
  door:{g:'Doors and windows',w:.9,h:.16,c:'#a9784c',n:'Door'},
  window:{g:'Doors and windows',w:1.2,h:.16,c:'#bfe7f5',n:'Window'}
};
const RT={
  living:{n:'Living room',w:5.5,l:4.5,f:'#d9b98a',k:'wood'},
  bedroom:{n:'Bedroom',w:4,l:3.5,f:'#d9b98a',k:'wood'},
  kitchen:{n:'Kitchen',w:3.5,l:4.5,f:'#e8e5de',k:'tile'},
  bath:{n:'Washroom',w:3,l:3.5,f:'#f1f3f2',k:'tile'},
  hall:{n:'Hall',w:2.5,l:2.5,f:'#bdc3c2',k:''},
  garden:{n:'Garden',w:6,l:4,f:'#6fa05a',k:'grass'}
};
RT.office={n:'Office',w:5,l:4,f:'#bdc3c2',k:''};
RT.meeting={n:'Meeting room',w:5,l:4,f:'#d9b98a',k:'wood'};
RT.reception={n:'Reception',w:4,l:3,f:'#f1f3f2',k:'tile'};
T.stairs={g:'Building',w:1.2,h:3,c:'#a7a095',n:'Stairs'};
Object.assign(T,{
 bedside:{g:'Interior details',w:.5,h:.45,c:'#8b6445',n:'Bedside table'},
 cabinet:{g:'Interior details',w:1.6,h:.45,c:'#8b6445',n:'Sideboard'},
 ottoman:{g:'Interior details',w:.75,h:.6,c:'#b8a58f',n:'Ottoman'},
 curtains:{g:'Interior details',w:1.8,h:.2,c:'#ddd0bb',n:'Curtains'},
 art:{g:'Interior details',w:1,h:.1,c:'#805d3e',n:'Framed art'}
});
const ROUND={plant:1,lamp:1,tree:1,bush:1},BK={sofa:1,sofabed:1,armchair:1,bed:1,chair:1};
const FLOORS=[['Oak','#d9b98a','wood'],['Walnut','#8a5f3e','wood'],['Concrete','#bdc3c2',''],['White tile','#f1f3f2','tile'],['Dark tile','#5d6670','tile'],['Lawn','#6fa05a','grass']];
const WALLS=[['White','#f2efe8'],['Sage','#b4c7b8'],['Soft blue','#b3c4da'],['Clay','#d9ab98']];
const ICOLS=['#6d8fa6','#8a9a7b','#b9855a','#7d6b8f','#c76f6f','#4a4f57','#d9d3c5'];
const KEY='house-designer-v4';
let PL,WALL=WALLS[0][1],rooms,items,nid=1,sel=null,mode=null,st=null,is3=false;
const $=id=>document.getElementById(id),svg=$('plan');
const snap=v=>Math.round(v*4)/4,cl=(v,a,b)=>Math.min(b,Math.max(a,v));
const isW=it=>it.t==='door'||it.t==='window';
const selRoom=()=>sel&&sel.k==='r'?rooms.find(r=>r.id===sel.id):null;
const selItem=()=>sel&&sel.k==='i'?items.find(i=>i.id===sel.id):null;
function save(){try{localStorage.setItem(KEY,JSON.stringify({PL,WALL,rooms,items}))}catch(e){}}
function starter(){
  PL={w:15,l:13};nid=1;sel=null;
  rooms=[['garden',.5,9,14,4],['bedroom',1,1,4.5,3.5],['bedroom',5.5,1,4,3.5],['bath',9.5,1,3,3.5],['living',1,4.5,5.5,4.5],['kitchen',6.5,4.5,3.5,4.5],['bath',10,4.5,2.5,2.2],['hall',10,6.7,2.5,2.3]]
    .map(([t,x,y,w,l])=>({id:nid++,t,x,y,w,l,floor:RT[t].f,fk:RT[t].k}));
  items=[
    ['bed',2.4,2.1,0],['wardrobe',4.8,1.35,0],['desk',4.7,4.1,180],['chair',4.7,3.6,0],['plant',1.4,4,0],
    ['bed',7.5,2.1,0,'#6d8fa6'],['wardrobe',9.2,2.8,90],['sofabed',7,3.95,180],
    ['shower',12,1.5,0],['toilet',10.1,1.4,0],['basin',11,1.3,0],['bath',11,4.05,0],
    ['rug',3.75,6.6,0],['tv',3.75,4.75,0],['sofa',3.75,8.2,180],['coffee',3.75,6.6,0],['armchair',5.9,6.6,90],['shelf',1.2,6.6,270],['plant',1.5,5.1,0],['lamp',1.5,8.5,0],
    ['sink',7.3,4.85,0],['stove',8.3,4.8,0],['fridge',9.5,4.85,0],['dining',8.25,7.2,0],
    ['toilet',10.5,4.85,0],['basin',11.5,4.8,0],['shower',11.9,6.2,0],['plant',10.5,7.2,0],['shelf',12.35,7.7,90],
    ['tree',2,11.5,0],['tree',13,11.5,0],['tree',7,12.1,0],['bush',4,9.6,0],['bush',5,9.6,0],['bush',9,9.6,0],['bench',8,10.4,180],['flower',4.5,11.2,0],['flower',10.5,10.6,0],['path',11.25,10.3,0],
    ['door',12,4.5,0],['door',3,4.5,0],['door',7.5,4.5,0],['door',6.5,7,90],['door',10,5.6,90],['door',11.25,9,0],
    ['window',3,1,180],['window',7.5,1,180],['window',11,1,180],['window',3.5,9,0],['window',8.2,9,0]
  ].map(([t,x,y,r,col])=>({id:nid++,t,x,y,r,col}));
}
starter();
try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&s.PL&&s.rooms&&s.items){PL=s.PL;WALL=s.WALL||WALL;rooms=s.rooms;items=s.items;nid=Math.max(0,...rooms.map(r=>r.id),...items.map(i=>i.id))+1}}catch(e){}

function wallSnap(it,keep){
  const E=[];
  rooms.forEach(r=>{if(r.t==='garden')return;
    E.push({a:'h',c:r.y,lo:r.x,hi:r.x+r.w,r:180},{a:'h',c:r.y+r.l,lo:r.x,hi:r.x+r.w,r:0},{a:'v',c:r.x,lo:r.y,hi:r.y+r.l,r:90},{a:'v',c:r.x+r.w,lo:r.y,hi:r.y+r.l,r:270});});
  let best=null,bd=1e9;
  E.forEach(e=>{const p=e.a==='h'?it.x:it.y,q=e.a==='h'?it.y:it.x,c=cl(p,e.lo,e.hi),d=Math.hypot(p-c,q-e.c);if(d<bd){bd=d;best={e,c}}});
  if(!best||(keep&&bd<.02))return;
  const{e,c}=best;
  if(e.a==='h'){it.x=snap(c);it.y=e.c}else{it.y=snap(c);it.x=e.c}
  it.r=e.r;
}

/* ---------- 2D plan ---------- */
function foot(t,w,h,c,r){
  const a=-w/2,b=-h/2;
  if(t==='door')return `<path d="M${a+w} 0A${w} ${w} 0 0 0 ${a} ${-w}" fill="none" stroke="rgba(0,0,0,.45)" stroke-dasharray="4 3"/><path d="M${a} 0V${-w}" stroke="${c}" stroke-width="3"/><rect x="${a}" y="${b}" width="${w}" height="${h}" fill="${c}"/>`;
  const rx=ROUND[t]?w/2:4;
  let s=`<rect x="${a}" y="${b}" width="${w}" height="${h}" rx="${rx}" fill="${c}" fill-opacity="${t==='rug'?.7:1}" stroke="rgba(0,0,0,.35)"/>`;
  if(BK[t])s+=`<rect x="${a}" y="${b}" width="${w}" height="${h*.28}" rx="${rx}" fill="rgba(0,0,0,.22)"/>`;
  if(w>=70&&t!=='window')s+=`<text transform="rotate(${-r})" text-anchor="middle" dominant-baseline="central" font-size="10" fill="#fff" style="pointer-events:none;paint-order:stroke;stroke:rgba(0,0,0,.5);stroke-width:2px">${T[t].n}</text>`;
  return s;
}
function draw(){
  const w=PL.w*S,l=PL.l*S;
  svg.setAttribute('viewBox',`0 0 ${w+P*2} ${l+P*2}`);
  let g=`<rect x="${P}" y="${P}" width="${w}" height="${l}" fill="#dbe9d2" stroke="rgba(0,0,0,.25)" stroke-dasharray="6 4"/>`;
  [...rooms].sort((a,b)=>(b.t==='garden')-(a.t==='garden')).forEach(r=>{
    const x=P+r.x*S,y=P+r.y*S,rw=r.w*S,rl=r.l*S,gd=r.t==='garden',on=sel&&sel.k==='r'&&sel.id===r.id;
    g+=`<g data-rid="${r.id}"><rect x="${x}" y="${y}" width="${rw}" height="${rl}" fill="${r.floor}" ${gd?'stroke="#4f7d3d" stroke-dasharray="5 3"':'stroke="#46534f" stroke-width="5"'}/>`+
      `<text x="${x+8}" y="${y+16}" font-size="12" font-weight="600" fill="rgba(0,0,0,.6)" style="pointer-events:none">${RT[r.t].n}</text>`+
      `<text x="${x+8}" y="${y+30}" font-size="10" fill="rgba(0,0,0,.5)" style="pointer-events:none">${r.w} × ${r.l} m</text></g>`;
    if(on)g+=`<rect x="${x-3}" y="${y-3}" width="${rw+6}" height="${rl+6}" fill="none" stroke="var(--acc)" stroke-width="2.5" stroke-dasharray="6 3" pointer-events="none"/><circle data-h="1" cx="${x+rw}" cy="${y+rl}" r="9" fill="var(--acc)" stroke="#fff" stroke-width="2" style="cursor:nwse-resize"/>`;
  });
  [...items].sort((a,b)=>(b.t==='rug')-(a.t==='rug')).forEach(it=>{
    const d=T[it.t];if(!d)return;
    const iw=d.w*S,ih=d.h*S,on=sel&&sel.k==='i'&&sel.id===it.id;
    g+=`<g data-id="${it.id}" transform="translate(${P+it.x*S} ${P+it.y*S}) rotate(${it.r})"><title>${d.n}</title>${foot(it.t,iw,ih,it.col||d.c,it.r)}`+
      (on?`<rect x="${-iw/2-3}" y="${-ih/2-3}" width="${iw+6}" height="${ih+6}" rx="5" fill="none" stroke="var(--acc)" stroke-width="2.5" stroke-dasharray="6 3" pointer-events="none"/>`:'')+`</g>`;
  });
  svg.innerHTML=g;
  const it=selItem(),r=selRoom(),ha=rooms.filter(q=>q.t!=='garden').reduce((s,q)=>s+q.w*q.l,0);
  $('area').textContent=is3?'Drag to look around. Pinch or scroll to zoom. Go back to Plan to change the layout.':`House area: ${ha.toFixed(1)} m² · ${rooms.length} rooms · ${items.length} items`;
  ['rot','dup'].forEach(k=>$(k).disabled=!it||(k==='rot'&&isW(it)));
  $('del').disabled=!sel;
  document.querySelectorAll('#cols button').forEach(b=>b.disabled=!it);
  document.querySelectorAll('#floors button').forEach(b=>{b.disabled=!r;b.classList.toggle('on',!!r&&b.dataset.c===r.floor)});
  ['rt','rw','rl'].forEach(k=>$(k).disabled=!r);
  if(r){if(document.activeElement!==$('rw'))$('rw').value=r.w;if(document.activeElement!==$('rl'))$('rl').value=r.l;$('rt').value=r.t}
  if(is3)build();
}
function pt(e){
  const q=new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());
  return{x:(q.x-P)/S,y:(q.y-P)/S};
}
svg.addEventListener('pointerdown',e=>{
  const p=pt(e);
  if(e.target.closest('[data-h]')&&selRoom()){mode='rs';st={r:selRoom()};svg.setPointerCapture(e.pointerId);return}
  const ie=e.target.closest('[data-id]'),re=e.target.closest('[data-rid]');
  if(ie){sel={k:'i',id:+ie.dataset.id};const o=selItem();mode='im';st={dx:o.x-p.x,dy:o.y-p.y}}
  else if(re){
    const r=rooms.find(q=>q.id===+re.dataset.rid);sel={k:'r',id:r.id};mode='rm';
    st={p,x:r.x,y:r.y,in:items.filter(i=>i.x>=r.x-.01&&i.x<=r.x+r.w+.01&&i.y>=r.y-.01&&i.y<=r.y+r.l+.01).map(i=>({i,x:i.x,y:i.y}))};
  }else{sel=null;mode=null;draw();return}
  svg.setPointerCapture(e.pointerId);draw();
});
svg.addEventListener('pointermove',e=>{
  if(!mode)return;
  const p=pt(e);
  if(mode==='im'){
    const it=selItem();it.x=cl(snap(p.x+st.dx),0,PL.w);it.y=cl(snap(p.y+st.dy),0,PL.l);if(isW(it))wallSnap(it);
  }else if(mode==='rm'){
    const r=selRoom(),nx=cl(Math.round((st.x+p.x-st.p.x)*2)/2,0,Math.max(0,PL.w-r.w)),ny=cl(Math.round((st.y+p.y-st.p.y)*2)/2,0,Math.max(0,PL.l-r.l));
    r.x=nx;r.y=ny;st.in.forEach(o=>{o.i.x=o.x+nx-st.x;o.i.y=o.y+ny-st.y});
  }else{
    const r=st.r;r.w=cl(Math.round((p.x-r.x)*2)/2,1.5,Math.max(1.5,PL.w-r.x));r.l=cl(Math.round((p.y-r.y)*2)/2,1.5,Math.max(1.5,PL.l-r.y));
  }
  draw();
});
const end=()=>{if(mode){if(mode==='rs')items.filter(isW).forEach(i=>wallSnap(i,true));mode=null;save();draw()}};
svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);

function addRoom(t){
  const d=RT[t],o=(rooms.length%6)*.5,r={id:nid++,t,x:cl(1+o,0,Math.max(0,PL.w-d.w)),y:cl(1+o,0,Math.max(0,PL.l-d.l)),w:Math.min(d.w,PL.w),l:Math.min(d.l,PL.l),floor:d.f,fk:d.k};
  rooms.push(r);sel={k:'r',id:r.id};save();draw();
}
function addItem(t){
  const r=selRoom(),it={id:nid++,t,x:r?r.x+r.w/2:PL.w/2,y:r?r.y+r.l/2:PL.l/2,r:0};
  it.x=snap(it.x);it.y=snap(it.y);if(isW(it))wallSnap(it);
  items.push(it);sel={k:'i',id:it.id};save();draw();
}
$('rot').onclick=()=>{const it=selItem();if(it){it.r=(it.r+90)%360;save();draw()}};
$('dup').onclick=()=>{
  const it=selItem();if(!it)return;
  const c={...it,id:nid++,x:Math.min(PL.w,it.x+.5),y:Math.min(PL.l,it.y+.5)};
  if(isW(c))wallSnap(c);items.push(c);sel={k:'i',id:c.id};save();draw();
};
function del(){
  const r=selRoom();
  if(r){items=items.filter(i=>!(i.x>=r.x-.01&&i.x<=r.x+r.w+.01&&i.y>=r.y-.01&&i.y<=r.y+r.l+.01));rooms=rooms.filter(q=>q.id!==r.id)}
  else if(sel)items=items.filter(i=>i.id!==sel.id);
  sel=null;save();draw();
}
$('del').onclick=del;
$('clr').onclick=()=>{rooms=[];items=[];sel=null;save();draw()};
$('smp').onclick=()=>{starter();$('pw').value=PL.w;$('pl').value=PL.l;save();draw()};
document.addEventListener('keydown',e=>{
  if(['INPUT','SELECT'].includes(e.target.tagName)||is3)return;
  if(e.key==='Delete'||e.key==='Backspace')del();
  if(e.key==='r'||e.key==='R')$('rot').click();
});
$('pw').value=PL.w;$('pl').value=PL.l;
[['pw','w'],['pl','l']].forEach(([id,k])=>$(id).addEventListener('input',()=>{
  const v=parseFloat($(id).value);if(!(v>=8&&v<=40))return;
  PL[k]=v;rooms.forEach(r=>{r.x=cl(r.x,0,Math.max(0,PL.w-r.w));r.y=cl(r.y,0,Math.max(0,PL.l-r.l))});save();draw();
}));
[['rw','w','w'],['rl','l','l']].forEach(([id,k])=>$(id).addEventListener('input',()=>{
  const r=selRoom(),v=parseFloat($(id).value);if(!r||!(v>=1.5))return;
  r[k]=Math.min(v,k==='w'?PL.w-r.x:PL.l-r.y);save();draw();
}));
$('rt').addEventListener('change',()=>{const r=selRoom();if(r){r.t=$('rt').value;r.floor=RT[r.t].f;r.fk=RT[r.t].k;save();draw()}});
Object.keys(RT).forEach(t=>{
  const o=document.createElement('option');o.value=t;o.textContent=RT[t].n;$('rt').appendChild(o);
  const b=document.createElement('button');b.className='f';b.textContent='+ '+RT[t].n;b.onclick=()=>addRoom(t);$('rooms').appendChild(b);
});
function swatches(box,list,fn){
  list.forEach(x=>{
    const b=document.createElement('button'),c=Array.isArray(x)?x[1]:x;
    b.className='sw';b.style.background=c;b.title=Array.isArray(x)?x[0]:'Furniture colour '+c;b.setAttribute('aria-label',b.title);
    b.dataset.c=c;b.onclick=()=>fn(x);$(box).appendChild(b);
  });
}
swatches('floors',FLOORS,x=>{const r=selRoom();if(r){r.floor=x[1];r.fk=x[2];save();draw()}});
swatches('walls',WALLS,x=>{WALL=x[1];document.querySelectorAll('#walls .sw').forEach(b=>b.classList.toggle('on',b.dataset.c===WALL));save();draw()});
swatches('cols',ICOLS,c=>{const it=selItem();if(it){it.col=c;save();draw()}});
document.querySelectorAll('#walls .sw').forEach(b=>b.classList.toggle('on',b.dataset.c===WALL));
[...new Set(Object.values(T).map(d=>d.g))].forEach(gr=>{
  const h=document.createElement('h3');h.textContent=gr;$('furn').appendChild(h);
  const row=document.createElement('div');row.className='row';
  Object.keys(T).filter(t=>T[t].g===gr).forEach(t=>{
    const b=document.createElement('button');b.className='f';b.textContent=T[t].n;b.onclick=()=>addItem(t);row.appendChild(b);
  });
  $('furn').appendChild(row);
});

/* ---------- 3D view ---------- */
let scene,cam,renderer,controls,room,sun,first=true;
const MC={};
const mat=(c,r=.7,m=0)=>{const k=c+r+m;return MC[k]||(MC[k]=new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m}))};
const lite=(c,t)=>'#'+new THREE.Color(c).lerp(new THREE.Color('#ffffff'),t).getHexString();
const GL=()=>new THREE.MeshStandardMaterial({color:'#bfe3f2',transparent:true,opacity:.35,roughness:.05});
const mk=g=>{
  const add=(m,p)=>{m.position.set(...p);m.castShadow=m.receiveShadow=true;g.add(m);return m};
  const M=(col,r)=>col.isMaterial?col:mat(col,r);
  return{
    b:(s,col,p,r=.7)=>add(new THREE.Mesh(new THREE.BoxGeometry(...s),M(col,r)),p),
    cy:(rt,rb,h,col,p,r=.7)=>add(new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,24),M(col,r)),p),
    sp:(s,col,p,r=.9)=>{const m=add(new THREE.Mesh(new THREE.SphereGeometry(1,20,14),M(col,r)),p);m.scale.set(...s);return m}
  };
};
const WOOD='#8a6a4a',DK='#2b2f33',WH='#f4f4f1',SIL='#c0c4c8',Q=[[-1,-1],[1,-1],[-1,1],[1,1]];
function model(t,w,d,c){
  const g=new THREE.Group(),{b,cy,sp}=mk(g);
  const chair=(cw,cd,col,x,z,ry)=>{
    const h=new THREE.Group(),k=mk(h);
    k.b([cw,.06,cd],col,[0,.45,0],.9);k.b([cw,.45,.05],col,[0,.7,-cd/2+.025],.9);
    Q.forEach(([i,j])=>k.b([.04,.45,.04],DK,[i*(cw/2-.04),.225,j*(cd/2-.04)]));
    h.position.set(x,0,z);h.rotation.y=ry;g.add(h);
  };
  switch(t){
    case 'stairs':
      for(let j=0;j<12;j++){const ht=(j+1)*(typeof floorHeight==='number'?floorHeight:3)/12;b([w,ht,d/12],c,[0,ht/2,-d/2+(j+.5)*d/12]);}
      break;
    case 'sofa':case 'sofabed':case 'armchair':{
      const n=t==='armchair'?1:3,bed=t==='sofabed',aw=.18,cw=(w-aw*2)/n,sd=bed?d*.42:d-.3;
      b([w,.3,d],c,[0,.27,0],.95);b([w,.65,.2],c,[0,.45,-d/2+.1],.95);
      b([aw,.5,d],c,[-w/2+aw/2,.37,0],.95);b([aw,.5,d],c,[w/2-aw/2,.37,0],.95);
      for(let i=0;i<n;i++){const x=-w/2+aw+cw*(i+.5);
        b([cw-.02,.16,sd],c,[x,.5,-d/2+.2+sd/2],.95);
        b([cw-.02,.4,.16],c,[x,.72,-d/2+.3],.95).rotation.x=-.12;}
      if(bed)b([w-aw*2-.04,.1,d*.5-.2],'#f3efe6',[0,.5,d/2-.1-(d*.5-.2)/2],.95);
      if(t!=='armchair')sp([.22,.2,.08],'#e8dcc8',[-w/2+aw+.28,.7,-d/2+.42]);
      [-1,1].forEach(i=>b([.05,.12,.05],DK,[i*(w/2-.1),.06,d/2-.1]));break}
    case 'bed':
      b([w,.3,d],'#5b4330',[0,.2,0],.6);b([w+.06,.95,.08],'#5b4330',[0,.5,-d/2+.04],.6);
      b([w-.08,.24,d-.12],WH,[0,.47,.02],.95);b([w-.04,.12,d*.62],c,[0,.62,d/2-d*.31-.04],.95);
      b([w-.04,.14,.25],lite(c,.3),[0,.63,-d*.12],.95);
      sp([.32,.1,.2],WH,[-w*.24,.7,-d/2+.38]);sp([.32,.1,.2],WH,[w*.24,.7,-d/2+.38]);break;
    case 'coffee':
      b([w,.05,d],c,[0,.4,0],.5);b([w-.12,.01,d-.12],GL(),[0,.43,0],.1);
      Q.forEach(([i,j])=>b([.05,.38,.05],DK,[i*(w/2-.05),.19,j*(d/2-.05)]));break;
    case 'tv':
      b([w,.45,d],c,[0,.225,0],.6);b([.3,.02,.15],DK,[0,.46,-.05],.4);
      b([w*.75,.45,.04],new THREE.MeshStandardMaterial({color:'#0b0f14',roughness:.2,emissive:'#1b2a40'}),[0,.72,-.05]);break;
    case 'shelf':{
      const BC=['#c76f6f','#6d8fa6','#e3b23c','#4f9d69','#a38bb8'];
      b([.03,1.8,d],c,[-w/2+.015,.9,0],.6);b([.03,1.8,d],c,[w/2-.015,.9,0],.6);b([w,1.8,.02],c,[0,.9,-d/2+.01],.6);
      for(let i=0;i<5;i++){const y=.02+i*.44;b([w-.06,.025,d],c,[0,y,0],.6);
        if(i<4){let x=-w/2+.05,j=0;while(x<w/2-.12){const bw=.03+((j*7+i*3)%4)*.012,bh=.2+((j*5+i)%4)*.05;
          b([bw,bh,d*.7],BC[(j+i)%5],[x+bw/2,y+.0125+bh/2,0],.8);x+=bw+.004;j++}}}
      break}
    case 'rug':
      b([w,.02,d],lite(c,.35),[0,.03,0],1);b([w-.16,.022,d-.16],c,[0,.031,0],1);b([w-.4,.024,d-.4],lite(c,.2),[0,.032,0],1);break;
    case 'wardrobe':
      b([w,2,d],c,[0,1,0],.6);b([w+.02,.04,d+.02],c,[0,2.02,0],.6);b([.015,1.9,.01],'#222',[0,1,d/2+.005]);
      [-1,1].forEach(i=>b([.02,.25,.03],SIL,[i*.06,1,d/2+.015],.3));break;
    case 'desk':
      b([w,.04,d],c,[0,.74,0],.5);Q.forEach(([i,j])=>b([.05,.72,.05],DK,[i*(w/2-.05),.36,j*(d/2-.05)]));
      b([.34,.015,.23],'#b9bec3',[-.1,.7675,.02],.3);b([.34,.22,.01],DK,[-.1,.87,-.08],.3).rotation.x=-.25;
      cy(.04,.04,.09,'#fff',[w*.3,.805,.05]);break;
    case 'chair':chair(w,d,c,0,0,0);break;
    case 'dining':{
      const tw=w*.62,td=d*.5;
      b([tw,.05,td],c,[0,.75,0],.5);Q.forEach(([i,j])=>b([.06,.73,.06],DK,[i*(tw/2-.06),.365,j*(td/2-.06)]));
      [-1,1].forEach(i=>{chair(.45,.45,'#4a4f57',i*w*.17,-(td/2+.15),0);chair(.45,.45,'#4a4f57',i*w*.17,td/2+.15,Math.PI)});
      cy(.1,.08,.03,'#fff',[0,.785,0],.3);break}
    case 'fridge':
      b([w,1.75,d],c,[0,.875,0],.4);b([w,.012,.01],'#999',[0,1.2,d/2+.005]);
      b([.025,.5,.03],SIL,[w/2-.08,1.45,d/2+.02],.3);b([.025,.35,.03],SIL,[w/2-.08,.85,d/2+.02],.3);break;
    case 'stove':
      b([w,.9,d],c,[0,.45,0],.4);b([w-.02,.02,d-.02],DK,[0,.91,0],.3);
      Q.forEach(([i,j])=>cy(.07,.07,.02,'#111',[i*w*.22,.93,j*d*.22],.4));
      b([w-.08,.5,.02],'#15181b',[0,.4,d/2+.01],.2);b([w-.15,.025,.03],SIL,[0,.7,d/2+.04],.3);break;
    case 'sink':
      b([w,.85,d],'#e9e5dc',[0,.425,0],.6);b([w+.02,.04,d+.02],c,[0,.87,0],.4);
      b([w*.4,.015,d*.6],'#b8c0c6',[-w*.15,.892,0],.25);
      cy(.012,.012,.2,SIL,[-w*.15,.99,-d*.35],.2);b([.015,.015,.12],SIL,[-w*.15,1.08,-d*.29],.2);break;
    case 'basin':
      b([w,.8,d],c,[0,.4,0],.6);b([w+.02,.03,d+.02],WH,[0,.815,0],.2);b([w*.55,.012,d*.55],'#cfd6da',[0,.835,.02],.2);
      cy(.012,.012,.15,SIL,[0,.9,-d*.3],.2);b([.012,.012,.1],SIL,[0,.97,-d*.25],.2);break;
    case 'shower':
      b([w,.06,d],WH,[0,.03,0],.3);b([w,2,.02],GL(),[0,1.03,d/2-.01]);b([.02,2,d],GL(),[w/2-.01,1.03,0]);
      b([.04,2.05,.04],SIL,[w/2-.02,1.03,d/2-.02],.3);cy(.1,.1,.02,SIL,[-w/4,2,-d/2+.15],.3);b([.02,2,.02],SIL,[-w/4,1,-d/2+.05],.3);break;
    case 'bath':
      b([.07,.55,d],c,[-w/2+.035,.275,0],.2);b([.07,.55,d],c,[w/2-.035,.275,0],.2);
      b([w,.55,.07],c,[0,.275,-d/2+.035],.2);b([w,.55,.07],c,[0,.275,d/2-.035],.2);b([w,.1,d],c,[0,.05,0],.2);
      b([w-.14,.01,d-.14],'#bfe3f2',[0,.4,0],.05);cy(.015,.015,.15,SIL,[-w/2+.2,.62,-d/2+.05],.2);break;
    case 'toilet':
      b([.25,.2,.3],c,[0,.1,.03],.2);b([.38,.4,.18],c,[0,.55,-d/2+.1],.2);
      sp([.19,.2,.28],c,[0,.28,.08],.2);sp([.18,.03,.25],'#fff',[0,.46,.09],.2);break;
    case 'lamp':{
      cy(.12,.14,.03,DK,[0,.015,0],.4);cy(.012,.012,1.4,DK,[0,.72,0],.4);
      cy(.14,.2,.25,new THREE.MeshStandardMaterial({color:'#f6e7b4',emissive:'#e8b050',emissiveIntensity:.5,side:THREE.DoubleSide}),[0,1.5,0],.9);
      const pl=new THREE.PointLight(0xffd9a0,.5,4);pl.position.set(0,1.45,0);g.add(pl);break}
    case 'plant':
      cy(.17,.12,.3,'#9a6a4a',[0,.15,0],.8);
      sp([.22,.2,.22],'#3d8456',[0,.5,0]);sp([.16,.16,.16],c,[.1,.7,.05]);sp([.15,.15,.15],'#6bb882',[-.1,.65,-.05]);break;
    case 'tree':
      cy(.1,.16,1.6,'#6b4a2f',[0,.8,0],.9);sp([.8,.75,.8],'#3d8456',[0,2.1,0]);sp([.55,.55,.55],c,[.35,2.45,.15]);sp([.55,.5,.55],'#2f7048',[-.35,2,-.25]);break;
    case 'bush':
      sp([w*.5,.4,d*.5],c,[0,.35,0]);sp([w*.3,.3,d*.3],lite(c,.25),[w*.22,.45,.05]);break;
    case 'bench':
      b([w,.06,d],c,[0,.45,0],.7);b([w,.4,.05],c,[0,.7,-d/2+.025],.7);[-1,1].forEach(i=>b([.06,.45,d],DK,[i*(w/2-.1),.225,0]));break;
    case 'flower':{
      b([w,.18,d],'#5b4330',[0,.09,0],.95);const FC=[c,'#f2c14e','#ffffff','#b07cc6'];
      for(let i=0;i<16;i++)sp([.07,.07,.07],FC[i%4],[((i*37)%10/10-.5)*(w-.2),.25,((i*53)%10/10-.5)*(d-.2)]);break}
    case 'path':
      for(let i=0;i<3;i++)b([w-.1,.03,d/3-.08],c,[0,.03,-d/2+(i+.5)*d/3],.9);break;
    case 'door':
      b([w,2.05,.05],c,[0,1.025,-.04],.55);b([w-.3,.8,.01],'#98693f',[0,1.5,-.07],.55);b([w-.3,.8,.01],'#98693f',[0,.55,-.07],.55);
      b([.12,.02,.03],SIL,[w/2-.1,1,-.08],.2);b([w+.1,.05,.07],'#f2efe8',[0,2.075,-.04]);
      [-1,1].forEach(i=>b([.05,2.1,.07],'#f2efe8',[i*(w/2+.025),1.05,-.04]));break;
    case 'window':
      b([w,.05,.06],'#f2efe8',[0,.925,-.04]);b([w,.05,.06],'#f2efe8',[0,2.075,-.04]);
      [-1,1].forEach(i=>b([.05,1.2,.06],'#f2efe8',[i*(w/2-.025),1.5,-.04]));
      b([.03,1.1,.04],'#f2efe8',[0,1.5,-.04]);b([w-.1,1.1,.01],GL(),[0,1.5,-.04],.1);b([w+.1,.04,.12],'#f2efe8',[0,.9,-.08]);break;
  }
  return g;
}
function floorTex(col,fk,w,l){
  const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');
  x.fillStyle=col;x.fillRect(0,0,512,512);
  if(fk==='wood'){
    for(let r=0;r<8;r++){
      x.fillStyle=`rgba(0,0,0,${.02+((r*37)%5)*.015})`;x.fillRect(0,r*64,512,64);
      x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=2;x.beginPath();
      const o=(r*170)%512;x.moveTo(0,r*64);x.lineTo(512,r*64);
      x.moveTo(o,r*64);x.lineTo(o,r*64+64);x.moveTo((o+256)%512,r*64);x.lineTo((o+256)%512,r*64+64);x.stroke();
    }
    x.strokeStyle='rgba(0,0,0,.06)';x.lineWidth=1;
    for(let k=0;k<90;k++){const y=(k*53)%512,x1=(k*97)%512;x.beginPath();x.moveTo(x1,y);x.lineTo(x1+90,y+((k%3)-1));x.stroke()}
  }else if(fk==='tile'){
    for(let i=0;i<4;i++)for(let j=0;j<4;j++){x.fillStyle=`rgba(0,0,0,${((i*3+j*5)%4)*.012})`;x.fillRect(i*128,j*128,128,128)}
    x.strokeStyle='rgba(0,0,0,.28)';x.lineWidth=3;
    for(let i=0;i<=4;i++){x.beginPath();x.moveTo(i*128,0);x.lineTo(i*128,512);x.moveTo(0,i*128);x.lineTo(512,i*128);x.stroke()}
  }else if(fk==='grass'){
    for(let k=0;k<5000;k++){x.fillStyle=`hsla(${90+Math.random()*25},40%,${25+Math.random()*25}%,.35)`;x.fillRect(Math.random()*512,Math.random()*512,3,6)}
  }else{
    for(let k=0;k<2500;k++){x.fillStyle=`rgba(0,0,0,${Math.random()*.06})`;x.fillRect(Math.random()*512,Math.random()*512,2,2)}
  }
  const tx=new THREE.CanvasTexture(c);tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.repeat.set(w/2,l/2);
  tx.encoding=THREE.sRGBEncoding;tx.anisotropy=8;return tx;
}
function fence(r){
  const k=mk(room),FW='#f2efe8';
  const hit=(si,c)=>rooms.some(o=>{
    if(o.t==='garden')return false;
    return si<2?(Math.abs((si?o.y:o.y+o.l)-c)<.05&&o.x<r.x+r.w&&o.x+o.w>r.x):(Math.abs((si===2?o.x+o.w:o.x)-c)<.05&&o.y<r.y+r.l&&o.y+o.l>r.y);
  });
  [['h',r.y],['h',r.y+r.l],['v',r.x],['v',r.x+r.w]].forEach(([a,c],si)=>{
    if(hit(si,c))return;
    const lo=a==='h'?r.x:r.y,len=(a==='h'?r.w:r.l),mid=lo+len/2,n=Math.ceil(len/1.2);
    [.85,.5].forEach(y=>k.b(a==='h'?[len,.05,.04]:[.04,.05,len],FW,a==='h'?[mid,y,c]:[c,y,mid]));
    for(let i=0;i<=n;i++){const p=lo+len*i/n;k.b([.07,1,.07],FW,a==='h'?[p,.5,c]:[c,.5,p])}
  });
}
function init3(){
  if(renderer)return true;
  if(typeof THREE==='undefined'||!THREE.OrbitControls){$('v3').textContent='The 3D view could not load. Check your connection and reload the page.';return false}
  const el=$('v3');
  renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  el.textContent='';el.style.padding='0';el.appendChild(renderer.domElement);
  scene=new THREE.Scene();scene.background=new THREE.Color('#dfe6e3');
  cam=new THREE.PerspectiveCamera(45,1,.1,150);
  scene.add(new THREE.HemisphereLight(0xffffff,0x8a8f95,.75));
  sun=new THREE.DirectionalLight(0xfff1dd,.9);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.0005;
  scene.add(sun,sun.target);
  room=new THREE.Group();scene.add(room);
  controls=new THREE.OrbitControls(cam,renderer.domElement);
  controls.maxPolarAngle=Math.PI/2-.05;controls.minDistance=1.5;controls.maxDistance=70;
  controls.addEventListener('change',render);
  addEventListener('resize',()=>{if(is3)size()});
  return true;
}
const render=()=>renderer&&renderer.render(scene,cam);
function size(){
  const el=$('v3'),w=el.clientWidth,h=el.clientHeight;
  renderer.setSize(w,h);cam.aspect=w/h;cam.updateProjectionMatrix();render();
}
function build(){
  if(!renderer)return;
  room.traverse(n=>{if(n.geometry)n.geometry.dispose()});room.clear();
  const m=Math.max(PL.w,PL.l);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(PL.w,PL.l),new THREE.MeshStandardMaterial({map:floorTex('#86ad72','grass',PL.w,PL.l),roughness:1}));
  ground.rotation.x=-Math.PI/2;ground.position.set(PL.w/2,0,PL.l/2);ground.receiveShadow=true;room.add(ground);
  const wm=new THREE.MeshStandardMaterial({color:WALL,roughness:.95}),cm=mat('#d8d3c8',.9);
  rooms.forEach(r=>{
    const f=new THREE.Mesh(new THREE.PlaneGeometry(r.w,r.l),new THREE.MeshStandardMaterial({map:floorTex(r.floor,r.fk,r.w,r.l),roughness:r.fk==='tile'?.3:.75}));
    f.rotation.x=-Math.PI/2;f.position.set(r.x+r.w/2,r.t==='garden'?.012:.02,r.y+r.l/2);f.receiveShadow=true;room.add(f);
    if(r.t==='garden'){fence(r);return}
    [[r.w,r.x+r.w/2,r.y,0],[r.w,r.x+r.w/2,r.y+r.l,Math.PI],[r.l,r.x,r.y+r.l/2,Math.PI/2],[r.l,r.x+r.w,r.y+r.l/2,-Math.PI/2]].forEach(([len,x,z,ry])=>{
      const p=new THREE.Mesh(new THREE.PlaneGeometry(len,WALLH),wm);p.position.set(x,WALLH/2,z);p.rotation.y=ry;room.add(p);
      const cp=new THREE.Mesh(new THREE.BoxGeometry(len+.1,.05,.1),cm);cp.position.set(x,WALLH+.025,z);cp.rotation.y=ry;room.add(cp);
    });
  });
  items.forEach(it=>{
    const d=T[it.t];if(!d)return;
    const g=model(it.t,d.w,d.h,it.col||d.c);
    g.position.set(it.x,0,it.y);g.rotation.y=-it.r*Math.PI/180;room.add(g);
  });
  sun.position.set(PL.w*.85,14,PL.l*.1);sun.target.position.set(PL.w/2,0,PL.l/2);
  const sc=sun.shadow.camera;sc.left=sc.bottom=-m*.8;sc.right=sc.top=m*.8;sc.far=40;sc.updateProjectionMatrix();
  render();
}
function tab(v){
  is3=v===3;
  svg.style.display=is3?'none':'block';$('v3').style.display=is3?'block':'none';
  $('t2').setAttribute('aria-pressed',!is3);$('t3').setAttribute('aria-pressed',is3);
  if(is3){
    if(!init3()){draw();return}
    if(first){first=false;const m=Math.max(PL.w,PL.l);cam.position.set(PL.w/2,m*.85,PL.l+m*.6);controls.target.set(PL.w/2,.6,PL.l*.45);controls.update()}
    size();
  }
  draw();
}
$('t2').onclick=()=>tab(2);$('t3').onclick=()=>tab(3);
draw();
