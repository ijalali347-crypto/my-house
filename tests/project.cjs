const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const G=require('../geometry.js');
const source=fs.readFileSync(require('node:path').join(__dirname,'../designer.js'),'utf8');
const a=source.indexOf('function validateProject('),b=source.indexOf('\nfunction remember()',a);
const ctx=vm.createContext({PlotGeometry:G,RT:{office:{},living:{}},T:{desk:{},stairs:{}},isW:i=>i.t==='door'||i.t==='window'});
vm.runInContext(source.slice(a,b)+';this.check=validateProject',ctx);
const base={version:2,PL:{w:18,l:14},WALL:'#f2efe8',plot:G.preset('rounded',18,14),floors:[{rooms:[{id:1,t:'office',x:1,y:1,w:5,l:4,floor:'#bdc3c2',fk:'',hiddenWalls:['north']}],items:[{id:2,t:'stairs',x:5,y:5,r:0}],walls:[{id:3,a:{x:2,y:8},b:{x:9,y:8},c:{x:5,y:6},height:2.6,thickness:.15,colour:'#ffffff'}]}],activeFloor:0,floorHeight:3,projectType:'office'};
assert(ctx.check(base));assert(ctx.check(JSON.parse(JSON.stringify(base))));
const five=structuredClone(base);for(let i=1;i<5;i++){const f=structuredClone(base.floors[0]);[...f.rooms,...f.items,...f.walls].forEach(o=>o.id+=i*10);five.floors.push(f)};five.activeFloor=4;assert(ctx.check(five));
const six=structuredClone(five);six.floors.push({rooms:[],items:[],walls:[]});assert(!ctx.check(six));
const badId=structuredClone(base);badId.floors[0].items[0].id=1;assert(!ctx.check(badId));
const badColour=structuredClone(base);badColour.floors[0].walls[0].colour='\" onload=alert(1)';assert(!ctx.check(badColour));
const badCurve=structuredClone(base);badCurve.plot[0].c={x:100,y:100};assert(!ctx.check(badCurve));
console.log('Project JSON roundtrip, five floors, six-floor rejection, duplicate IDs and unsafe geometry/colours passed.');

