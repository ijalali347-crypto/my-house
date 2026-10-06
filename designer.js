/* Multi-floor projects, editable boundaries and free wall drawing. */
const PROJECT_KEY='house-designer-project-v2';
let floors=[{rooms,items,walls:[]}],activeFloor=0,floorHeight=3,plotVertices=PlotGeometry.preset('rectangle',PL.w,PL.l),projectType='home';
let tool='select',pending=[],plotSelection=null,extraDrag=null,viewFloors='active',history=[],historyIndex=-1,lastBounds={...PL};
const deepCopy=value=>JSON.parse(JSON.stringify(value));
const currentFloor=()=>floors[activeFloor];
const selectedWall=()=>sel&&sel.k==='w'?currentFloor().walls.find(w=>w.id===sel.id):null;
function message(text){$('app-status').textContent=text;}
function syncFloor(){currentFloor().rooms=rooms;currentFloor().items=items;}
function projectData(){syncFloor();return {version:2,PL:{...PL},WALL,plot:deepCopy(plotVertices),floors:deepCopy(floors),activeFloor,floorHeight,projectType};}
function nextId(){nid=Math.max(0,...floors.flatMap(f=>[...f.rooms,...f.items,...f.walls].map(o=>o.id)))+1;}
function loadProject(data){
  PL={...data.PL};WALL=data.WALL;plotVertices=deepCopy(data.plot);floors=deepCopy(data.floors);activeFloor=data.activeFloor||0;floorHeight=data.floorHeight;projectType=data.projectType||'home';
  rooms=currentFloor().rooms;items=currentFloor().items;sel=null;mode=null;extraDrag=null;pending=[];plotSelection=null;lastBounds={...PL};nextId();
  $('pw').value=PL.w;$('pl').value=PL.l;$('floor-height').value=floorHeight;$('project-type').value=projectType;$('plot-shape').value='custom';
}
function validateProject(s){
  const number=n=>typeof n==='number'&&Number.isFinite(n);
  const hex=c=>typeof c==='string'&&/^#[0-9a-f]{6}$/i.test(c);
  if(!s||s.version!==2||!s.PL||!number(s.PL.w)||!number(s.PL.l)||s.PL.w<8||s.PL.w>40||s.PL.l<8||s.PL.l>40||!hex(s.WALL)||!number(s.floorHeight)||s.floorHeight<2.4||s.floorHeight>5||!['home','office','blank'].includes(s.projectType)||!Array.isArray(s.floors)||s.floors.length<1||s.floors.length>5||!Number.isInteger(s.activeFloor)||s.activeFloor<0||s.activeFloor>=s.floors.length||!PlotGeometry.valid(s.plot,s.PL.w,s.PL.l))return false;
  const ids=new Set(),id=o=>Number.isSafeInteger(o.id)&&o.id>0&&!ids.has(o.id)&&!!ids.add(o.id);
  const point=p=>p&&number(p.x)&&number(p.y)&&p.x>=0&&p.y>=0&&p.x<=s.PL.w&&p.y<=s.PL.l;
  return s.floors.every(f=>f&&Array.isArray(f.rooms)&&Array.isArray(f.items)&&Array.isArray(f.walls)&&f.rooms.length<=200&&f.items.length<=1000&&f.walls.length<=300&&
    f.rooms.every(r=>r&&id(r)&&Object.hasOwn(RT,r.t)&&['x','y','w','l'].every(k=>number(r[k]))&&r.x>=0&&r.y>=0&&r.w>=1.5&&r.l>=1.5&&r.x+r.w<=s.PL.w+.001&&r.y+r.l<=s.PL.l+.001&&hex(r.floor)&&['wood','tile','grass',''].includes(r.fk)&&(!r.hiddenWalls||Array.isArray(r.hiddenWalls)&&r.hiddenWalls.every(k=>['north','east','south','west'].includes(k))))&&
    f.items.every(i=>i&&id(i)&&Object.hasOwn(T,i.t)&&point(i)&&number(i.r)&&(isW(i)?i.r>=0&&i.r<360:[0,90,180,270].includes(i.r))&&(i.col==null||hex(i.col)))&&
    f.walls.every(w=>w&&id(w)&&point(w.a)&&point(w.b)&&(!w.c||point(w.c))&&number(w.height)&&w.height>=.3&&w.height<=5&&number(w.thickness)&&w.thickness>=.05&&w.thickness<=.6&&hex(w.colour)&&Math.hypot(w.b.x-w.a.x,w.b.y-w.a.y)>=.1));
}
function remember(){
  const state=JSON.stringify(projectData());if(history[historyIndex]===state)return;
  history=history.slice(0,historyIndex+1);history.push(state);if(history.length>35)history.shift();historyIndex=history.length-1;
}
function persist(){try{localStorage.setItem(PROJECT_KEY,JSON.stringify(projectData()));}catch{message('Browser storage is full. Download your design to keep a backup.');}}
const legacySave=save;
save=function(){
  if(PL.w!==lastBounds.w||PL.l!==lastBounds.l){
    const sx=PL.w/lastBounds.w,sy=PL.l/lastBounds.l;
    plotVertices.forEach(p=>{p.x*=sx;p.y*=sy;if(p.c){p.c.x*=sx;p.c.y*=sy;}});
    syncFloor();floors.forEach(f=>{
      f.rooms.forEach(r=>{r.w=Math.min(r.w,PL.w);r.l=Math.min(r.l,PL.l);r.x=cl(r.x,0,PL.w-r.w);r.y=cl(r.y,0,PL.l-r.l)});
      f.items.forEach(i=>{i.x=cl(i.x,0,PL.w);i.y=cl(i.y,0,PL.l)});
      f.walls.forEach(w=>[w.a,w.b,w.c].filter(Boolean).forEach(p=>{p.x*=sx;p.y*=sy}));
    });lastBounds={...PL};
  }
  remember();persist();
};
try{const saved=JSON.parse(localStorage.getItem(PROJECT_KEY)||'null');if(validateProject(saved))loadProject(saved);}catch{}
remember();
function restoreHistory(offset){const i=historyIndex+offset;if(i<0||i>=history.length)return;historyIndex=i;loadProject(JSON.parse(history[i]));persist();draw();}
$('undo-design').onclick=()=>restoreHistory(-1);$('redo-design').onclick=()=>restoreHistory(1);
function floorLabel(i){return i===0?'Ground floor':`Floor ${i+1}`;}
function selectFloor(i){syncFloor();activeFloor=i;rooms=currentFloor().rooms;items=currentFloor().items;sel=null;mode=null;extraDrag=null;pending=[];save();draw();if(is3)fitView();}
$('floor-select').onchange=()=>selectFloor(Number($('floor-select').value));
function addFloor(copy){
  if(floors.length>=5)return;
  syncFloor();let f={rooms:[],items:[],walls:[]};
  if(copy){f=deepCopy(currentFloor());[...f.rooms,...f.items,...f.walls].forEach(o=>o.id=nid++);}
  floors.push(f);selectFloor(floors.length-1);message(`${floorLabel(activeFloor)} added. Edit it independently from the floors below.`);
}
$('add-floor').onclick=()=>addFloor(false);$('copy-floor').onclick=()=>addFloor(true);
$('remove-floor').onclick=()=>{
  if(floors.length<=1)return;
  if(!confirm(`Remove ${floorLabel(activeFloor)} and everything on it? You can undo this.`))return;
  syncFloor();floors.splice(activeFloor,1);activeFloor=Math.min(activeFloor,floors.length-1);rooms=currentFloor().rooms;items=currentFloor().items;sel=null;save();draw();
};
$('floor-height').onchange=()=>{const h=Number($('floor-height').value);if(h>=2.4&&h<=5){floorHeight=h;save();draw();if(is3)fitView()}else $('floor-height').value=floorHeight;};
$('floor-view').onchange=()=>{viewFloors=$('floor-view').value;if(is3){build();fitView()}};
function setTool(next){tool=next;pending=[];extraDrag=null;mode=null;['select','wall','curve','plot','erase'].forEach(t=>$('tool-'+t).setAttribute('aria-pressed',String(t===tool)));if(is3)tab(2);draw();}
['select','wall','curve','plot','erase'].forEach(t=>$('tool-'+t).onclick=()=>setTool(t));
function newProject(type){
  if(!confirm('Start a new project? Download your current design first to keep a backup. You can also undo this change.'))return;
  const bounds={...PL};
  if(type==='home'){starter();floors=[{rooms,items,walls:[]}];}
  else{
    PL=bounds;rooms=[];items=[];floors=[{rooms,items,walls:[]}];
    if(type==='office'){
      PL={w:18,l:14};
      rooms=[['reception',1,1,6,4],['office',7,1,10,8],['meeting',1,5,6,4],['kitchen',1,9,4,4],['bath',5,9,2,4]].map(([t,x,y,w,l])=>({id:nid++,t,x,y,w,l,floor:RT[t].f,fk:RT[t].k}));
      items=[['sofa',3,3],['desk',5.5,2],['dining',3.5,7],['plant',1.5,1.5],['sink',2,9.5],['toilet',6,10.5],['basin',5.5,12.5],...Array.from({length:6},(_,i)=>['desk',9+(i%3)*3,3+Math.floor(i/3)*3]),...Array.from({length:6},(_,i)=>['chair',9+(i%3)*3,3.8+Math.floor(i/3)*3])].map(([t,x,y])=>({id:nid++,t,x,y,r:0}));
      floors=[{rooms,items,walls:[]}];
    }
  }
  activeFloor=0;projectType=type;floorHeight=3;plotVertices=PlotGeometry.preset('rectangle',PL.w,PL.l);lastBounds={...PL};sel=null;pending=[];plotSelection=null;nextId();
  $('pw').value=PL.w;$('pl').value=PL.l;$('plot-shape').value='rectangle';$('floor-height').value=3;setTool('select');save();draw();message('New '+(type==='blank'?'blank':type)+' project created.');
}
$('new-project').onclick=()=>newProject($('project-type').value);$('smp').onclick=()=>newProject('home');
$('clr').onclick=()=>{if(!confirm('Clear all rooms, furniture and walls on this floor? Other floors will be kept.'))return;rooms=[];items=[];currentFloor().walls=[];sel=null;pending=[];save();draw()};
$('plot-shape').onchange=()=>{const type=$('plot-shape').value;if(type!=='custom'){plotVertices=PlotGeometry.preset(type,PL.w,PL.l);plotSelection=null;save();}setTool('plot');};
function applyPlotPoint(){
  if(plotSelection==null)return;
  const v=deepCopy(plotVertices),p=v[plotSelection],q=v[(plotSelection+1)%v.length];p.x=Number($('point-x').value);p.y=Number($('point-y').value);
  if($('point-edge').value==='curve')p.c={x:Number($('point-cx').value),y:Number($('point-cy').value)};else delete p.c;
  if(PlotGeometry.valid(v,PL.w,PL.l)){plotVertices=v;save();draw();}else{message('Boundary must stay inside the plot size and cannot cross itself.');draw();}
}
['point-x','point-y','point-cx','point-cy'].forEach(id=>$(id).onchange=applyPlotPoint);
$('point-edge').onchange=()=>{
  if(plotSelection==null)return;const p=plotVertices[plotSelection],q=plotVertices[(plotSelection+1)%plotVertices.length];
  if($('point-edge').value==='curve'&&!p.c){$('point-cx').value=(p.x+q.x)/2;$('point-cy').value=(p.y+q.y)/2;}applyPlotPoint();
};
$('remove-point').onclick=()=>{if(plotSelection==null||plotVertices.length<=3)return;const v=deepCopy(plotVertices);v.splice(plotSelection,1);if(!PlotGeometry.valid(v,PL.w,PL.l)){message('This corner cannot be removed without crossing the boundary.');return;}plotVertices=v;plotSelection=null;save();draw();};
function wallSamples(w){return w.c?Array.from({length:25},(_,i)=>PlotGeometry.curve(w.a,w.c,w.b,i/24)):[w.a,w.b];}
const originalWallSnap=wallSnap;
wallSnap=function(it,keep){
  const origin={x:it.x,y:it.y};originalWallSnap(it,keep);
  let best=rooms.some(r=>r.t!=='garden')?Math.hypot(it.x-origin.x,it.y-origin.y):Infinity;
  currentFloor().walls.forEach(w=>{const points=wallSamples(w);for(let j=1;j<points.length;j++){
    const a=points[j-1],b=points[j],dx=b.x-a.x,dy=b.y-a.y,len2=dx*dx+dy*dy;if(!len2)continue;
    const t=cl(((origin.x-a.x)*dx+(origin.y-a.y)*dy)/len2,0,1),p={x:a.x+t*dx,y:a.y+t*dy},distance=Math.hypot(p.x-origin.x,p.y-origin.y);
    if(distance<best){best=distance;it.x=p.x;it.y=p.y;it.r=(Math.atan2(dy,dx)*180/Math.PI+360)%360;}
  }});
};
function withinPlotWall(w){const poly=PlotGeometry.points(plotVertices);return wallSamples(w).every(p=>PlotGeometry.contains(poly,p));}
function wallPath(w){return `M${P+w.a.x*S} ${P+w.a.y*S}`+(w.c?`Q${P+w.c.x*S} ${P+w.c.y*S} `:'L')+`${P+w.b.x*S} ${P+w.b.y*S}`;}
function applyWall(){
  const w=selectedWall();if(!w)return;
  const c=deepCopy(w);c.a={x:Number($('wall-ax').value),y:Number($('wall-ay').value)};c.b={x:Number($('wall-bx').value),y:Number($('wall-by').value)};
  if(c.c)c.c={x:Number($('wall-cx').value),y:Number($('wall-cy').value)};
  c.height=Number($('wall-height').value);c.thickness=Number($('wall-thickness').value);c.colour=$('wall-colour').value;
  if(!withinPlotWall(c)||Math.hypot(c.a.x-c.b.x,c.a.y-c.b.y)<.1||c.height<.3||c.height>5||c.thickness<.05||c.thickness>.6){message('Use a valid wall inside the plot, at least 0.1 m long.');draw();return;}
  Object.assign(w,c);save();draw();
}
['wall-ax','wall-ay','wall-bx','wall-by','wall-cx','wall-cy','wall-height','wall-thickness','wall-colour'].forEach(id=>$(id).onchange=applyWall);
const originalDelete=del;
del=function(){if(selectedWall()){currentFloor().walls=currentFloor().walls.filter(w=>w.id!==sel.id);sel=null;save();draw();}else originalDelete();};
$('del').onclick=del;
['north','east','south','west'].forEach(side=>$('room-'+side).onchange=()=>{const r=selRoom();if(!r)return;r.hiddenWalls=['north','east','south','west'].filter(k=>!$('room-'+k).checked);save();draw()});
function roomEdges(r){
  return [{a:{x:r.x,y:r.y},b:{x:r.x+r.w,y:r.y},side:'north'},{a:{x:r.x+r.w,y:r.y},b:{x:r.x+r.w,y:r.y+r.l},side:'east'},{a:{x:r.x+r.w,y:r.y+r.l},b:{x:r.x,y:r.y+r.l},side:'south'},{a:{x:r.x,y:r.y+r.l},b:{x:r.x,y:r.y},side:'west'}].filter(e=>!(r.hiddenWalls||[]).includes(e.side));
}
const originalDraw=draw;
draw=function(){
  originalDraw();
  const shape=PlotGeometry.path(plotVertices,S,P),poly=PlotGeometry.points(plotVertices);
  const base=svg.innerHTML.replace(/^<rect[^>]*\/>/,'');
  svg.innerHTML=`<defs><clipPath id="plot-clip"><path d="${shape}"/></clipPath></defs><rect x="${P}" y="${P}" width="${PL.w*S}" height="${PL.l*S}" fill="#e2e6e4"/><path d="${shape}" fill="#dbe9d2"/>`+`<g clip-path="url(#plot-clip)">${base}</g><path d="${shape}" fill="none" stroke="#4f7d3d" stroke-width="2" stroke-dasharray="6 4"/>`;
  // Replace automatic room rectangle outlines with separately removable sides.
  svg.querySelectorAll('[data-rid]').forEach(g=>{
    const r=rooms.find(r=>r.id===Number(g.dataset.rid));if(r.t==='garden')return;
    g.querySelector('rect').setAttribute('stroke','none');
    roomEdges(r).forEach(e=>g.insertAdjacentHTML('beforeend',`<path d="${wallPath(e)}" fill="none" stroke="#46534f" stroke-width="5" data-roomwall="${r.id}" data-side="${e.side}"/>`));
  });
  currentFloor().walls.forEach(w=>svg.insertAdjacentHTML('beforeend',`<path data-wall="${w.id}" d="${wallPath(w)}" fill="none" stroke="${sel&&sel.k==='w'&&sel.id===w.id?'#2f5bea':w.colour}" stroke-width="${Math.max(5,w.thickness*S)}" stroke-linecap="round"/><path data-wall="${w.id}" d="${wallPath(w)}" fill="none" stroke="transparent" stroke-width="16"/>`));
  if(pending.length){svg.insertAdjacentHTML('beforeend',pending.map(p=>`<circle cx="${P+p.x*S}" cy="${P+p.y*S}" r="6" fill="#2f5bea"/>`).join(''));}
  if(tool==='plot'){
    plotVertices.forEach((p,i)=>{
      const q=plotVertices[(i+1)%plotVertices.length];
      svg.insertAdjacentHTML('beforeend',`<path data-edge="${i}" d="${wallPath({a:p,b:q,c:p.c})}" fill="none" stroke="transparent" stroke-width="18"/><circle data-point="${i}" cx="${P+p.x*S}" cy="${P+p.y*S}" r="9" fill="${plotSelection===i?'#ea8739':'#2f5bea'}" stroke="white" stroke-width="2"/><text x="${P+p.x*S}" y="${P+p.y*S+4}" text-anchor="middle" font-size="11" fill="white" pointer-events="none">${i+1}</text>`);
      const mid=p.c?PlotGeometry.curve(p,p.c,q,.5):{x:(p.x+q.x)/2,y:(p.y+q.y)/2},length=wallSamples({a:p,b:q,c:p.c}).reduce((s,a,j,v)=>j?s+Math.hypot(a.x-v[j-1].x,a.y-v[j-1].y):0,0);
      svg.insertAdjacentHTML('beforeend',`<text x="${P+mid.x*S}" y="${P+mid.y*S-10}" text-anchor="middle" font-size="11" fill="#294840" pointer-events="none" style="paint-order:stroke;stroke:white;stroke-width:3">${length.toFixed(2)} m</text>`);
      if(p.c)svg.insertAdjacentHTML('beforeend',`<circle data-bend="${i}" cx="${P+p.c.x*S}" cy="${P+p.c.y*S}" r="8" fill="#eaa739" stroke="white" stroke-width="2"/>`);
    });
  }
  $('undo-design').disabled=historyIndex<=0;$('redo-design').disabled=historyIndex>=history.length-1;
  $('floor-select').innerHTML=floors.map((f,i)=>`<option value="${i}">${floorLabel(i)}</option>`).join('');$('floor-select').value=activeFloor;
  $('add-floor').disabled=$('copy-floor').disabled=floors.length>=5;$('remove-floor').disabled=floors.length<=1;
  const wall=selectedWall(),r=selRoom();$('wall-editor').hidden=!wall;$('room-wall-controls').hidden=!r||r.t==='garden';
  if(r)['north','east','south','west'].forEach(k=>$('room-'+k).checked=!(r.hiddenWalls||[]).includes(k));
  if(wall){['a','b','c'].forEach(k=>{if(wall[k])['x','y'].forEach(axis=>$('wall-'+k+axis).value=wall[k][axis])});$('wall-curve-fields').hidden=!wall.c;$('wall-height').value=wall.height;$('wall-thickness').value=wall.thickness;$('wall-colour').value=wall.colour;}
  $('plot-point-editor').hidden=tool!=='plot'||plotSelection==null;
  if(tool==='plot'&&plotSelection!=null){const p=plotVertices[plotSelection],q=plotVertices[(plotSelection+1)%plotVertices.length];$('point-x').value=p.x;$('point-y').value=p.y;$('point-edge').value=p.c?'curve':'line';$('curve-point-fields').hidden=!p.c;$('point-cx').value=p.c?p.c.x:(p.x+q.x)/2;$('point-cy').value=p.c?p.c.y:(p.y+q.y)/2;$('remove-point').disabled=plotVertices.length<=3;}
  const tips={select:'Select or drag a room or furniture. Tap a custom wall to edit its endpoints. Toggle individual room walls in Selected.',wall:pending.length?'Tap the end point for this wall.':'Tap the start point for a straight wall.',curve:pending.length===0?'Tap the start point for a curved wall.':pending.length===1?'Tap the end point.':'Tap a bend point to shape the curve.',plot:'Drag numbered corners and yellow curve handles. Tap an edge to add a corner. Edit exact coordinates in Plot boundary.',erase:'Tap furniture, a custom wall, a room wall, or a room to remove it. Use Undo to restore it.'};
  $('tool-help').textContent=is3?'Drag to orbit and scroll or pinch to zoom. Use 3D display to show one floor, the whole building or separated floors.':tips[tool];
  document.querySelector('.stage .tools').hidden=is3;
  const outside=rooms.filter(r=>![[r.x,r.y],[r.x+r.w,r.y],[r.x,r.y+r.l],[r.x+r.w,r.y+r.l]].every(([x,y])=>PlotGeometry.contains(poly,{x,y}))).length+items.filter(i=>!PlotGeometry.contains(poly,i)).length;
  $('area').textContent=`${floorLabel(activeFloor)} · Plot ${PlotGeometry.area(poly).toFixed(1)} m² · ${rooms.length} rooms · ${items.length} items · ${currentFloor().walls.length} custom walls`+(outside?` · ${outside} elements cross the boundary; move or resize them.`:'')+(is3?' · Drag to orbit, scroll to zoom.':'');
};
svg.addEventListener('pointerdown',e=>{
  if(tool==='select'){
    const hit=e.target.closest('[data-wall]');if(!hit)return;
    e.stopImmediatePropagation();sel={k:'w',id:Number(hit.dataset.wall)};mode=null;draw();return;
  }
  e.stopImmediatePropagation();e.preventDefault();
  const p0=pt(e),p={x:cl(snap(p0.x),0,PL.w),y:cl(snap(p0.y),0,PL.l)};
  if(tool==='wall'||tool==='curve'){
    if(!PlotGeometry.contains(PlotGeometry.points(plotVertices),p)){message('Draw inside your plot boundary.');return;}
    pending.push(p);
    if(pending.length===(tool==='wall'?2:3)){
      const w={id:nid++,a:pending[0],b:pending[1],height:Number($('wall-height').value),thickness:Number($('wall-thickness').value),colour:$('wall-colour').value};if(tool==='curve')w.c=pending[2];
      if(Math.hypot(w.a.x-w.b.x,w.a.y-w.b.y)<.1||!withinPlotWall(w)||w.height<.3||w.height>5||w.thickness<.05||w.thickness>.6){message('Use different endpoints and keep the whole wall inside the plot.');pending=[];draw();return;}
      currentFloor().walls.push(w);sel={k:'w',id:w.id};pending=[];save();
    }draw();return;
  }
  if(tool==='erase'){
    const wall=e.target.closest('[data-wall]'),edge=e.target.closest('[data-roomwall]'),item=e.target.closest('[data-id]'),r=e.target.closest('[data-rid]');
    if(wall){sel={k:'w',id:Number(wall.dataset.wall)};del();}
    else if(edge){const room=rooms.find(r=>r.id===Number(edge.dataset.roomwall));room.hiddenWalls=[...new Set([...(room.hiddenWalls||[]),edge.dataset.side])];save();draw();}
    else if(item||r){sel={k:item?'i':'r',id:Number(item?item.dataset.id:r.dataset.rid)};del();}
    return;
  }
  const node=e.target.closest('[data-point]'),bend=e.target.closest('[data-bend]'),edge=e.target.closest('[data-edge]');
  if(node||bend){plotSelection=Number(node?node.dataset.point:bend.dataset.bend);extraDrag={kind:bend?'bend':'point',index:plotSelection,before:deepCopy(plotVertices)};svg.setPointerCapture(e.pointerId);draw();}
  else if(edge){
    if(plotVertices.length>=32){message('Maximum 32 corners.');return;}
    const i=Number(edge.dataset.edge),v=deepCopy(plotVertices);delete v[i].c;v.splice(i+1,0,p);
    if(PlotGeometry.valid(v,PL.w,PL.l)){plotVertices=v;plotSelection=i+1;save();draw();}else message('Choose an edge point that does not cross the boundary.');
  }
},true);
svg.addEventListener('pointermove',e=>{
  if(!extraDrag)return;e.stopImmediatePropagation();const p=pt(e),v=deepCopy(plotVertices),n=v[extraDrag.index],q={x:cl(snap(p.x),0,PL.w),y:cl(snap(p.y),0,PL.l)};
  if(extraDrag.kind==='bend')n.c=q;else {n.x=q.x;n.y=q.y;}
  if(PlotGeometry.valid(v,PL.w,PL.l)){plotVertices=v;draw();}
},true);
svg.addEventListener('pointerup',e=>{if(extraDrag){e.stopImmediatePropagation();extraDrag=null;save();draw();}},true);
svg.addEventListener('pointercancel',()=>{if(extraDrag){plotVertices=extraDrag.before;extraDrag=null;draw();}},true);
document.addEventListener('keydown',e=>{if(['INPUT','SELECT'].includes(e.target.tagName))return;if(e.key==='Escape'){pending=[];extraDrag=null;setTool('select')}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();restoreHistory(e.shiftKey?1:-1)}},true);
// 3D: render each level into an independent group, with plot-shaped slabs.
function fitView(){
  if(!renderer)return;const m=Math.max(PL.w,PL.l),height=viewFloors==='active'?0:(floors.length-1)*(floorHeight+(viewFloors==='exploded'?2.5:0));
  cam.position.set(PL.w*.9,m*.85+height,PL.l+m*.7);controls.target.set(PL.w/2,height*.5+.5,PL.l/2);controls.maxDistance=120;controls.update();render();
}
$('fit-view').onclick=()=>{if(!is3)tab(3);fitView()};
function slabShape(poly){const shape=new THREE.Shape();shape.moveTo(poly[0].x,-poly[0].y);poly.slice(1).forEach(p=>shape.lineTo(p.x,-p.y));shape.closePath();return shape;}
function wallMesh(group,w){
  const samples=wallSamples(w);for(let j=1;j<samples.length;j++){
    const a=samples[j-1],b=samples[j],len=Math.hypot(b.x-a.x,b.y-a.y);if(len<.001)continue;
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(len,w.height,w.thickness),mat(w.colour,.9));mesh.position.set((a.x+b.x)/2,w.height/2,(a.y+b.y)/2);mesh.rotation.y=-Math.atan2(b.y-a.y,b.x-a.x);mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);
  }
}
build=function(){
  if(!renderer)return;syncFloor();
  const ownedMaterials=new Set(),textures=new Set();room.traverse(n=>{if(n.geometry)n.geometry.dispose();const mats=Array.isArray(n.material)?n.material:[n.material];mats.filter(Boolean).forEach(m=>{if(!Object.values(MC).includes(m)){ownedMaterials.add(m);if(m.map)textures.add(m.map)}})});ownedMaterials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());room.clear();
  const poly=PlotGeometry.points(plotVertices),triangles=THREE.ShapeUtils.triangulateShape(poly.map(p=>new THREE.Vector2(p.x,p.y)),[]);
  const levels=viewFloors==='active'?[activeFloor]:floors.map((_,i)=>i);
  levels.forEach(i=>{
    const f=floors[i],group=new THREE.Group();group.name='floor-'+(i+1);group.position.y=viewFloors==='active'?0:i*(floorHeight+(viewFloors==='exploded'?2.5:0));room.add(group);
    const slab=new THREE.Mesh(new THREE.ExtrudeGeometry(slabShape(poly),{depth:.18,bevelEnabled:false}),mat(i===0?'#b0bf9e':'#c9cecc',.9));slab.rotation.x=-Math.PI/2;slab.position.y=-.18;slab.receiveShadow=true;group.add(slab);
    f.rooms.forEach(r=>{
      const texture=floorTex(r.floor,r.fk,r.w,r.l),material=new THREE.MeshStandardMaterial({map:texture,roughness:r.fk==='tile'?.3:.8,side:THREE.DoubleSide});
      let used=false;
      triangles.forEach(indices=>{
        const clipped=PlotGeometry.clipRect(indices.map(n=>poly[n]),r);if(clipped.length<3||PlotGeometry.area(clipped)<.0001)return;
        const geometry=new THREE.ShapeGeometry(slabShape(clipped));const uv=geometry.attributes.uv,pos=geometry.attributes.position;
        for(let k=0;k<uv.count;k++)uv.setXY(k,(pos.getX(k)-r.x)/r.w,(-pos.getY(k)-r.y)/r.l);
        const mesh=new THREE.Mesh(geometry,material);mesh.rotation.x=-Math.PI/2;mesh.position.y=.025;mesh.receiveShadow=true;group.add(mesh);used=true;
      });if(!used){texture.dispose();material.dispose();}
      if(r.t!=='garden')roomEdges(r).forEach(e=>{
        // Clip every wall segment against an irregular plot, including concave corners.
        const count=Math.max(1,Math.ceil(Math.hypot(e.b.x-e.a.x,e.b.y-e.a.y)*12));let start=null,last=null;
        for(let j=0;j<=count;j++){const t=j/count,p={x:e.a.x+(e.b.x-e.a.x)*t,y:e.a.y+(e.b.y-e.a.y)*t};if(PlotGeometry.contains(poly,p)){if(!start)start=p;last=p;}else if(start){wallMesh(group,{a:start,b:last,height:Math.min(WALLH,floorHeight-.2),thickness:.12,colour:WALL});start=null;}}
        if(start)wallMesh(group,{a:start,b:last,height:Math.min(WALLH,floorHeight-.2),thickness:.12,colour:WALL});
      });
    });
    f.walls.forEach(w=>wallMesh(group,w));
    f.items.forEach(it=>{if(!PlotGeometry.contains(poly,it))return;const d=T[it.t];if(!d)return;const g=model(it.t,d.w,d.h,it.col||d.c);g.position.set(it.x,.03,it.y);g.rotation.y=-it.r*Math.PI/180;group.add(g)});
  });
  const m=Math.max(PL.w,PL.l),h=floors.length*floorHeight;sun.position.set(PL.w*.85,h+14,PL.l*.1);sun.target.position.set(PL.w/2,0,PL.l/2);const sc=sun.shadow.camera;sc.left=sc.bottom=-m;sc.right=sc.top=m;sc.far=h+50;sc.updateProjectionMatrix();render();
};
const originalTab=tab;tab=function(v){pending=[];originalTab(v);if(v===3)fitView()};$('t2').onclick=()=>tab(2);$('t3').onclick=()=>tab(3);
draw();
