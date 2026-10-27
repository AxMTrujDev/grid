const K='gridIluminacaoV2';
const TYPES0=[
 {id:'par64',n:'Par 64',w:1000,c:'#d97706',s:'P64',f:'c'},
 {id:'ribalta',n:'Ribalta',w:500,c:'#7c3aed',s:'RIB',f:'bar2'},
 {id:'elip',n:'Elipsoidal',w:750,c:'#0369a1',s:'ELI',f:'c'},
 {id:'fresnel',n:'Fresnel',w:1000,c:'#15803d',s:'FRE',f:'sq'},
 {id:'pcled',n:'Par LED',w:150,c:'#db2777',s:'LED',f:'c'},
 {id:'moving',n:'Moving Head',w:300,c:'#4338ca',s:'MH',f:'sq'},
 {id:'pano',n:'Panorama',w:1000,c:'#b45309',s:'PAN',f:'bar2'},
 {id:'fumaca',n:'Máq. de fumaça',w:900,c:'#6b7280',s:'FUM',f:'sq'}
];
// Estrutura do projeto: barras G2-1…G4-5, tomadas = prefixo + dígito (ex.: 3,1 + 8 = 318)
const D8=[8,7,6,5,4,3,2,1],D10=[9,8,7,6,5,4,3,2,1,0];
const SIDE={'G3-4':1,'G3-5':2,'G4-2':3,'G4-3':4,'G4-4':5};
const GROUPS=[{g:'G2',n:3,p:2,d:()=>D8},{g:'G3',n:5,p:3,d:r=>r<=2?D8:D10},{g:'G4',n:5,p:4,d:()=>D10}];
const BARS=[];
GROUPS.forEach(G=>{for(let r=1;r<=G.n;r++){const pre=''+G.p+r,s=SIDE[G.g+'-'+r];
 BARS.push({g:G.g,id:G.g+'-'+r,s,out:G.d(r).map(d=>pre+d),
  ld:s?[5,4,3,2,1].map(i=>'LD'+s+i):[],le:s?[5,4,3,2,1].map(i=>'LE'+s+i):[]})}});
const barOf={};BARS.forEach(b=>[...b.out,...b.ld,...b.le].forEach(o=>barOf[o]=b.id));
let S,mode='place',type='par64',sel=null;
const $=id=>document.getElementById(id);
function blank(){return{items:{},off:{}}}
function load(){try{S=JSON.parse(localStorage.getItem(K))}catch(e){}
 if(!S||!S.shows)S={types:TYPES0,cur:'Espetáculo 1',shows:{'Espetáculo 1':blank()}}}
