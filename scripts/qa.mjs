import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4178');await page.waitForFunction(()=>!!window.pixelRail);await page.waitForTimeout(1600);
await page.evaluate(()=>window.pixelRail.renderAt(2));await page.screenshot({path:'dist/assets/demo-desktop.png',fullPage:true});
await page.evaluate(()=>{let a=document.createElement('a');});
const report={initial:await page.evaluate(()=>window.pixelRail.getMetrics()),checks:[]};
const check=(name,pass)=>{report.checks.push({name,pass});if(!pass)throw new Error(name);};
for(const v of ['section','close','overall']){await page.locator(`[data-view="${v}"]`).click();await page.waitForTimeout(1000);check('view '+v,await page.evaluate(v=>window.pixelRail.state.view===v,v));if(v!=='overall')await page.screenshot({path:`dist/assets/demo-${v}.png`,fullPage:true});}
for(const pattern of ['heart','wave','text','dog']){await page.locator(`[data-pattern="${pattern}"]`).click();check('pattern '+pattern,await page.evaluate(p=>window.pixelRail.state.pattern===p,pattern));}
await page.locator('[data-pattern="text"]').click();await page.locator('#message').fill('你好 PIXEL');check('text input',await page.evaluate(()=>window.pixelRail.state.message==='你好 PIXEL'));await page.locator('[data-pattern="dog"]').click();
await page.locator('[data-action="slide"]').click();await page.evaluate(()=>window.pixelRail.renderAt(0));let a=await page.evaluate(()=>window.pixelRail.getMetrics().screenCenters);await page.evaluate(()=>window.pixelRail.renderAt(5));let b=await page.evaluate(()=>window.pixelRail.getMetrics().screenCenters);check('insertion from right and assembled positions',a[0]>b[0]+800&&b.every((x,i)=>x===(i-1)*242));
await page.evaluate(()=>window.pixelRail.renderAt(11.9));let c=await page.evaluate(()=>window.pixelRail.getMetrics().screenCenters);check('extraction',c[2]>b[2]+500);
await page.locator('[data-action="join"]').click();await page.evaluate(()=>window.pixelRail.renderAt(0));a=await page.evaluate(()=>window.pixelRail.getMetrics().screenCenters);await page.evaluate(()=>window.pixelRail.renderAt(6));b=await page.evaluate(()=>window.pixelRail.getMetrics().screenCenters);check('join',a[2]-a[0]>b[2]-b[0]&&b[2]-b[0]===484);
await page.locator('[data-action="light"]').click();await page.evaluate(()=>window.pixelRail.renderAt(2));await page.locator('#pause').click();check('resume',await page.evaluate(()=>!window.pixelRail.state.paused));await page.locator('#pause').click();check('pause',await page.evaluate(()=>window.pixelRail.state.paused));
await page.locator('#brightness').fill('40');check('brightness',await page.evaluate(()=>window.pixelRail.state.brightness===.4));await page.locator('#brightness').fill('80');
await page.locator('#open-render').click();check('render dialog',await page.locator('dialog').evaluate(d=>d.open));await page.locator('#close-render').click();
await page.locator('#reset').click();await page.waitForTimeout(1000);
a=await page.evaluate(()=>window.pixelRail.camera.position.toArray());await page.mouse.move(560,450);await page.mouse.down();await page.mouse.move(640,510,{steps:10});await page.mouse.up();await page.waitForTimeout(300);b=await page.evaluate(()=>window.pixelRail.camera.position.toArray());check('orbit drag',Math.abs(a[0]-b[0])>10);
a=await page.evaluate(()=>window.pixelRail.camera.position.distanceTo(window.pixelRail.controls.target));await page.mouse.wheel(0,-200);await page.waitForTimeout(300);b=await page.evaluate(()=>window.pixelRail.camera.position.distanceTo(window.pixelRail.controls.target));check('wheel zoom',b<a);
a=await page.evaluate(()=>window.pixelRail.controls.target.toArray());await page.mouse.down({button:'right'});await page.mouse.move(690,530,{steps:5});await page.mouse.up({button:'right'});await page.waitForTimeout(300);b=await page.evaluate(()=>window.pixelRail.controls.target.toArray());check('pan',Math.abs(a[0]-b[0])>1);
await page.locator('#reset').click();await page.waitForTimeout(1000);await page.evaluate(()=>window.pixelRail.renderAt(2));
for(const v of ['overall','close','section']){await page.evaluate(v=>{window.pixelRail.setView(v);window.pixelRail.setCamera(v,true);window.pixelRail.renderAt(2);},v);await page.waitForTimeout(200);const data=await page.evaluate(()=>window.pixelRail.renderer.domElement.toDataURL('image/png'));await fs.writeFile(`dist/assets/model-${v}.png`,Buffer.from(data.split(',')[1],'base64'));}
await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{window.pixelRail.setView('overall');window.pixelRail.setCamera('overall',true);});await page.waitForTimeout(1000);check('mobile no overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));await page.screenshot({path:'dist/assets/demo-mobile.png',fullPage:true});
await page.goto('file:///'+process.cwd().replaceAll('\\','/')+'/dist/pixel-rail-offline.html');await page.waitForFunction(()=>!!window.pixelRail);check('offline 3D initialization',await page.evaluate(()=>!!window.pixelRail.renderer.getContext()));
check('no browser runtime errors',errors.length===0);report.errors=errors;await fs.writeFile('dist/assets/browser-validation.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));await browser.close();
