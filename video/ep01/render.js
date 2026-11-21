const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
(async()=>{const [,,out,from,to,step]=process.argv;fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('file://'+path.resolve('scene.html'));await p.evaluate(()=>window.ready);
for(let f=+from;f<=+to;f+=+(step||1)){const d=await p.evaluate(f=>{render(f);return document.getElementById('c').toDataURL('image/png')},f);
fs.writeFileSync(path.join(out,'f'+String(f).padStart(4,'0')+'.png'),Buffer.from(d.split(',')[1],'base64'))}
if(errs.length)console.log('ERR',errs.slice(0,5));await b.close()})();