function save(){try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}}
const show=()=>S.shows[S.cur];
const T=id=>S.types.find(t=>t.id===id)||{id:id,n:'?',w:0,c:'#888',s:'?',f:'c'};
function cell(o,d){
 if(!o)return '<div></div>';
 const it=d.items[o],t=it&&T(it.t);
 return `<div class="cell ${d.off[o]?'off':''} ${sel===o?'sel':''}" data-k="${o}" title="${o}${it?' · '+t.n+(it.ch?' · canal '+it.ch:'')+(it.note?' · '+it.note:''):''}">`+
  (it?`<div class="it ${t.f==='sq'?'sq':t.f==='bar2'?'bar2':''}" style="background:${colOf(it,t)}">${t.s}</div>`:'<i class="dot"></i>')+`<span class="ol">${o}</span></div>`;
}
function render(){
 const d=show();
 $('show').innerHTML=Object.keys(S.shows).map(n=>`<option ${n===S.cur?'selected':''}>${n}</option>`).join('');
 $('pal').innerHTML=S.types.map(t=>`<button class="eq ${t.id===type?'on':''}" data-t="${t.id}"><span class="sw" style="background:${t.c}">${t.s}</span>${t.n} <span class="muted">${t.w}W</span></button>`).join('');
 let h='<div class="grp">G1 (sem tomadas)</div><div class="g1">G1</div>',cg='';
 BARS.forEach(b=>{
  if(b.g!==cg){cg=b.g;h+=`<div class="grp">${cg}</div>`}
  h+='<div class="bar">'+(b.s?b.ld.map(o=>cell(o,d)).join(''):'<div style="grid-column:span 5"></div>')+
   `<div class="bl">${b.id}</div>`+
   D10.map(x=>b.out.find(o=>o.endsWith(''+x)&&o.length===3&&+o.slice(2)===x)).map(o=>cell(o,d)).join('')+
   (b.s?b.le.map(o=>cell(o,d)).join(''):'<div style="grid-column:span 5"></div>')+'</div>';
 });
 $('plan').innerHTML=h;{const c=T(type).c;if(/^#[0-9a-f]{6}$/i.test(c))$('tc').value=c}build3();
 const cnt={},perBar={};let w=0,n=0,rows='';
 for(const k in d.items){const t=T(d.items[k].t);cnt[t.id]=(cnt[t.id]||0)+1;w+=t.w;n++;
  const b=barOf[k]||'?';perBar[b]=perBar[b]||{q:0,w:0};perBar[b].q++;perBar[b].w+=t.w;
  rows+=`<tr><td>${k}</td><td>${b}</td><td>${t.n}</td><td>${d.items[k].ch||''}</td><td>${d.items[k].g||''}</td><td>${d.items[k].note||''}</td></tr>`}
 const off=Object.keys(d.off).filter(k=>d.off[k]).length;
 $('sum').innerHTML=
  `<table><tr><th>Equipamento</th><th>Qtd</th><th>Watts</th></tr>`+Object.keys(cnt).map(i=>`<tr><td>${T(i).n}</td><td>${cnt[i]}</td><td>${cnt[i]*T(i).w}</td></tr>`).join('')+
  `<tr><th>Total</th><th>${n}</th><th>${w} W (~${(w/220).toFixed(1)} A em 220 V)</th></tr></table>`+
  (n?`<table><tr><th>Barra</th><th>Qtd</th><th>Watts</th></tr>`+BARS.map(b=>b.id).filter(b=>perBar[b]).map(b=>`<tr><td>${b}</td><td>${perBar[b].q}</td><td>${perBar[b].w}</td></tr>`).join('')+`</table>`+
  `<table><tr><th>Tomada</th><th>Barra</th><th>Equip.</th><th>Canal</th><th>Cor</th><th>Obs.</th></tr>${rows}</table>`:'<p class="muted">Nenhum equipamento colocado.</p>')+
  `<p class="muted">${off} tomada(s) bloqueada(s)</p>`;
 save();
}
$('plan').onclick=e=>{
 const c=e.target.closest('.cell');if(!c)return;
 act(c.dataset.k)};
function act(k){const d=show();
 if(mode==='place'){if(!d.off[k])d.items[k]={t:type,ch:'',g:'',note:''}}
 else if(mode==='paint'){const i=d.items[k];if(i){if(paint)i.col=paint;else delete i.col}}
 else if(mode==='erase'){delete d.items[k]}
 else if(mode==='outlet'){d.off[k]=d.off[k]?0:1;if(d.off[k])delete d.items[k]}
 else if(mode==='edit'){
  if(d.items[k]){sel=k;const i=d.items[k];$('editor').hidden=false;$('e_ch').value=i.ch||'';$('e_gel').value=i.g||'';$('e_note').value=i.note||''}
  else{sel=null;$('editor').hidden=true}
 }
 render();
};
$('e_save').onclick=()=>{const i=show().items[sel];if(!i)return;i.ch=$('e_ch').value;i.g=$('e_gel').value;i.note=$('e_note').value;render()};
$('pal').onclick=e=>{const b=e.target.closest('[data-t]');if(!b)return;type=b.dataset.t;setMode('place');render()};
function setMode(m){mode=m;document.querySelectorAll('#modes button').forEach(b=>b.classList.toggle('on',b.dataset.m===m));if(m!=='edit'){sel=null;$('editor').hidden=true}}
$('modes').onclick=e=>{const b=e.target.closest('button');if(b){setMode(b.dataset.m);render()}};
$('addType').onclick=()=>{const n=$('cn').value.trim();if(!n)return;
 const id='x'+Date.now(),cols=['#0d9488','#be123c','#65a30d','#9333ea','#ea580c'];
 S.types.push({id,n,w:+$('cw').value||0,c:cols[S.types.length%5],s:n.slice(0,3).toUpperCase(),f:'c'});
 $('cn').value='';type=id;render()};
let paint='#ef4444';
function colOf(it,t){return it.col||(it.g&&/^#/.test(it.g)?it.g:t.c)}
function renderSw(){
 const C=['#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#3b82f6','#a855f7','#ec4899','#ffffff'];
 $('sw').innerHTML=C.map(c=>`<button class="swc ${paint===c?'on':''}" data-c="${c}" style="background:${c}" title="${c}"></button>`).join('')+
  `<input type="color" id="cc" value="${/^#[0-9a-f]{6}$/i.test(paint)?paint:'#ff0000'}" title="Outra cor"><button data-c="" class="${paint===''?'on':''}">Padrão</button>`}
function setPaint(c,keep){paint=c;const i=show().items[sel];
 if(mode==='edit'&&i){if(c)i.col=c;else delete i.col}else if(mode!=='paint')setMode('paint');
 if(!keep)renderSw();render()}
$('sw').onclick=e=>{const b=e.target.closest('[data-c]');if(b)setPaint(b.dataset.c)};
$('sw').oninput=e=>{if(e.target.id==='cc')setPaint(e.target.value,1)};
$('tc').oninput=e=>{T(type).c=e.target.value;render()};
renderSw();
$('delType').onclick=()=>{
 if(S.types.length<2)return alert('Mantenha ao menos um tipo.');
 const t=T(type);let n=0;
 Object.values(S.shows).forEach(s=>{for(const k in s.items)if(s.items[k].t===type)n++});
 if(!confirm('Excluir o tipo "'+t.n+'"'+(n?' e remover '+n+' equipamento(s) já colocados em todos os espetáculos?':'?')))return;
 Object.values(S.shows).forEach(s=>{for(const k in s.items)if(s.items[k].t===type)delete s.items[k]});
 S.types=S.types.filter(x=>x.id!==type);type=S.types[0].id;render()};
$('clear').onclick=()=>{if(confirm('Remover todos os equipamentos?')){show().items={};render()}};
$('show').onchange=e=>{S.cur=e.target.value;sel=null;$('editor').hidden=true;render()};
$('newShow').onclick=()=>{const n=prompt('Nome do espetáculo:');if(!n||S.shows[n])return;S.shows[n]=blank();S.cur=n;render()};
$('dup').onclick=()=>{const n=prompt('Nome da cópia:',S.cur+' (cópia)');if(!n||S.shows[n])return;S.shows[n]=JSON.parse(JSON.stringify(show()));S.cur=n;render()};
$('delShow').onclick=()=>{if(Object.keys(S.shows).length<2)return alert('Mantenha ao menos um espetáculo.');
 if(confirm('Excluir "'+S.cur+'"?')){delete S.shows[S.cur];S.cur=Object.keys(S.shows)[0];render()}};
$('exp').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'}));a.download='iluminacao.json';a.click()};
$('imp').onclick=()=>$('file').click();
$('file').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();
 r.onload=()=>{try{const x=JSON.parse(r.result);if(x.shows&&x.types){S=x;render()}else alert('Arquivo inválido')}catch(_){alert('Arquivo inválido')}};r.readAsText(f)};
$('prt').onclick=()=>window.print();
$('theme').onclick=()=>{const r=document.documentElement;const dark=getComputedStyle(r).colorScheme==='dark';r.dataset.theme=dark?'light':'dark'};
// ===== Modelo 3D =====
let R,SC,CAM,pick=[],beams=[],view='2d';const G={},mats={},cam={th:.6,ph:1.0,r:30};
const SP=1,BZ=1.8,BY=6.5;
const CYL=()=>0,GEO={};
function M(c){return mats[c]||(mats[c]=new THREE.MeshLambertMaterial({color:c}))}
function B(c){return mats['b'+c]||(mats['b'+c]=new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.13,depthWrite:false,side:2}))}
function zpos(){const z={};let cur=0,pg='';BARS.forEach(b=>{if(pg&&b.g!==pg)cur+=1.2;z[b.id]=cur;cur+=BZ;pg=b.g});return z}
function label(t,s){const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d');x.font='bold 40px system-ui';x.textAlign='center';x.fillStyle=getComputedStyle(document.body).color;x.fillText(t,128,46);
 const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthTest:false}));sp.scale.set(3*(s||1),.75*(s||1),1);return sp}
