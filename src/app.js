import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const stage=$('#stage');
const state={view:'overall',pattern:'dog',action:'light',time:0,paused:false,brightness:.8,message:'HELLO, PIXEL!',cycle:12};
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.75));renderer.setClearColor(0x131a1f,0);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.4;
stage.appendChild(renderer.domElement);$('#loading').remove();
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x171e23);
const pmrem=new THREE.PMREMGenerator(renderer);const room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.04).texture;scene.environmentIntensity=.6;room.dispose();pmrem.dispose();
const camera=new THREE.PerspectiveCamera(36,1,1,6500);camera.position.set(770,380,1470);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.075;controls.target.set(0,5,0);controls.minDistance=80;controls.maxDistance=2800;controls.maxPolarAngle=Math.PI*.94;
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));const bloom=new UnrealBloomPass(new THREE.Vector2(900,700),.40,.45,.8);composer.addPass(bloom);composer.addPass(new OutputPass());
scene.add(new THREE.HemisphereLight(0xc5e7f3,0x2c231b,2.5));
function light(color,intensity,pos){const l=new THREE.DirectionalLight(color,intensity);l.position.set(...pos);scene.add(l);return l;}
light(0xd6e8ff,3.6,[150,600,800]);light(0x6cd1e7,3,[-700,150,-150]);light(0xffc183,2.2,[700,-40,300]);
const mat=(color,metal=.5,rough=.4)=>new THREE.MeshStandardMaterial({color,metalness:metal,roughness:rough});
const black=mat(0x222c31,.8,.29),railMat=mat(0x68747c,.88,.26),rubber=mat(0x101719,0,.87),baseMat=mat(0x354248,.6,.36),glassMat=mat(0x05090b,.4,.22),silver=mat(0xb3c2c7,.9,.23);
const environment=new THREE.Group(),product=new THREE.Group(),section=new THREE.Group();scene.add(environment,product,section);section.visible=false;
function box(parent,w,h,d,x,y,z,material,r=0){const g=r?new RoundedBoxGeometry(w,h,d,3,r):new THREE.BoxGeometry(w,h,d);const m=new THREE.Mesh(g,material);m.position.set(x,y,z);parent.add(m);return m;}
function pathLine(parent,pts,material,r=3){const curve=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)));const m=new THREE.Mesh(new THREE.TubeGeometry(curve,80,r,8,false),material);parent.add(m);return m;}
function panel(parent,pts,depth,z,material){const shape=new THREE.Shape();pts.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();const m=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:5,bevelThickness:4,bevelSegments:3,steps:1}),material);m.position.z=z;parent.add(m);return m;}
// Vehicle context is deliberately generic; the product's mm geometry is shared with the CAD brief.
panel(environment,[[-604,-315],[540,-315],[582,-105],[556,-75],[-565,-75]],45,-74,mat(0x222b30,.1,.75));
panel(environment,[[-555,-77],[548,-77],[466,278],[-353,303]],4,-53,new THREE.MeshPhysicalMaterial({color:0x739aa4,metalness:.15,roughness:.12,transparent:true,opacity:.14,side:THREE.DoubleSide,depthWrite:false}));
pathLine(environment,[[-564,-79,-40],[-484,124,-40],[-358,304,-40],[0,310,-40],[468,282,-40],[518,110,-40],[554,-79,-40]],black,15);
pathLine(environment,[[-548,-84,-36],[-464,127,-36],[-347,290,-36],[0,297,-36],[457,269,-36],[541,-82,-36]],silver,2);
box(environment,1105,22,84,0,-103,-35,black,8);box(environment,930,48,62,8,-218,-9,black,12);
pathLine(environment,[[-548,-152,-20],[-230,-159,-8],[140,-161,-8],[498,-150,-20]],new THREE.MeshStandardMaterial({color:0x358f99,emissive:0x277e8a,emissiveIntensity:1.2}),1.8);
box(environment,156,30,14,320,-197,31,railMat,7);box(environment,101,8,3,320,-193,39,black,3);
// Individual city lights through the glass establish night context without external assets.
const city=new THREE.Group();environment.add(city);
for(let i=0;i<48;i++){const x=-510+(i*137%1030),y=25+(i*61%230);const m=new THREE.Mesh(new THREE.CircleGeometry(2+i%4,8),new THREE.MeshBasicMaterial({color:i%3?0x82b3c1:0xe5b77a,transparent:true,opacity:.10+(i%4)*.035,depthWrite:false}));m.position.set(x,y,-85-i%5*10);city.add(m);}
function makeRail(parent,length,material=railMat){
 const g=new THREE.Group();parent.add(g);
 box(g,length,3,30,0,-76.5,0,material);box(g,length,12,3,0,-69,-13.5,material);box(g,length,12,3,0,-69,13.5,material);
 box(g,length,3,8,0,-61.5,-11,material);box(g,length,3,8,0,-61.5,11,material);
 return g;
}
makeRail(product,1120);
[-474,0,474].forEach(x=>{box(product,86,10,65,x,-83,-12,baseMat,3);box(product,80,4,61,x,-90,-12,rubber,1);box(product,70,37,8,x,-105,-40,baseMat,2);for(const off of [-28,28]){const screw=new THREE.Mesh(new THREE.CylinderGeometry(3,3,3,16),silver);screw.position.set(x+off,-77,-29);product.add(screw);}});
box(product,7,19,32,-563.5,-69,0,black,2); // fixed stop at the left end; right end is the insertion mouth
const screenGroups=[],screenMaps=[],screenLights=[];
function makeScreen(x,index){const g=new THREE.Group();g.position.x=x;product.add(g);screenGroups.push(g);
 box(g,240,120,12,0,0,0,black,2);box(g,230,115,1,0,0,6.2,glassMat,1);
 const canvas=document.createElement('canvas');canvas.width=768;canvas.height=384;const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.minFilter=THREE.LinearMipmapLinearFilter;tex.anisotropy=renderer.capabilities.getMaxAnisotropy();screenMaps.push({canvas,tex,ctx:canvas.getContext('2d')});
 const ledmat=new THREE.MeshStandardMaterial({map:tex,emissiveMap:tex,emissive:0xffffff,emissiveIntensity:1.8,roughness:.4,metalness:.05});
 const face=new THREE.Mesh(new THREE.PlaneGeometry(228,114),ledmat);face.position.z=6.8;g.add(face);screenLights.push(ledmat);
 [-76,76].forEach(sx=>{box(g,26,5,20,sx,-70,0,baseMat,1);box(g,16,10,10,sx,-62.5,0,baseMat,1);});
 [-112,112].forEach(sx=>[-52,52].forEach(sy=>{const screw=new THREE.Mesh(new THREE.CylinderGeometry(1.25,1.25,.5,12),silver);screw.rotation.x=Math.PI/2;screw.position.set(sx,sy,6.25);g.add(screw);}));
 for(let a=0;a<8;a++)box(g,1.2,38,.5,-33+a*9,0,-6.1,rubber);
 return g;
}
[-242,0,242].forEach(makeScreen);
function label(parent,text,pos,color='#becbd0',size=15){const c=document.createElement('canvas');c.width=512;c.height=96;const ctx=c.getContext('2d');ctx.font='500 34px Segoe UI, Microsoft YaHei';ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(text,256,59);const tex=new THREE.CanvasTexture(c);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));s.position.set(...pos);s.scale.set(size*5.3,size,1);parent.add(s);return s;}
function dim(parent,a,b,text,pos){const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a),new THREE.Vector3(...b)]);parent.add(new THREE.Line(geo,new THREE.LineBasicMaterial({color:0x768b95,transparent:true,opacity:.7})));label(parent,text,pos,'#a8bec8',16);}
const dimensions=new THREE.Group();product.add(dimensions);dim(dimensions,[-362,-120,30],[-122,-120,30],'240 mm',[-242,-138,30]);dim(dimensions,[-395,-60,20],[-395,60,20],'120 mm',[-441,0,20]);
// Actual open C profile and retained T shoe, magnified in the cutaway view.
makeRail(section,130,mat(0xc1894f,.7,.3));box(section,110,10,65,0,-83,-12,baseMat,2);box(section,104,4,61,0,-90,-12,rubber,1);box(section,90,37,8,0,-105,-40,baseMat,2);
box(section,90,75,12,20,-22.5,0,black);box(section,87,69,1,21.5,-22.5,6.2,glassMat);
box(section,55,5,20,37.5,-70,0,mat(0x65cdcc,.55,.3));box(section,40,10,10,45,-62.5,0,mat(0x65cdcc,.55,.3));
label(section,'屏幕模组 / 12 mm',[0,31,6],'#c6d4d9',9);label(section,'C 形滑轨',[0,-52,39],'#ffc58a',8);label(section,'安装基座',[0,-117,11],'#a8bdc8',8);
dim(section,[78,-78,-15],[78,-60,-15],'18 mm',[95,-69,-15]);

