/* Pure geometry used by the plan and 3D renderer. */
const PlotGeometry = (() => {
  const mix=(a,b,t)=>a+(b-a)*t;
  const curve=(a,c,b,t)=>({x:(1-t)**2*a.x+2*(1-t)*t*c.x+t*t*b.x,y:(1-t)**2*a.y+2*(1-t)*t*c.y+t*t*b.y});
  function points(vertices,steps=16){
    const out=[];
    vertices.forEach((a,i)=>{const b=vertices[(i+1)%vertices.length];out.push({x:a.x,y:a.y});if(a.c)for(let j=1;j<steps;j++)out.push(curve(a,a.c,b,j/steps));});
    return out;
  }
  const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
  const on=(p,a,b)=>Math.abs(cross(a,b,p))<1e-7&&p.x>=Math.min(a.x,b.x)-1e-7&&p.x<=Math.max(a.x,b.x)+1e-7&&p.y>=Math.min(a.y,b.y)-1e-7&&p.y<=Math.max(a.y,b.y)+1e-7;
  function contains(poly,p){
    let inside=false;
    for(let i=0,j=poly.length-1;i<poly.length;j=i++){
      const a=poly[j],b=poly[i];if(on(p,a,b))return true;
      if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)inside=!inside;
    }
    return inside;
  }
  const area=poly=>Math.abs(poly.reduce((s,p,i)=>{const q=poly[(i+1)%poly.length];return s+p.x*q.y-q.x*p.y},0))/2;
  function intersects(a,b,c,d){const x=cross(a,b,c),y=cross(a,b,d),z=cross(c,d,a),w=cross(c,d,b);return x*y<0&&z*w<0||on(c,a,b)||on(d,a,b)||on(a,c,d)||on(b,c,d);}
  function valid(vertices,w,l){
    const finite=n=>typeof n==='number'&&Number.isFinite(n);
    const validPoint=p=>p&&finite(p.x)&&finite(p.y)&&p.x>=0&&p.y>=0&&p.x<=w&&p.y<=l;
    if(!Array.isArray(vertices)||vertices.length<3||vertices.length>32||!vertices.every(p=>validPoint(p)&&(!p.c||validPoint(p.c))))return false;
    const poly=points(vertices);if(area(poly)<1)return false;
    for(let i=0;i<poly.length;i++){
      const a=poly[i],b=poly[(i+1)%poly.length];if(Math.hypot(a.x-b.x,a.y-b.y)<.001)return false;
      for(let j=i+2;j<poly.length;j++){
        if(i===0&&j===poly.length-1)continue;
        if(intersects(a,b,poly[j],poly[(j+1)%poly.length]))return false;
      }
    }
    return true;
  }
  function preset(type,w,l){
    if(type==='lshape')return [{x:0,y:0},{x:w*.6,y:0},{x:w*.6,y:l*.4},{x:w,y:l*.4},{x:w,y:l},{x:0,y:l}];
    if(type==='trapezoid')return [{x:w*.2,y:0},{x:w*.8,y:0},{x:w,y:l},{x:0,y:l}];
    if(type==='rounded')return [{x:0,y:0},{x:w*.7,y:0,c:{x:w,y:0}},{x:w,y:l*.3},{x:w,y:l},{x:0,y:l}];
    return [{x:0,y:0},{x:w,y:0},{x:w,y:l},{x:0,y:l}];
  }
  function path(v,scale=1,pad=0){
    const xy=p=>`${pad+p.x*scale} ${pad+p.y*scale}`;
    return `M${xy(v[0])}`+v.map((a,i)=>{const b=v[(i+1)%v.length];return a.c?`Q${xy(a.c)} ${xy(b)}`:`L${xy(b)}`}).join('')+'Z';
  }
  function clipRect(poly,r){
    let out=poly;
    const edges=[{inside:p=>p.x>=r.x,hit:(a,b)=>({x:r.x,y:mix(a.y,b.y,(r.x-a.x)/(b.x-a.x))})},{inside:p=>p.x<=r.x+r.w,hit:(a,b)=>({x:r.x+r.w,y:mix(a.y,b.y,(r.x+r.w-a.x)/(b.x-a.x))})},{inside:p=>p.y>=r.y,hit:(a,b)=>({x:mix(a.x,b.x,(r.y-a.y)/(b.y-a.y)),y:r.y})},{inside:p=>p.y<=r.y+r.l,hit:(a,b)=>({x:mix(a.x,b.x,(r.y+r.l-a.y)/(b.y-a.y)),y:r.y+r.l})}];
    for(const e of edges){const input=out;out=[];for(let i=0;i<input.length;i++){const a=input[i],b=input[(i+1)%input.length],ai=e.inside(a),bi=e.inside(b);if(ai)out.push(a);if(ai!==bi)out.push(e.hit(a,b));}}
    return out;
  }
  return {curve,points,contains,area,valid,preset,path,clipRect};
})();
if(typeof module!=='undefined')module.exports=PlotGeometry;