function zone(g,a,b,h,col,txt){const len=b-a,mid=(a+b)/2;
 const f=new THREE.Mesh(new THREE.BoxGeometry(12.4,h,len),new THREE.MeshLambertMaterial({color:col,transparent:true,opacity:.35}));f.position.set(0,h/2,mid);g.add(f);
 const e=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(12.4,8,len)),new THREE.LineBasicMaterial({color:col}));e.position.set(0,4,mid);g.add(e);
 const l=label(txt,2);l.position.set(0,h+.4,mid);g.add(l)}
function outlet(g,o,x,y,z,d,side){
 const m=new THREE.Mesh(GEO.box,M(d.off[o]?0x9ca3af:0x16a34a));m.position.set(x,y,z);m.userData.k=o;g.add(m);pick.push(m);
 const it=d.items[o];if(!it)return;const t=T(it.t),col=colOf(it,t);
 const f=new THREE.Mesh(t.f==='bar2'?GEO.eb:t.f==='sq'?GEO.es:GEO.ec,M(col));
 const bm=new THREE.Mesh(GEO.cone,B(col));
 if(!side){f.position.set(x,y-.4,z);bm.position.set(x,y-.5-2.5,z)}
 else{f.position.set(x+side*.4,y,z);bm.rotation.z=side*Math.PI/2;bm.position.set(x+side*.5+side*2.5,y,z)}
 f.userData.k=o;g.add(f);pick.push(f);g.add(bm);beams.push(bm)}
