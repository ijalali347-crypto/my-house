/* Interior presentation and eye-level navigation. */
let walking=false,walkYaw=0,walkPitch=0,walkFrame=0,walkLast=0,lookDrag=null;
const held=new Set();
const interiorPresets={
 warm:{wall:'#f2efe8',floor:'#c6a374',fabric:'#c9bca8',wood:'#805d3e'},
 modern:{wall:'#e7e9e7',floor:'#b7b1a5',fabric:'#7e9194',wood:'#695649'},
 earthy:{wall:'#e5dfce',floor:'#c2996b',fabric:'#859276',wood:'#765437'}
};
function surfaceTexture(kind,colour){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
 const ctx=canvas.getContext('2d');ctx.fillStyle=colour;ctx.fillRect(0,0,128,128);
 if(kind==='fabric'){
  for(let i=0;i<128;i+=3){ctx.strokeStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,128);ctx.stroke();ctx.strokeStyle='rgba(0,0,0,.08)';ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(128,i);ctx.stroke();}
 }else{
  for(let i=0;i<40;i++){ctx.strokeStyle='rgba(52,30,12,.12)';ctx.beginPath();for(let x=0;x<=128;x+=8){const y=i*3.3+Math.sin(x*.055+i)*1.7;x?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}
 }
 const tx=new THREE.CanvasTexture(canvas);tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.repeat.set(2,2);tx.encoding=THREE.sRGBEncoding;return tx;
}
function roundedBox(w,h,d,r){
 r=Math.min(r,w/2,h/2);const s=new THREE.Shape(),x=-w/2,y=-h/2;
 s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
 const geom=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:Math.min(.015,d/5),bevelThickness:Math.min(.015,d/5),bevelSegments:2,steps:1,curveSegments:5});geom.translate(0,0,-d/2);return geom;
}
const baseInteriorModel=model;
model=function(t,w,d,c){
 const g=baseInteriorModel(t,w,d,c),k=mk(g);
 const fabric=['sofa','sofabed','armchair','bed','rug'].includes(t);
 const wood=['wardrobe','shelf','desk','coffee','dining','bench','bed'].includes(t);
 if(fabric||wood){
  const replacements=new Map();
  g.traverse(n=>{
   if(!n.isMesh||Array.isArray(n.material)||n.material.transparent)return;
   const match=n.material.color&&n.material.color.getHexString()===c.slice(1).toLowerCase();
   if(match){
    if(!replacements.has(n.material)){const m=n.material.clone();m.color.set('#ffffff');m.map=surfaceTexture(fabric?'fabric':'wood',c);m.roughness=fabric?.94:.58;replacements.set(n.material,m);}
    n.material=replacements.get(n.material);
    if(fabric&&n.geometry.type==='BoxGeometry'&&t!=='rug'){
     const p=n.geometry.parameters;n.geometry.dispose();n.geometry=roundedBox(p.width,p.height,p.depth,.045);
    }
   }
  });
 }
 if(t==='sofa'||t==='armchair'||t==='sofabed'){
  const pillowMat=new THREE.MeshStandardMaterial({map:surfaceTexture('fabric','#e6d6bc'),roughness:.95});
  [-1,1].forEach(side=>{const p=new THREE.Mesh(roundedBox(.32,.32,.12,.06),pillowMat);p.position.set(side*(w/2-.34),.69,-d/2+.38);p.rotation.z=side*.15;p.castShadow=true;g.add(p);});
 }
 if(t==='bedside'){
  k.b([w,.55,d],c,[0,.32,0],.5);[.2,.43].forEach(y=>{k.b([w-.06,.19,.025],lite(c,.12),[0,y,d/2+.01]);k.b([.12,.015,.025],SIL,[0,y,d/2+.03]);});k.cy(.08,.08,.1,'#f3eee3',[0,.645,0]);
 }else if(t==='cabinet'){
  k.b([w,.8,d],c,[0,.45,0],.5);[-1,1].forEach(i=>{k.b([w/2-.035,.7,.025],lite(c,.1),[i*w/4,.45,d/2+.01]);k.b([.02,.16,.03],SIL,[i*.05,.48,d/2+.03]);});k.b([w+.04,.04,d+.04],'#e4ddd2',[0,.87,0]);
 }else if(t==='ottoman'){
  const p=new THREE.Mesh(roundedBox(w,.4,d,.09),new THREE.MeshStandardMaterial({map:surfaceTexture('fabric',c),roughness:.95}));p.position.y=.28;p.castShadow=p.receiveShadow=true;g.add(p);k.b([w*.8,.12,d*.8],DK,[0,.06,0]);
 }else if(t==='curtains'){
  const curtainMat=new THREE.MeshStandardMaterial({map:surfaceTexture('fabric',c),roughness:1,side:THREE.DoubleSide});
  for(let side of [-1,1])for(let i=0;i<7;i++){const panel=new THREE.Mesh(roundedBox(w*.035,2.2,.09,.015),curtainMat);panel.position.set(side*(w*.35)+i*w*.025,1.2,Math.sin(i*1.4)*.06);panel.castShadow=true;g.add(panel);}k.b([w,.025,.025],DK,[0,2.34,0]);
 }else if(t==='art'){
  k.b([w, .8, .06],c,[0,1.55,0]);k.b([w-.08,.72,.015],'#e8dfce',[0,1.55,.04]);k.sp([w*.18,.22,.015],'#a77c5b',[-w*.15,1.6,.06]);k.b([w*.24,.45,.016],'#71836d',[w*.2,1.5,.06]);
 }
 return g;
};
function refreshInteriorRooms(){
 const select=$('interior-room'),previous=select.value;
 select.replaceChildren();
 const all=document.createElement('option');all.value='';all.textContent='Choose a room';select.appendChild(all);
 rooms.filter(r=>r.t!=='garden').forEach(r=>{const opt=document.createElement('option');opt.value=r.id;opt.textContent=RT[r.t].n+' ('+r.id+')';select.appendChild(opt);});
 if([...select.options].some(o=>o.value===previous))select.value=previous;
}
function setWalkCamera(){
 const direction=new THREE.Vector3(Math.sin(walkYaw)*Math.cos(walkPitch),Math.sin(walkPitch),-Math.cos(walkYaw)*Math.cos(walkPitch));
 cam.lookAt(cam.position.clone().add(direction));render();
}
function stopWalking(){
 walking=false;held.clear();lookDrag=null;cancelAnimationFrame(walkFrame);walkFrame=0;
 if(controls){controls.enabled=true;controls.target.set(cam.position.x,Math.max(.5,cam.position.y-.5),cam.position.z-2);controls.update();}
 $('walk-toggle').textContent='Walk inside';$('walk-controls').hidden=true;
}
function startWalking(){
 cancelAnimationFrame(walkFrame);held.clear();
 if(!is3)tab(3);if(!renderer)return;
 viewFloors='active';$('floor-view').value='active';build();
 const r=rooms.find(r=>r.id===Number($('interior-room').value))||rooms.find(r=>r.t!=='garden');
 let p=r?{x:r.x+r.w/2,y:r.y+r.l/2}:{x:PL.w/2,y:PL.l/2};
 if(!PlotGeometry.contains(PlotGeometry.points(plotVertices),p))p=PlotGeometry.points(plotVertices)[0];
 cam.position.set(p.x,Math.min(1.6,floorHeight-.3),p.y);cam.fov=65;cam.updateProjectionMatrix();
 controls.enabled=false;walking=true;walkYaw=0;walkPitch=0;walkLast=0;
 $('walk-toggle').textContent='Exit walkthrough';$('walk-controls').hidden=false;
 $('interior-help').textContent='Drag the view to look. Use W/A/S/D, arrow keys or movement buttons. This preview moves through walls; choose a room to jump there.';
 setWalkCamera();walkFrame=requestAnimationFrame(walkTick);
}
function walkTick(time){
 if(!walking)return;
 const dt=walkLast?Math.min((time-walkLast)/1000,.05):0;walkLast=time;
 let forward=(held.has('forward')?1:0)-(held.has('back')?1:0),side=(held.has('right')?1:0)-(held.has('left')?1:0);
 const len=Math.hypot(forward,side)||1;forward/=len;side/=len;
 const nx=cam.position.x+(Math.sin(walkYaw)*forward+Math.cos(walkYaw)*side)*dt*2;
 const nz=cam.position.z+(-Math.cos(walkYaw)*forward+Math.sin(walkYaw)*side)*dt*2;
 if(PlotGeometry.contains(PlotGeometry.points(plotVertices),{x:nx,y:nz})){cam.position.x=nx;cam.position.z=nz;}
 setWalkCamera();walkFrame=requestAnimationFrame(walkTick);
}
$('walk-toggle').onclick=()=>walking?stopWalking():startWalking();
$('interior-room').onchange=()=>{if(walking)startWalking();else if($('interior-room').value){if(!is3)tab(3);if(!renderer)return;const r=rooms.find(r=>r.id===Number($('interior-room').value));viewFloors='active';$('floor-view').value='active';build();controls.target.set(r.x+r.w/2,.8,r.y+r.l/2);cam.position.set(r.x+r.w/2,r.l*.7+2,r.y+r.l+2);controls.update();}};
const walkKeys={w:'forward',arrowup:'forward',s:'back',arrowdown:'back',a:'left',arrowleft:'left',d:'right',arrowright:'right'};
addEventListener('keydown',e=>{if(!walking||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;if(e.key==='Escape'){stopWalking();return;}const action=walkKeys[e.key.toLowerCase()];if(action){e.preventDefault();held.add(action);}});
addEventListener('keyup',e=>{const action=walkKeys[e.key.toLowerCase()];if(action)held.delete(action);});
addEventListener('blur',()=>held.clear());
document.addEventListener('visibilitychange',()=>{if(document.hidden)held.clear();});
document.querySelectorAll('[data-walk]').forEach(button=>{
 button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);held.add(button.dataset.walk);});
 ['pointerup','pointercancel','lostpointercapture'].forEach(type=>button.addEventListener(type,()=>held.delete(button.dataset.walk)));
});
$('v3').addEventListener('pointerdown',e=>{if(!walking)return;e.preventDefault();lookDrag={x:e.clientX,y:e.clientY,id:e.pointerId};$('v3').setPointerCapture(e.pointerId);});
$('v3').addEventListener('pointermove',e=>{if(!walking||!lookDrag||e.pointerId!==lookDrag.id)return;walkYaw-=(e.clientX-lookDrag.x)*.005;walkPitch=cl(walkPitch-(e.clientY-lookDrag.y)*.005,-1.1,1.1);lookDrag={x:e.clientX,y:e.clientY,id:e.pointerId};setWalkCamera();});
['pointerup','pointercancel','lostpointercapture'].forEach(type=>$('v3').addEventListener(type,()=>lookDrag=null));
const presentationTab=tab;
tab=function(v){if(walking)stopWalking();if(cam){cam.fov=45;cam.updateProjectionMatrix();}presentationTab(v);$('interior-view-controls').hidden=v!==3;};
$('t2').onclick=()=>tab(2);$('t3').onclick=()=>tab(3);
const presentationFit=fitView;
fitView=function(){if(walking)stopWalking();if(cam){cam.fov=45;cam.updateProjectionMatrix();}presentationFit();};
$('fit-view').onclick=()=>{if(!is3)tab(3);fitView();};
$('floor-select').addEventListener('change',()=>{if(walking)startWalking();});
$('floor-view').addEventListener('change',()=>{if(walking)stopWalking();});
$('full-view').onclick=async()=>{
 const stage=document.querySelector('.stage');
 try{if(!is3)tab(3);if(document.fullscreenElement)await document.exitFullscreen();else await stage.requestFullscreen();}catch{message('Full-screen is unavailable in this browser.');}
};
document.addEventListener('fullscreenchange',()=>{if(renderer&&is3)requestAnimationFrame(size);$('full-view').textContent=document.fullscreenElement?'Exit full screen':'Full screen';});
$('save-interior-image').onclick=()=>{
 if(!is3)tab(3);if(!renderer)return;
 const oldSize=renderer.getSize(new THREE.Vector2()),ratio=renderer.getPixelRatio(),aspect=cam.aspect;
 try{
  renderer.setPixelRatio(1);renderer.setSize(1920,1080,false);cam.aspect=16/9;cam.updateProjectionMatrix();render();
  const image=renderer.domElement.toDataURL('image/png'),link=document.createElement('a');link.href=image;link.download='house-interior.png';link.click();message('1920 × 1080 interior view downloaded.');
 }catch{message('Image export is unavailable. Try another browser.');}
 finally{renderer.setPixelRatio(ratio);renderer.setSize(oldSize.x,oldSize.y,false);cam.aspect=aspect;cam.updateProjectionMatrix();render();}
};
$('apply-interior-style').onclick=()=>{
 const preset=interiorPresets[$('interior-style').value];
 if(!confirm('Apply this style to room floors and furniture on the selected floor, and the building wall colour? You can undo it.'))return;
 WALL=preset.wall;rooms.filter(r=>r.t!=='garden').forEach(r=>{r.floor=preset.floor;r.fk='wood';});
 items.forEach(i=>{if(['sofa','sofabed','armchair','bed','rug','ottoman','curtains'].includes(i.t))i.col=preset.fabric;else if(['coffee','desk','dining','wardrobe','shelf','bedside','cabinet'].includes(i.t))i.col=preset.wood;});
 save();draw();message('Interior style applied. Undo restores the previous finishes.');
};
const presentationDraw=draw;
draw=function(){presentationDraw();refreshInteriorRooms();};
draw();
