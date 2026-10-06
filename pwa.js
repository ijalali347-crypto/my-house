const statusLine = document.getElementById('app-status');
const notify = message => { statusLine.textContent = message; };
let installPrompt;
const installButton = document.getElementById('install-app');
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault(); installPrompt = event; installButton.hidden = false;
});
installButton.addEventListener('click', async () => {
  if (!installPrompt) return;
  await installPrompt.prompt(); await installPrompt.userChoice;
  installPrompt = null; installButton.hidden = true;
});
window.addEventListener('appinstalled', () => { installButton.hidden = true; notify('App installed.'); });
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => notify('Offline support is unavailable. Your design editor still works online.')));
}
window.addEventListener('offline', () => notify('You are offline. The 2D planner is available after your first visit; 3D needs its libraries to be cached.'));
window.addEventListener('online', () => notify('You are back online.'));
document.getElementById('export-design').onclick = () => {
  const blob = new Blob([JSON.stringify(projectData(),null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href=url; link.download='house-design.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url),1000); notify('Design downloaded.');
};
document.getElementById('import-design').onclick=()=>document.getElementById('design-file').click();
function validDesign(s) {
  const finite = v => typeof v==='number' && Number.isFinite(v);
  const hex = v => typeof v==='string' && /^#[0-9a-f]{6}$/i.test(v);
  if (!s || !s.PL || !finite(s.PL.w) || !finite(s.PL.l) || s.PL.w<8 || s.PL.w>40 || s.PL.l<8 || s.PL.l>40 || !hex(s.WALL) || !Array.isArray(s.rooms) || !Array.isArray(s.items) || s.rooms.length>200 || s.items.length>1000) return false;
  const ids=new Set();
  const id=o=>Number.isSafeInteger(o.id) && o.id>0 && !ids.has(o.id) && !!ids.add(o.id);
  return s.rooms.every(r=>r && id(r) && Object.hasOwn(RT,r.t) && ['x','y','w','l'].every(k=>finite(r[k])) && r.x>=0 && r.y>=0 && r.w>=1.5 && r.l>=1.5 && r.x+r.w<=s.PL.w && r.y+r.l<=s.PL.l && hex(r.floor) && ['wood','tile','grass',''].includes(r.fk)) &&
    s.items.every(i=>i && id(i) && Object.hasOwn(T,i.t) && finite(i.x) && finite(i.y) && finite(i.r) && i.x>=0 && i.y>=0 && i.x<=s.PL.w && i.y<=s.PL.l && [0,90,180,270].includes(i.r) && (i.col==null || hex(i.col)));
}
document.getElementById('design-file').onchange=async event=>{
  const file=event.target.files[0]; if (!file) return;
  try {
    if(file.size>2000000) throw new Error('File too large');
    const data=JSON.parse(await file.text());
    if (!(data.version===2?validateProject(data):validDesign(data))) throw new Error('Invalid design');
    if (!confirm('Replace your current layout with this design? Download your current design first if you want to keep it.')) return;
    if(data.version===2)loadProject(data);
    else loadProject({version:2,PL:data.PL,WALL:data.WALL,plot:PlotGeometry.preset('rectangle',data.PL.w,data.PL.l),floors:[{rooms:data.rooms,items:data.items,walls:[]}],activeFloor:0,floorHeight:3,projectType:'home'});
    save(); draw(); notify('Design opened.');
  } catch { notify('Could not open this file. Choose a valid House Designer JSON export.'); }
  finally { event.target.value=''; }
};

let refreshingForUpdate=false;
const previouslyControlled=!!navigator.serviceWorker?.controller;
if('serviceWorker' in navigator)navigator.serviceWorker.addEventListener('controllerchange',()=>{
  if(previouslyControlled&&!refreshingForUpdate){refreshingForUpdate=true;location.reload();}
});