function build3(){
 if(!R||view!=='3d')return;
 S.split=S.split||'G4-1';
 const d=show(),Z=zpos(),L=Z['G4-5']+BZ,c=L/2,si=Math.max(0,BARS.findIndex(b=>b.id===S.split));
 pick=[];beams=[];[G.p,G.t].forEach(g=>{while(g.children.length)g.remove(g.children[0])});
 const zs=si>0?Z[BARS[si].id]-.9:-1.5;
 zone(G.p,zs-c,L-.3-c,1,0xc2410c,'PALCO');
 if(si>0)zone(G.t,-1.5-c,zs-c,.1,0x0369a1,'PLATEIA');
 BARS.forEach((b,i)=>{const g=i>=si?G.p:G.t,z=Z[b.id]-c;
  const bar=new THREE.Mesh(GEO.cyl,M(0x888888));bar.rotation.z=Math.PI/2;bar.position.set(0,BY,z);g.add(bar);
  const lb=label(b.id);lb.position.set(-7.2,BY,z);g.add(lb);
  b.out.forEach(o=>outlet(g,o,(D10.indexOf(+o.slice(2))-4.5)*SP,BY-.1,z,d,0));
  ['ld','le'].forEach((s,j)=>b[s].forEach((o,n)=>outlet(g,o,j?5.9:-5.9,1.8+n*.9,z,d,j?-1:1)))});
 applyVis();draw()}
function applyVis(){G.p.visible=$('lp').checked;G.t.visible=$('lt').checked;beams.forEach(b=>b.visible=$('lb').checked);
 G.p.position.z=$('ls').checked?3:0;G.t.position.z=$('ls').checked?-3:0}
