const canvas=document.getElementById('world'),ctx=canvas.getContext('2d');
const state=JSON.parse(localStorage.getItem('storyXVoxel')||'null')||{x:10,y:8,perception:50,contexts:0,memories:0,blocks:{wood:8,stone:12,crystal:2}};
const keys={}; let dpr=1, tile=42, selected='wood';

const memories=[
 {x:4,y:4,title:'Фрагмент: Фройд',text:'Знание приходит к субъекту через язык, перевод и память.'},
 {x:15,y:5,title:'Фрагмент: Господин Никто',text:'Разные версии одной истории способны создавать разные модели реальности.'},
 {x:20,y:12,title:'Фрагмент: Бюро корректировки',text:'Воздействие может менять траекторию, но воздействие не равно намерение.'},
 {x:8,y:15,title:'Фрагмент: Кинодополняемость',text:'Смысл меняется, если меняется контекст восприятия.'}
];
const world=[];
function build(){for(let y=0;y<22;y++){world[y]=[];for(let x=0;x<28;x++){let edge=x===0||y===0||x===27||y===21;let n=Math.sin(x*12.7+y*8.3)*43758.5; n=n-Math.floor(n); world[y][x]=edge?'stone':n>.88?'stone':n>.74?'wood':'grass';}}}
build();

function resize(){dpr=devicePixelRatio||1;canvas.width=canvas.clientWidth*dpr;canvas.height=canvas.clientHeight*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);tile=Math.max(28,Math.min(52,canvas.clientWidth/20));draw()}
window.addEventListener('resize',resize);
function save(){localStorage.setItem('storyXVoxel',JSON.stringify(state));renderUI()}
function renderUI(){document.getElementById('perception').textContent=state.perception;document.getElementById('contexts').textContent=state.contexts;document.getElementById('memories').textContent=state.memories;document.getElementById('inventory').innerHTML=Object.entries(state.blocks).map(([k,v])=>'<div class="slot"><span>'+k+'</span><b>'+v+'</b></div>').join('');}
function draw(){const w=canvas.clientWidth,h=canvas.clientHeight;ctx.clearRect(0,0,w,h);const ox=w/2-state.x*tile,oy=h/2-state.y*tile;
for(let y=0;y<22;y++)for(let x=0;x<28;x++){let px=ox+x*tile,py=oy+y*tile;let t=world[y][x];ctx.fillStyle=t==='grass'?'#4d7c42':t==='wood'?'#80603d':'#666d75';ctx.fillRect(px,py,tile-1,tile-1);ctx.fillStyle='rgba(255,255,255,.06)';ctx.fillRect(px,py,tile-1,5);}
memories.forEach(m=>{let px=ox+m.x*tile+tile/2,py=oy+m.y*tile+tile/2;ctx.fillStyle='#d8b45b';ctx.fillRect(px-7,py-7,14,14);});
ctx.fillStyle='#e8edf3';ctx.fillRect(ox+state.x*tile+9,oy+state.y*tile+9,tile-19,tile-19);
ctx.strokeStyle='rgba(255,255,255,.35)';ctx.strokeRect(ox+state.x*tile,oy+state.y*tile,tile-1,tile-1);
}
function move(dx,dy){state.x=Math.max(1,Math.min(26,state.x+dx));state.y=Math.max(1,Math.min(20,state.y+dy));const m=memories.find(m=>m.x===state.x&&m.y===state.y);if(m){state.memories++;state.contexts++;state.perception=Math.min(100,state.perception+7);document.getElementById('context').textContent=m.title+' — '+m.text;memories.splice(memories.indexOf(m),1);}save();draw();}
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(e.key.toLowerCase()==='w'||e.key==='ArrowUp')move(0,-1);if(e.key.toLowerCase()==='s'||e.key==='ArrowDown')move(0,1);if(e.key.toLowerCase()==='a'||e.key==='ArrowLeft')move(-1,0);if(e.key.toLowerCase()==='d'||e.key==='ArrowRight')move(1,0);if(['1','2','3'].includes(e.key)){selected=['wood','stone','crystal'][+e.key-1]||'wood';}});
canvas.addEventListener('click',e=>{const r=canvas.getBoundingClientRect(),ox=r.width/2-state.x*tile,oy=r.height/2-state.y*tile;x=Math.floor((e.clientX-r.left-ox)/tile);y=Math.floor((e.clientY-r.top-oy)/tile);if(x>0&&x<27&&y>0&&y<21&&state.blocks[selected]>0){world[y][x]=selected;state.blocks[selected]--;save();draw();}});
document.getElementById('reset').onclick=()=>{localStorage.removeItem('storyXVoxel');location.reload()};resize();renderUI();
