const canvas=document.getElementById('world'),ctx=canvas.getContext('2d');
const state=JSON.parse(localStorage.getItem('storyXVoxel')||'null')||{x:10,y:8,perception:50,contexts:0,memories:0,blocks:{wood:8,stone:12,crystal:2},calendarMode:'modern',worldDay:0};
const keys={}; let dpr=1, tile=42, selected='wood';

const transitionState={stage:0};
const transitionStages=[
 'Известная модель реальности начинает терять устойчивость.',
 'Субъект воспринимает новое как актуальное, а прежнее — как прошлую модель.',
 'Самадхи: граница между прежней и новой моделью восприятия.',
 'Переход завершён: открыта новая траектория восприятия.'
];

const memories=[
 {x:12,y:10,title:'Фрагмент: Инверсия восприятия',text:'В процессе перехода известное теряет актуальность, а новое становится реальным для субъекта.'},
 {x:18,y:8,title:'Фрагмент: Самадхи',text:'Переходное состояние между прежней и новой моделью восприятия.'},
 {x:4,y:4,title:'Фрагмент: Фройд',text:'Знание приходит к субъекту через язык, перевод и память.'},
 {x:15,y:5,title:'Фрагмент: Господин Никто',text:'Разные версии одной истории способны создавать разные модели реальности.'},
 {x:20,y:12,title:'Фрагмент: Бюро корректировки',text:'Воздействие может менять траекторию, но воздействие не равно намерение.'},
 {x:8,y:15,title:'Фрагмент: Кинодополняемость',text:'Смысл меняется, если меняется контекст восприятия.'},
 {x:22,y:17,title:'Фрагмент: Календарь',text:'Время не меняется от названия года. Меняется система, которой субъект описывает последовательность событий.'}
];

const calendarModes={
 modern:{name:'Современная эра',format:d=>'год '+(2026+Math.floor(d/365))},
 byzantine:{name:'Византийская эра',format:d=>{const y=2026+Math.floor(d/365);return 'лето '+(y+5509)+' от Сотворения мира'}},
 julian:{name:'Юлианский календарный слой',format:d=>{const y=2026+Math.floor(d/365);return 'юлианский год '+y}},
 relative:{name:'Относительное время',format:d=>'день '+(d+1)+' с начала траектории'}
};

const world=[];
function build(){for(let y=0;y<22;y++){world[y]=[];for(let x=0;x<28;x++){let edge=x===0||y===0||x===27||y===21;let n=Math.sin(x*12.7+y*8.3)*43758.5;n=n-Math.floor(n);world[y][x]=edge?'stone':n>.88?'stone':n>.74?'wood':'grass';}}}
build();

function resize(){dpr=devicePixelRatio||1;canvas.width=canvas.clientWidth*dpr;canvas.height=canvas.clientHeight*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);tile=Math.max(28,Math.min(52,canvas.clientWidth/20));draw()}
window.addEventListener('resize',resize);

function calendarText(){
 const mode=calendarModes[state.calendarMode]||calendarModes.modern;
 return mode.name+' · '+mode.format(state.worldDay);
}
function triggerTransition(){
 transitionState.stage=Math.min(transitionStages.length-1,transitionState.stage+1);
 state.perception=Math.max(0,state.perception-8);
 document.getElementById('context').textContent=transitionStages[transitionState.stage];
 document.body.classList.toggle('perception-inversion',transitionState.stage>=1);
 save();
}
function save(){localStorage.setItem('storyXVoxel',JSON.stringify(state));renderUI()}
function renderUI(){
 document.getElementById('perception').textContent=state.perception;
 document.getElementById('contexts').textContent=state.contexts;
 document.getElementById('memories').textContent=state.memories;
 document.getElementById('inventory').innerHTML=Object.entries(state.blocks).map(([k,v])=>'<div class="slot"><span>'+k+'</span><b>'+v+'</b></div>').join('');
 document.getElementById('calendar-header').textContent=calendarText();
 document.getElementById('calendar-panel').textContent=calendarText();
}
function draw(){const w=canvas.clientWidth,h=canvas.clientHeight;ctx.clearRect(0,0,w,h);const ox=w/2-state.x*tile,oy=h/2-state.y*tile;
for(let y=0;y<22;y++)for(let x=0;x<28;x++){let px=ox+x*tile,py=oy+y*tile;let t=world[y][x];ctx.fillStyle=t==='grass'?'#4d7c42':t==='wood'?'#80603d':'#666d75';ctx.fillRect(px,py,tile-1,tile-1);ctx.fillStyle='rgba(255,255,255,.06)';ctx.fillRect(px,py,tile-1,5);}
memories.forEach(m=>{let px=ox+m.x*tile+tile/2,py=oy+m.y*tile+tile/2;ctx.fillStyle='#d8b45b';ctx.fillRect(px-7,py-7,14,14);});
ctx.fillStyle='#e8edf3';ctx.fillRect(ox+state.x*tile+9,oy+state.y*tile+9,tile-19,tile-19);
ctx.strokeStyle='rgba(255,255,255,.35)';ctx.strokeRect(ox+state.x*tile,oy+state.y*tile,tile-1,tile-1);
}
function move(dx,dy){
 state.x=Math.max(1,Math.min(26,state.x+dx));state.y=Math.max(1,Math.min(20,state.y+dy));state.worldDay++;
 const m=memories.find(m=>m.x===state.x&&m.y===state.y);
 if(m){state.memories++;state.contexts++;state.perception=Math.min(100,state.perception+7);document.getElementById('context').textContent=m.title+' — '+m.text;memories.splice(memories.indexOf(m),1);if(m.title==='Фрагмент: Календарь')cycleCalendar();if(m.title==='Фрагмент: Инверсия восприятия'||m.title==='Фрагмент: Самадхи')triggerTransition();}
 save();draw();
}
function cycleCalendar(){
 const order=['modern','byzantine','julian','relative'];const i=order.indexOf(state.calendarMode);state.calendarMode=order[(i+1)%order.length];
 document.getElementById('context').textContent+=' Система календаря изменена: '+calendarText()+'.';save();
}
addEventListener('keydown',e=>{
 keys[e.key.toLowerCase()]=true;
 if(e.key.toLowerCase()==='w'||e.key==='ArrowUp')move(0,-1);if(e.key.toLowerCase()==='s'||e.key==='ArrowDown')move(0,1);if(e.key.toLowerCase()==='a'||e.key==='ArrowLeft')move(-1,0);if(e.key.toLowerCase()==='d'||e.key==='ArrowRight')move(1,0);
 if(['1','2','3'].includes(e.key))selected=['wood','stone','crystal'][+e.key-1]||'wood';
 if(e.key.toLowerCase()==='t')cycleCalendar();
});
canvas.addEventListener('click',e=>{const r=canvas.getBoundingClientRect(),ox=r.width/2-state.x*tile,oy=r.height/2-state.y*tile;const x=Math.floor((e.clientX-r.left-ox)/tile),y=Math.floor((e.clientY-r.top-oy)/tile);if(x>0&&x<27&&y>0&&y<21&&state.blocks[selected]>0){world[y][x]=selected;state.blocks[selected]--;save();draw();}});
document.getElementById('reset').onclick=()=>{localStorage.removeItem('storyXVoxel');location.reload()};
resize();renderUI();