function draw(){if(!R)return;const t=[0,2.5,0];CAM.position.set(t[0]+cam.r*Math.sin(cam.ph)*Math.sin(cam.th),t[1]+cam.r*Math.cos(cam.ph),t[2]+cam.r*Math.sin(cam.ph)*Math.cos(cam.th));CAM.lookAt(t[0],t[1],t[2]);R.render(SC,CAM)}
function size(){const cv=$('cv'),w=cv.clientWidth,h=cv.clientHeight;R.setSize(w,h);CAM.aspect=w/h;CAM.updateProjectionMatrix();draw()}
function hit(e){const r=R.domElement.getBoundingClientRect(),rc=new THREE.Raycaster();rc.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),CAM);const h=rc.intersectObjects(pick.filter(p=>p.parent&&p.parent.visible));return h.length?h[0].object.userData.k:null}
function init3(){
 const cv=$('cv');if(typeof THREE==='undefined'){cv.textContent='Não foi possível carregar o 3D.';return}
 R=new THREE.WebGLRenderer({antialias:true,alpha:true});cv.prepend(R.domElement);SC=new THREE.Scene();CAM=new THREE.PerspectiveCamera(45,1,.1,200);
 SC.add(new THREE.AmbientLight(0xffffff,.85));const dl=new THREE.DirectionalLight(0xffffff,.5);dl.position.set(5,10,8);SC.add(dl);
 G.p=new THREE.Group();G.t=new THREE.Group();SC.add(G.p,G.t);
 GEO.box=new THREE.BoxGeometry(.24,.12,.24);GEO.cyl=new THREE.CylinderGeometry(.05,.05,12,10);GEO.ec=new THREE.CylinderGeometry(.16,.2,.4,14);GEO.eb=new THREE.BoxGeometry(1,.18,.3);GEO.es=new THREE.BoxGeometry(.35,.35,.35);GEO.cone=new THREE.ConeGeometry(1.1,5,20,1,true);
 $('dv').innerHTML=BARS.map(b=>`<option>${b.id}</option>`).join('');$('dv').value=S.split||'G4-1';
 $('dv').onchange=()=>{S.split=$('dv').value;save();build3()};
 ['lp','lt','ls','lb'].forEach(i=>$(i).onchange=()=>{applyVis();draw()});
 const pts={};let moved=0,pd=0,tip=$('tip');
 R.domElement.onpointerdown=e=>{R.domElement.setPointerCapture(e.pointerId);pts[e.pointerId]=[e.clientX,e.clientY];moved=0;pd=0};
 R.domElement.onpointermove=e=>{const p=pts[e.pointerId];
  if(!p){const k=hit(e);tip.style.display=k?'block':'none';if(k){const it=show().items[k];tip.textContent=k+(it?' · '+T(it.t).n+(it.ch?' · canal '+it.ch:''):' · livre')}return}
  const ids=Object.keys(pts);
  if(ids.length===2){const o=pts[ids.find(i=>i!=e.pointerId)],d0=Math.hypot(p[0]-o[0],p[1]-o[1]),d1=Math.hypot(e.clientX-o[0],e.clientY-o[1]);cam.r=Math.min(70,Math.max(8,cam.r*d0/(d1||1)));moved=99}
  else{const dx=e.clientX-p[0],dy=e.clientY-p[1];cam.th-=dx*.008;cam.ph=Math.min(1.5,Math.max(.1,cam.ph-dy*.008));moved+=Math.abs(dx)+Math.abs(dy)}
  pts[e.pointerId]=[e.clientX,e.clientY];draw()};
 R.domElement.onpointerup=e=>{delete pts[e.pointerId];if(moved<6){const k=hit(e);if(k)act(k)}};
 R.domElement.onpointercancel=e=>{delete pts[e.pointerId]};
 R.domElement.addEventListener('wheel',e=>{e.preventDefault();cam.r=Math.min(70,Math.max(8,cam.r*(1+e.deltaY*.001)));draw()},{passive:false});
 window.addEventListener('resize',()=>{if(view==='3d')size()})}
$('tabs').onclick=e=>{const b=e.target.closest('button');if(!b)return;view=b.dataset.v;
 document.querySelectorAll('#tabs button').forEach(x=>x.classList.toggle('on',x===b));
 $('v2').hidden=view!=='2d';$('v3').hidden=view!=='3d';
 if(view==='3d'){if(!R)init3();if(R){size();build3()}}};
load();render();