const pixels=document.createElement('canvas');pixels.width=144;pixels.height=24;const px=pixels.getContext('2d',{willReadFrequently:true});
function heart(x,y,s=1,color='#ff9d54'){px.fillStyle=color;['0110110','1111111','1111111','0111110','0011100','0001000'].forEach((row,yy)=>[...row].forEach((v,xx)=>{if(v==='1')px.fillRect(x+xx*s,y+yy*s,s,s);}));}
function drawPixels(t){px.clearRect(0,0,144,24);px.fillStyle='#030606';px.fillRect(0,0,144,24);
 const rect=(x,y,w,h,color='#ffab54')=>{px.fillStyle=color;px.fillRect(Math.round(x),Math.round(y),w,h);};
 if(state.pattern==='dog'){
  for(let x=0;x<144;x++){const y=21+Math.round(Math.sin(x*.14-t*1.8));rect(x,y,1,1,'#327c84');}
  const walk=Math.floor(t*5)%2,shift=Math.round(Math.sin(t*.55)*27),x=42+shift;
  rect(x,9,31,8);rect(x+4,7,24,3);rect(x+28,5,11,12);rect(x+34,8,11,6);rect(x+30,2,4,7);rect(x+25,4,6,7,'#d7782e');rect(x+38,7,2,2,'#1b1511');rect(x+43,9,3,3,'#fff1b4');rect(x+1,16,4,4+walk);rect(x+6,19+walk,4,2);rect(x+23,16,4,5-walk);rect(x+27,19-walk,4,2);rect(x-4,6+walk,6,5);rect(x-6,2+walk*2,3,6);rect(x+28,15,11,1,'#71d3ca');
  heart(12+Math.round(Math.sin(t)*2),5,1);heart(118,8+Math.round(Math.sin(t*2)),1,'#edb16f');
 }else if(state.pattern==='heart'){
  const pulse=Math.floor(t*2)%2;for(let i=0;i<5;i++)heart(i*30-8,4-pulse,2,'#ff9470');for(let x=0;x<144;x++)if((x+Math.floor(t*8))%9<2)rect(x,21,1,1,'#5aafb6');
 }else if(state.pattern==='wave'){
  for(let x=0;x<144;x++){let y=Math.round(11+7*Math.sin(x*.10-t*2));rect(x,y,1,2,'#6ed6d2');y=Math.round(11+7*Math.sin(x*.10-t*2+2));rect(x,y,1,2,'#ffad68');}
 }else{
  px.fillStyle='#ffc17c';px.font='bold 17px monospace';px.textBaseline='top';const width=px.measureText(state.message).width;const x=144-((t*25)%(144+width));px.fillText(state.message,x,3);for(let i=0;i<144;i+=5)rect(i,22,1,1,'#3d959e');
 }
 const data=px.getImageData(0,0,144,24).data;
 screenMaps.forEach(({canvas,ctx,tex},k)=>{ctx.fillStyle='#030607';ctx.fillRect(0,0,canvas.width,canvas.height);for(let y=0;y<24;y++)for(let x=0;x<48;x++){
  const off=(y*144+x+k*48)*4,r=data[off],g=data[off+1],b=data[off+2],lit=r+g+b>70;
  if(lit){ctx.fillStyle=`rgba(${r},${g},${b},.13)`;ctx.beginPath();ctx.arc(x*16+8,y*16+8,7,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle=lit?`rgb(${r},${g},${b})`:'#1b262b';ctx.beginPath();ctx.arc(x*16+8,y*16+8,lit?3.7:2.3,0,Math.PI*2);ctx.fill();
  if(lit){ctx.fillStyle=`rgba(255,235,196,.35)`;ctx.beginPath();ctx.arc(x*16+7,y*16+7,1.1,0,Math.PI*2);ctx.fill();}
 }tex.needsUpdate=true;});
}
const cameraPresets={overall:{pos:[770,380,1470],target:[0,5,0]},section:{pos:[180,23,202],target:[0,-53,0]},close:{pos:[420,125,820],target:[0,-1,0]},slide:{pos:[1100,420,2150],target:[390,5,0]}};
let cameraTween=null;
function setCamera(name,immediate=false){const p=cameraPresets[name];const mobile=stage.clientWidth<600&&name!=='section';const dest=new THREE.Vector3(...p.pos);if(mobile)dest.sub(new THREE.Vector3(...p.target)).multiplyScalar(1.28).add(new THREE.Vector3(...p.target));if(immediate){camera.position.copy(dest);controls.target.set(...p.target);controls.update();cameraTween=null;}else cameraTween={from:camera.position.clone(),to:dest,a:controls.target.clone(),b:new THREE.Vector3(...p.target),start:performance.now()};}
controls.addEventListener('start',()=>cameraTween=null);
function setView(v){state.view=v;section.visible=v==='section';product.visible=v!=='section';environment.visible=v==='overall';dimensions.visible=v==='overall';setCamera(v);$$('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===v));$('.section-legend').hidden=v!=='section';$('#view-note').innerHTML=v==='section'?'<b>滑动与限位，藏在截面里。</b><span>轨道端部剖切示意 · T 形滑块由顶部窄口保持</span>':v==='close'?'<b>每一颗像素，都在发光。</b><span>48 × 24 点阵 / 单屏 · 4.75 mm 像素间距</span>':'<b>三屏，一幅画面。</b><span>2 mm 物理接缝 · 共用 144 × 24 像素画布</span>';}
$$('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
function setAction(a){state.action=a;state.time=0;state.paused=false;updatePause();$$('[data-action]').forEach(b=>b.classList.toggle('active',b.dataset.action===a));if(a==='slide'){setView('overall');setCamera('slide');}else if(state.view==='section')setView('overall');$('#status').textContent={light:'点阵已点亮 · 当前内容循环播放',slide:'12 秒循环 · 从右端滑入，再沿轨道滑出',join:'12 秒循环 · 收拢三屏，跨屏内容同步播放'}[a];}
$$('[data-action]').forEach(b=>b.onclick=()=>setAction(b.dataset.action));
$$('[data-pattern]').forEach(b=>b.onclick=()=>{state.pattern=b.dataset.pattern;state.time=0;$$('[data-pattern]').forEach(n=>n.classList.toggle('active',n===b));$('.text-input').hidden=state.pattern!=='text';drawPixels(0);});
function updatePause(){$('#pause').textContent=state.paused?'▶':'Ⅱ';$('#pause').setAttribute('aria-label',state.paused?'播放动画':'暂停动画');}
$('#pause').onclick=()=>{state.paused=!state.paused;updatePause();};
$('#timeline').oninput=e=>{state.time=Number(e.target.value)/1000*12;drawPixels(state.time);};
$('#brightness').oninput=e=>{state.brightness=Number(e.target.value)/100;$('#brightness-value').value=e.target.value+'%';};
$('#message').oninput=e=>{state.message=e.target.value||' ';drawPixels(state.time);};
$('#reset').onclick=()=>setCamera(state.action==='slide'&&state.view==='overall'?'slide':state.view);
$('#capture').onclick=()=>{composer.render();const a=document.createElement('a');a.download=`pixel-rail-${state.view}.png`;a.href=renderer.domElement.toDataURL('image/png');a.click();};
$('#open-render').onclick=()=>$('#render-dialog').showModal();$('#close-render').onclick=()=>$('#render-dialog').close();$('#render-dialog').onclick=e=>{if(e.target===$('#render-dialog'))$('#render-dialog').close();};
const ease=x=>{x=THREE.MathUtils.clamp(x,0,1);return x*x*(3-2*x);};
function motion(t){let phase=t%12;screenGroups.forEach((g,i)=>{let offset=0;if(state.action==='slide'){const enter=ease((phase-i*.65)/2.7),leave=ease((phase-7-(2-i)*.65)/2.7);offset=(1-enter+leave)*1160;}else if(state.action==='join'){const spread=1-ease((phase-1)/3)+ease((phase-8)/3);offset=(i-1)*78*spread;}g.position.x=(i-1)*242+offset;});screenLights.forEach(m=>{m.emissiveIntensity=state.brightness*2.2*(state.action==='light'?(.2+.8*ease(phase/.9)):1);});}
function resize(){const w=stage.clientWidth,h=stage.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);composer.setSize(w,h);}
new ResizeObserver(resize).observe(stage);resize();setCamera('overall',true);drawPixels(0);let prev=performance.now(),lastPixel=-1;
function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-prev)/1000,.05);prev=now;if(!state.paused)state.time+=dt;if(cameraTween){const f=ease((now-cameraTween.start)/850);camera.position.lerpVectors(cameraTween.from,cameraTween.to,f);controls.target.lerpVectors(cameraTween.a,cameraTween.b,f);if(f>=1)cameraTween=null;}motion(state.time);if(Math.floor(state.time*12)!==lastPixel){drawPixels(state.time);lastPixel=Math.floor(state.time*12);}controls.update();composer.render();$('#timeline').value=((state.time%12)/12*1000).toFixed(0);$('#time-label').textContent='00:'+String(Math.floor(state.time%12)).padStart(2,'0');}
requestAnimationFrame(animate);
window.pixelRail={state,setView,setAction,setCamera,camera,controls,renderer,scene,screenGroups,screenMaps,renderAt(t){state.time=t;state.paused=true;motion(t);drawPixels(t);controls.update();composer.render();},getMetrics(){return {screenCenters:screenGroups.map(g=>g.position.x),dimensions:[240,120,12],railLength:1120,pixels:[144,24],view:state.view,pattern:state.pattern,action:state.action,camera:camera.position.toArray()};}};
