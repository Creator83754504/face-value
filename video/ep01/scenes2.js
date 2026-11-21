// ===== Episode 1, 0:24.5 → end. Uses helpers from scene.html =====
const OFF=DATA.off;
const PT=n=>OFF[String(n).padStart(2,'0')];
// first word starting with prefix inside voice part n
function wp(prefix,n){for(const x of WORDS){if(x.p===n&&x.w.toLowerCase().startsWith(prefix.toLowerCase()))return x.s}return PT(n)}
const END=133.0;

// ---------- shared pieces ----------
function sunburst(t,c1,c2){ctx.save();ctx.translate(W/2,H*.45);ctx.rotate(t*.6);for(let i=0;i<24;i++){ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,2400,i/24*Math.PI*2,(i+.5)/24*Math.PI*2);ctx.closePath();ctx.fillStyle=i%2?c1:c2;ctx.fill()}ctx.restore()}
function schematicBg(t){const g=ctx.createRadialGradient(W/2,H*.5,100,W/2,H*.5,1300);g.addColorStop(0,'#1d2a5a');g.addColorStop(1,'#070b1e');ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
function timerBox(label,y=448,color='#c9f7ff'){ctx.save();rr(W/2-200,y-68,400,136,30);ctx.fillStyle='#0b1430';ctx.fill();ctx.lineWidth=6;ctx.strokeStyle='#7fe3f7';ctx.stroke();text(label,W/2,y,{font:'Unb',size:86,color,glow:24,glowColor:'#2fb8d6'});ctx.restore()}
function plasmaBall(cx,cy,r,t){ctx.save();ctx.globalCompositeOperation='lighter';const rr2=r+Math.sin(t*37)*r*.06;const g=ctx.createRadialGradient(cx,cy,2,cx,cy,rr2);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.3,'rgba(255,150,255,.95)');g.addColorStop(.7,'rgba(150,80,255,.6)');g.addColorStop(1,'rgba(90,40,255,0)');ctx.beginPath();ctx.arc(cx,cy,rr2,0,7);ctx.fillStyle=g;ctx.fill();ctx.restore()}
function lightning(cx,cy,r,t,n=6){const R=rng(Math.floor(t*12)+3);ctx.save();ctx.strokeStyle='rgba(220,200,255,.95)';ctx.shadowColor='#b48cff';ctx.shadowBlur=24;ctx.lineWidth=5;for(let i=0;i<n;i++){let a=R()*Math.PI*2,x=cx,y=cy;ctx.beginPath();ctx.moveTo(x,y);for(let j=0;j<7;j++){a+=(R()-.5)*1.1;const l=r/6;x+=Math.cos(a)*l;y+=Math.sin(a)*l;ctx.lineTo(x,y)}ctx.stroke()}ctx.restore()}
function schematicBox(){ctx.save();ctx.strokeStyle='#7fe3f7';ctx.lineWidth=6;ctx.shadowColor='#7fe3f7';ctx.shadowBlur=20;rr(110,560,860,760,40);ctx.stroke();ctx.lineWidth=3;rr(150,600,780,680,30);ctx.stroke();ctx.restore()}
function halves(cx,cy,gap){grape(cx-gap,cy,95);grape(cx+gap,cy,95);[-1,1].forEach(s=>{ctx.beginPath();ctx.arc(cx+s*gap,cy,95,s<0?-Math.PI/2:Math.PI/2,s<0?Math.PI/2:Math.PI*1.5);ctx.closePath();ctx.fillStyle='#b6e08a';ctx.fill();ctx.lineWidth=7;ctx.strokeStyle='#24122e';ctx.stroke()})}
function bigCounter(label,t,t0,y=1430,color='#ffd23f'){if(t<t0)return;const k=outBack((t-t0)/.2);ctx.save();ctx.translate(W/2,y);ctx.scale(k,k);text(label,0,0,{font:'Unb',size:130,color,sw:16,stroke:'#1a0730',glow:30});ctx.restore()}
function smoke(x,y,t,n=10,col='200,200,210'){const R=rng(9);for(let i=0;i<n;i++){const ph=(t*.7+R())%1;ctx.beginPath();ctx.arc(x+(R()-.5)*120+Math.sin(t*2+i)*30,y-ph*600,40+ph*120,0,7);ctx.fillStyle=`rgba(${col},${.5*(1-ph)})`;ctx.fill()}}
function toaster(t){ // running gag: flying toaster with a propeller
  for(const t0 of [30.6,50.2,79.2,89.4,96.4,120.6]){const k=(t-t0)/2.2;if(k<0||k>1)continue;const x=lerp(-200,W+200,k),y=250+Math.sin(k*9)*40;
    ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t*6)*.1);ctx.lineWidth=6;ctx.strokeStyle='#24122e';rr(-80,-50,160,100,26);ctx.fillStyle='#c9d1e2';ctx.fill();ctx.stroke();ctx.fillStyle='#24122e';ctx.fillRect(-50,-56,30,10);ctx.fillRect(10,-56,30,10);
    [-28,28].forEach(ex=>{ctx.beginPath();ctx.arc(ex,0,9,0,7);ctx.fill()});ctx.beginPath();ctx.arc(0,22,12,0,Math.PI);ctx.stroke();
    ctx.fillRect(-4,-90,8,34);const s=Math.sin(t*60);ctx.beginPath();ctx.ellipse(0,-92,90*Math.abs(s)+10,10,0,0,7);ctx.fillStyle='rgba(60,60,80,.7)';ctx.fill();ctx.restore()}}
function mic(cx,cy,s,t,level){ctx.save();ctx.translate(cx,cy);ctx.scale(s,s);ctx.lineWidth=10;ctx.strokeStyle='#24122e';rr(-60,-150,120,200,60);ctx.fillStyle='#d9dbe6';ctx.fill();ctx.stroke();for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(-50,-100+i*25+50);ctx.lineTo(50,-100+i*25+50);ctx.lineWidth=4;ctx.stroke()}ctx.lineWidth=10;ctx.beginPath();ctx.arc(0,0,95,0.15,Math.PI-.15);ctx.stroke();ctx.beginPath();ctx.moveTo(0,95);ctx.lineTo(0,160);ctx.moveTo(-60,160);ctx.lineTo(60,160);ctx.stroke();
  for(let i=0;i<7;i++){const h=20+level*140*Math.abs(Math.sin(t*14+i*1.7));[-1,1].forEach(sd=>{rr(sd*(150+i*30)-9,-h/2-40,18,h,9);ctx.fillStyle='#7fe3f7';ctx.fill()})}ctx.restore()}
function windowFrame(x,y,w,h,title,col){ctx.save();rr(x,y,w,h,30);ctx.fillStyle='#16103a';ctx.fill();ctx.lineWidth=6;ctx.strokeStyle=col;ctx.stroke();rr(x,y,w,64,30);ctx.fillStyle=col;ctx.fill();ctx.fillRect(x,y+34,w,30);text(title,x+w/2,y+33,{size:34,color:'#140d26'});[0,1,2].forEach(i=>{ctx.beginPath();ctx.arc(x+w-40-i*34,y+32,9,0,7);ctx.fillStyle='#140d26';ctx.fill()});ctx.restore()}
function socket(cx,cy,s,{doorOpen=0}={}){ctx.save();ctx.translate(cx,cy);ctx.scale(s,s);ctx.lineWidth=10;ctx.strokeStyle='#24122e';rr(-230,-230,460,460,70);ctx.fillStyle='#f4f1ea';ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(0,0,170,0,7);ctx.fillStyle='#e6e1d6';ctx.fill();ctx.stroke();
  if(doorOpen<1){[-60,60].forEach(x=>{ctx.beginPath();ctx.arc(x,0,26,0,7);ctx.fillStyle='#24122e';ctx.fill()})}else{rr(-110,-130,220,260,20);ctx.fillStyle='#0c0820';ctx.fill();ctx.stroke()}ctx.restore()}
function valera(x,y,s,t,{ext=false,bulb=0}={}){neuron(x,y,s,t);if(ext){ctx.save();ctx.translate(x+130*s,y+30*s);ctx.rotate(-.3);rr(-40*s,-110*s,80*s,200*s,36*s);ctx.fillStyle='#ff3b3b';ctx.fill();ctx.lineWidth=6;ctx.strokeStyle='#24122e';ctx.stroke();ctx.fillStyle='#222';ctx.fillRect(-14*s,-140*s,28*s,34*s);ctx.restore()}
  if(bulb>0){ctx.save();ctx.translate(x,y-230*s);ctx.scale(bulb,bulb);ctx.shadowColor='#ffd23f';ctx.shadowBlur=50;ctx.beginPath();ctx.arc(0,0,55,0,7);ctx.fillStyle='#ffe066';ctx.fill();ctx.restore()}}
function calendar(n,x,y){ctx.save();ctx.translate(x,y);rr(-110,-110,220,220,24);ctx.fillStyle='#fff';ctx.fill();ctx.lineWidth=6;ctx.strokeStyle='#24122e';ctx.stroke();rr(-110,-110,220,60,24);ctx.fillStyle='#ff3b3b';ctx.fill();ctx.fillRect(-110,-74,220,24);text('ДЕНЬ',0,-80,{size:30,color:'#fff'});text(String(n),0,30,{font:'Unb',size:110,color:'#24122e'});ctx.restore()}
function tears(cx,cy,t){[-1,1].forEach(s=>{ctx.save();ctx.strokeStyle='rgba(127,227,247,.9)';ctx.lineWidth=26;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(cx+s*80,cy);ctx.quadraticCurveTo(cx+s*(280+Math.sin(t*20)*10),cy-160,cx+s*420,cy+260);ctx.stroke();ctx.restore()})}
function check(ok,x,y,s=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.beginPath();ctx.arc(0,0,80,0,7);ctx.fillStyle=ok?'#3dd36a':'#ff3b3b';ctx.fill();ctx.lineWidth=8;ctx.strokeStyle='#24122e';ctx.stroke();ctx.lineWidth=20;ctx.strokeStyle='#fff';ctx.lineCap='round';ctx.beginPath();if(ok){ctx.moveTo(-36,0);ctx.lineTo(-8,28);ctx.lineTo(40,-28)}else{ctx.moveTo(-30,-30);ctx.lineTo(30,30);ctx.moveTo(30,-30);ctx.lineTo(-30,30)}ctx.stroke();ctx.restore()}
function building(t,lights){ctx.fillStyle='#0d0a26';ctx.fillRect(0,0,W,H);for(let i=0;i<60;i++){const r=rng(i+1);ctx.fillStyle=`rgba(255,255,255,${.3+r()*.5})`;ctx.fillRect(r()*W,r()*700,3,3)}
  rr(170,420,740,1500,20);ctx.fillStyle='#231d4a';ctx.fill();const R=rng(21);for(let row=0;row<12;row++)for(let c=0;c<6;c++){const on=R()<lights;ctx.fillStyle=on?'#ffd86b':'#2c2560';if(on){ctx.shadowColor='#ffd86b';ctx.shadowBlur=20}ctx.fillRect(220+c*112,480+row*118,70,80);ctx.shadowBlur=0}}

// ---------- scenes ----------
function scPlasma(t,sec,{grow=0,storm=0,shake=0}={}){
  const sh=shake?Math.sin(t*70)*shake:0;ctx.save();ctx.translate(sh,0);
  schematicBg(t);schematicBox();timerBox('00:0'+sec);
  const cx=W/2,cy=1000;for(let i=0;i<9;i++){const ph=((t*1.6+i/9)%1);ctx.beginPath();ctx.arc(cx,cy,lerp(620,40,ph),0,7);ctx.strokeStyle=`rgba(255,${120+80*ph},${220-60*ph},${.15+.5*ph})`;ctx.lineWidth=6+8*ph;ctx.stroke()}
  halves(cx,cy,48);plasmaBall(cx,cy-30,lerp(160,420,grow),t);if(storm)lightning(cx,cy-30,lerp(300,700,storm),t,Math.round(4+storm*8));
  if(storm>0.3&&Math.sin(t*31)>.6){ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(-50,0,W+100,H)}
  ctx.restore()}
function p04(t){const g=clamp((t-wp('раскаляется',4))/4);scPlasma(t,2,{grow:g*.6});
  const t0=wp('раскаляется',4);if(t>t0){const v=Math.round(clamp((t-t0)/2.2)*3000);bigCounter(v+'°C',t,t0,1440,v>2000?'#ff8a8a':'#ffd23f')}
  if(t>wp('ядрёна',4))pill('ЯДРЁНА БАТАРЕЙКА',W/2,1300,wp('ядрёна',4),t,{bg:'#ffd23f',fg:'#2a1600'});
  if(t>wp('плазму',4))plaque([{t:'ПЛАЗМА!',c:'#ff9ad5'}],W/2,250,wp('плазму',4),t,{border:'#ff5fae',size:96,rot:-4});
  if(t>wp('фиолетовое',4))pill('ФИОЛЕТОВОЕ СОЛНЦЕ',W/2,640,wp('фиолетовое',4),t,{bg:'#a98bff',fg:'#140d26'})}
function p05(t){const tc=wp('мурзик',5);
  if(t<tc){ctx.save();applyCam(camFor(t,1.05));lab(t);ctx.restore();ctx.fillStyle='rgba(90,30,180,.35)';ctx.fillRect(0,0,W,H);
    ctx.save();const g=ctx.createRadialGradient(W/2,1900,50,W/2,1900,900);g.addColorStop(0,'rgba(255,150,255,.8)');g.addColorStop(1,'rgba(150,80,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.restore();
    tolik(W/2,1150,1.8,t,{mouth:mouthAt(t),wide:1});ctx.beginPath();ctx.ellipse(W/2,1150+55*1.8,60,30,0,0,7);ctx.fillStyle='rgba(255,170,190,.9)';ctx.fill();
    ctx.save();ctx.fillStyle='rgba(191,233,255,.18)';ctx.fillRect(0,1000,W,920);ctx.strokeStyle='rgba(255,255,255,.4)';ctx.lineWidth=14;ctx.beginPath();ctx.moveTo(120,1900);ctx.lineTo(420,1050);ctx.stroke();ctx.restore();
    if(t>wp('термоядерный',5))plaque([{t:'ТЕРМОЯДЕРНЫЙ',c:'#ffd23f'},{t:'ВИНОГРАД',c:'#d6a3ff'}],W/2,330,wp('термоядерный',5),t,{border:'#ffd23f',size:72,rot:-3})}
  else{ctx.fillStyle='#1f6f66';ctx.fillRect(0,0,W,H);ctx.save();ctx.translate(W/2,1050);ctx.scale(6,6);cat(0,0,t);ctx.fillStyle='#8c8fa6';ctx.strokeStyle='#2a1a3a';ctx.lineWidth=1.5;[-15,15].forEach(ex=>{ctx.beginPath();ctx.ellipse(ex,-12,17,13,0,0,7);ctx.fill();ctx.stroke()});ctx.restore();
    pill('МУРЗИК: БЕЗ КОММЕНТАРИЕВ',W/2,330,tc,t,{bg:'#cbbdff',fg:'#140d26',size:44})}}
function p06(t){scPlasma(t,3,{grow:.6+clamp((t-PT(6))/5)*.25,shake:6});if(Math.sin(t*19)>.7){ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(0,0,W,H)}
  if(t>wp('ёшкин',6))pill('ЁШКИН КОТ',W/2,1300,wp('ёшкин',6),t,{bg:'#ff5fae',fg:'#fff'});
  if(t>wp('гудит',6))plaque([{t:'ГУДИТ КАК',c:'#fff'},{t:'ТРАНСФОРМАТОР',c:'#ffd23f'}],W/2,250,wp('гудит',6),t,{border:'#ffd23f',size:64,rot:3});
  if(t>wp('лампочка',6))pill('ЛАМПА МИГАЕТ',W/2,640,wp('лампочка',6),t,{bg:'#ffd23f',fg:'#2a1600'})}
function p07(t){scPlasma(t,3,{grow:.85,storm:clamp((t-PT(7))/2),shake:10});
  const a=wp('тысяча',7),b=wp('две',7),c=wp('три',7);bigCounter(t<b?'1000°C':t<c?'2000°C':'3000°C',t,a,1440,t<c?'#ffd23f':'#ff6b6b');
  if(t>wp('шлёп',7))pill('ШЛЁП-НОГА',W/2,1300,wp('шлёп',7),t,{bg:'#ff5fae',fg:'#fff'});
  if(t>wp('адронный',7))plaque([{t:'АДРОННЫЙ',c:'#7fe3f7'},{t:'КОЛЛАЙДЕР',c:'#fff'}],W/2,250,wp('адронный',7),t,{border:'#7fe3f7',size:80,rot:-4});
  else if(t>wp('молнии',7))plaque([{t:'МОЛНИИ!',c:'#cbbdff'}],W/2,250,wp('молнии',7),t,{border:'#a98bff',size:90,rot:-3})}
function p08(t){ctx.save();applyCam(camFor(t,1.02));lab(t);ctx.restore();ctx.fillStyle='rgba(20,10,40,.3)';ctx.fillRect(0,0,W,H);
  const err=t>wp('ошибка',8)&&Math.sin(t*14)>0;smoke(W/2,640,t,12);microwave(W/2,700,1.2,{on:true,t:9,inside:()=>{plasmaBall(-65,0,150,t)}});if(err){ctx.save();rr(W/2+150,520,140,80,10);ctx.fillStyle='#ff3b3b';ctx.fill();text('ERR',W/2+220,562,{size:40,color:'#fff'});ctx.restore()}
  tolik(W/2,1450,1.05,t,{mouth:mouthAt(t),wide:.6});
  if(t>wp('тянется',8)){const k=clamp((t-wp('тянется',8))/1.2);ctx.save();ctx.lineCap='round';ctx.strokeStyle='#24122e';ctx.lineWidth=46;ctx.beginPath();ctx.moveTo(W/2+170,1640);ctx.quadraticCurveTo(W/2+330,1300,lerp(W/2+250,W/2+40,k),lerp(1250,860,k));ctx.stroke();ctx.strokeStyle='#f0bd92';ctx.lineWidth=32;ctx.stroke();ctx.restore()}
  if(t>wp('ошибка',8)&&t<wp('ведь',8))pill('ОШИБКА!',W/2,250,wp('ошибка',8),t,{bg:'#ff3b3b',fg:'#fff',size:52});
  if(t>wp('ведь',8)){plaque([{t:'ПЛАЗМА ТЁПЛАЯ?',c:'#ffd23f'}],W/2,240,wp('ведь',8),t,{border:'#ffd23f',size:66,rot:2});pill('ИСТОЧНИК: ИНТЕРНЕТ',W/2,380,wp('тёплая',8),t,{bg:'#7fe3f7',fg:'#0c0820'})}}
function p09(t){ctx.save();applyCam(camFor(t,1.03));lab(t);
  const lidT=wp('крышка',9);tolik(W/2,1180,1.25,t,{mouth:mouthAt(t),wide:1});
  if(t>lidT-.4){const k=outCubic((t-(lidT-.4))/.5);ctx.save();ctx.translate(W/2,lerp(-200,780,k));ctx.lineWidth=8;ctx.strokeStyle='#24122e';ctx.beginPath();ctx.ellipse(0,0,260,60,0,Math.PI,0);ctx.fillStyle='#9aa0b4';ctx.fill();ctx.stroke();ctx.beginPath();ctx.ellipse(0,-50,50,24,0,0,7);ctx.fillStyle='#24122e';ctx.fill();ctx.restore()}
  ctx.restore();
  const tn=wp('но',9);if(t<tn){const k=clamp((t-PT(9))/(wp('досада',9)-PT(9)));const v=3-Math.floor(k*2.999);ctx.save();rr(W/2-300,140,600,140,24);ctx.fillStyle='#14060c';ctx.fill();ctx.lineWidth=6;ctx.strokeStyle='#ff3b3b';ctx.stroke();text('ДО ПОЖАРА:',W/2,182,{size:36,color:'#fff'});text('00:0'+v,W/2,240,{font:'Unb',size:64,color:Math.sin(t*12)>0?'#ff3b3b':'#ff9a9a',glow:20});ctx.restore();
    if(t>wp('ну',9))pill('НУ И ДОСАДА, ЁПЕРНЫЙ РЕАКТОР!',W/2,1450,wp('ну',9),t,{bg:'#ff5fae',fg:'#fff',size:36})}
  else{text('НО ТУТ…',W/2,230,{font:'Unb',size:96,color:'#fff',sw:12,stroke:'#120a1f'});if(t>lidT)plaque([{t:'СВЕТИЛА',c:'#fff'},{t:'КРЫШКА',c:'#ff9ad5'}],W/2,470,lidT,t,{border:'#ff5fae',size:70,rot:-3})}}
function p10(t){ctx.fillStyle='#2b9e8f';ctx.fillRect(0,0,W,H);for(let x=0;x<W;x+=70){ctx.fillStyle='rgba(255,255,255,.05)';ctx.fillRect(x,0,28,H)}
  const t0=PT(10),open=t>t0+.15?1:0;socket(W/2,900,1.6,{doorOpen:open});
  if(t>t0&&t<t0+1.2){const k=(t-t0)/1.2;ctx.save();ctx.translate(W/2+k*600,900-k*700+k*k*900);ctx.rotate(k*9);rr(-110,-130,220,260,20);ctx.fillStyle='#e6e1d6';ctx.fill();ctx.lineWidth=8;ctx.strokeStyle='#24122e';ctx.stroke();ctx.restore();smoke(W/2,1000,t,8,'230,230,240')}
  if(t>t0+.3){const k=outBack((t-t0-.3)/.6);valera(W/2,lerp(950,1050,k),lerp(.2,1.05,k),t,{ext:true})}
  if(t>wp('валера',10))plaque([{t:'ВАЛЕРА',c:'#ffd23f'}],W/2,250,wp('валера',10),t,{border:'#ffd23f',size:96,rot:-3});
  if(t>wp('единственный',10))pill('ЕДИНСТВЕННЫЙ НЕЙРОН ТОЛИКА',W/2,400,wp('единственный',10),t,{bg:'#ffb000',fg:'#2a1600',size:38});
  if(t>wp('главный',10))pill('ГЛАВНЫЙ СПАСАТЕЛЬ БЕДОЛАГИ',W/2,1440,wp('главный',10),t,{bg:'#b6ff5c',fg:'#14300a',size:38})}
const MAT=[['бл*ть',1,'БЛ*ТЬ!','#ff5fae'],['с*ка',1,'С*КА!','#b6ff5c'],['нах*й',1,'НАХ*Й!','#7fe3f7'],['е*ать',1,'Е*АТЬ-КОПАТЬ!','#ffd23f'],['п*здец',1,'П*ЗДЕЦ!','#a98bff'],['бл*ть',2,'БЛ*ТЬ!','#ff6b6b'],['нах*й',2,'НАХ*Й!','#ffffff']];
function wpN(prefix,n,k){let c=0;for(const x of WORDS){if(x.p===n&&x.w.toLowerCase().startsWith(prefix)){c++;if(c===k)return x.s}}return 1e9}
function p11(t){const tPo=wp('поехали',11),tGl=wp('глоток',11),tO=wp('ооо',11),tUh=wp('ух',11);
  if(t<tPo){ctx.fillStyle='#120c2e';ctx.fillRect(0,0,W,H);windowFrame(70,140,940,700,'РАССКАЗЧИК','#ff5fae');mic(W/2,520,1,t,mouthAt(t));
    windowFrame(70,900,940,820,'РОЗЕТКА ТОЛИКА','#ffd23f');ctx.save();rr(70,964,940,756,30);ctx.clip();ctx.fillStyle='#2b9e8f';ctx.fillRect(70,964,940,756);socket(300,1330,.8,{doorOpen:1});valera(640,1330,.95,t,{ext:true});ctx.restore();
    if(t>wp('дай',11)){const k=outBack((t-wp('дай',11))/.3);ctx.save();ctx.translate(W/2,760);ctx.scale(k,k);rr(-430,-70,860,140,30);ctx.fillStyle='#fff';ctx.fill();ctx.lineWidth=6;ctx.strokeStyle='#24122e';ctx.stroke();text('ДАЙ МНЕ УЖЕ',0,-24,{size:44,color:'#24122e'});text('АНТИМАТНОЕ ЗЕЛЬЕ!',0,28,{size:44,color:'#d6337a'});ctx.restore()}}
  else if(t<tO){const g=ctx.createRadialGradient(W/2,H*.55,50,W/2,H*.55,1100);g.addColorStop(0,'#6a2fb8');g.addColorStop(1,'#1a0838');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    const tilt=t>tGl?clamp((t-tGl)/.4)*.9:0;ctx.save();ctx.translate(W/2,1050);ctx.rotate(tilt);ctx.lineWidth=10;ctx.strokeStyle='#e9dcff';ctx.beginPath();ctx.moveTo(-60,-380);ctx.lineTo(60,-380);ctx.lineTo(60,-180);ctx.lineTo(260,240);ctx.lineTo(-260,240);ctx.lineTo(-60,-180);ctx.closePath();ctx.fillStyle='rgba(255,255,255,.15)';ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(-170,60);ctx.lineTo(170,60);ctx.lineTo(260,240);ctx.lineTo(-260,240);ctx.closePath();ctx.fillStyle='#b16cff';ctx.shadowColor='#d6a3ff';ctx.shadowBlur=60;ctx.fill();ctx.shadowBlur=0;rr(-200,-60,400,110,16);ctx.fillStyle='#f4f1ea';ctx.fill();text('АНТИМАТНОЕ',0,-28,{size:40,color:'#24122e'});text('ЗЕЛЬЕ',0,22,{size:40,color:'#d6337a'});ctx.restore();
    if(t<tGl)drop('ПОЕХАЛИ!',t,tPo);else drop('ГЛОТОК!',t,tGl)}
  else if(t<tUh){const pal=[['#ff5fae','#3a0d6b'],['#b6ff5c','#0d3a2a'],['#7fe3f7','#2a0d5a'],['#ffd23f','#5a0d2a']];const c=pal[Math.floor(t*10)%4];sunburst(t,c[1],'#140826');ctx.fillStyle=`rgba(${Math.floor(t*10)%2?'255,0,120':'0,200,255'},.08)`;ctx.fillRect(0,0,W,H);
    mic(W/2+Math.sin(t*80)*14,1150,1.4,t,1);
    if(t<wp('наконец',11)+.6)drop('ОООО!',t,tO);else text('НАКОНЕЦ-ТО!',W/2,260,{font:'Unb',size:84,color:'#fff',sw:12,stroke:'#120a1f'});
    MAT.forEach(([w,k,label,col],i)=>{const tt=wpN(w,11,k);if(t>tt){const R=rng(i+5);plaque([{t:label,c:col}],W/2+(R()-.5)*220,480+i*120,tt,t,{border:col,size:70,rot:(R()-.5)*16,fill:'rgba(20,8,38,.9)'})}})}
  else{ctx.fillStyle='#120c2e';ctx.fillRect(0,0,W,H);mic(W/2,1000,1.3,t,mouthAt(t)*.5);pill('УХ… ОТПУСТИЛО',W/2,380,tUh,t,{bg:'#b6ff5c',fg:'#14300a',size:56})}}
function p12(t){const tj=wp('прыгает',12),ty=wp('выдёргивает',12);ctx.fillStyle='#2b9e8f';ctx.fillRect(0,0,W,H);for(let x=0;x<W;x+=70){ctx.fillStyle='rgba(255,255,255,.05)';ctx.fillRect(x,0,28,H)}
  socket(W/2,800,1.2,{doorOpen:0});const pull=t>ty?outCubic((t-ty)/.5):0;
  // plug + cord
  ctx.save();ctx.translate(W/2,800+pull*520);ctx.lineWidth=10;ctx.strokeStyle='#24122e';rr(-120,-90,240,180,40);ctx.fillStyle='#ffffff';ctx.fill();ctx.stroke();ctx.lineWidth=40;ctx.beginPath();ctx.moveTo(0,90);ctx.quadraticCurveTo(200,500,-100,1400);ctx.stroke();ctx.restore();
  if(t>ty&&t<ty+.6){const R=rng(Math.floor(t*30));for(let i=0;i<14;i++){ctx.beginPath();ctx.moveTo(W/2,800);ctx.lineTo(W/2+(R()-.5)*500,800+(R()-.5)*500);ctx.strokeStyle='#ffe066';ctx.lineWidth=6;ctx.stroke()}}
  let vx=W/2+330,vy=1250,vs=.9;if(t>tj){const k=clamp((t-tj)/.6);vx=lerp(W/2+330,W/2,k);vy=lerp(1250,620+pull*520,k)-Math.sin(k*Math.PI)*400}
  valera(vx,vy,vs,t,{ext:true,bulb:t>wp('понимает',12)&&t<tj?outBack((t-wp('понимает',12))/.3):0});
  if(t>wp('надо',12)&&t<ty)plaque([{t:'НАДО СРОЧНО',c:'#fff'},{t:'СПАСАТЬ ДОЛБО*БА!',c:'#ffd23f'}],W/2,230,wp('надо',12),t,{border:'#ffd23f',size:58,rot:-2});
  if(t>ty)plaque([{t:'ВЫДЕРНУТЬ НАХ*Й!',c:'#ff9ad5'}],W/2,230,ty,t,{border:'#ff5fae',size:66,rot:3})}
function p13(t){const tf=wp('пеной',13),ts=wp('чихает',13),tp=wp('вышибает',13);
  ctx.save();applyCam(camFor(t,1.02));lab(t);ctx.restore();ctx.fillStyle='rgba(20,10,40,.35)';ctx.fillRect(0,0,W,H);
  smoke(W/2,620,t,14,'120,120,130');microwave(W/2,700,1.1,{on:false});
  if(t>tf){const R=rng(4);for(let i=0;i<40;i++){const ph=((t-tf)*1.5+R())%1;ctx.beginPath();ctx.arc(lerp(W/2+380,W/2-60,ph)+(R()-.5)*90,lerp(1150,700,ph)+(R()-.5)*90,30+R()*40,0,7);ctx.fillStyle='rgba(255,255,255,.9)';ctx.fill()}valera(W/2+380,1200,.7,t,{ext:true})}
  tolik(W/2-120,1480,.95,t,{mouth:mouthAt(t),blink:t>ts&&t<ts+.4});
  if(t>ts&&t<ts+1){const R=rng(Math.floor(t*20));for(let i=0;i<18;i++){const a=R()*Math.PI*2,l=60+R()*260*(t-ts);ctx.beginPath();ctx.arc(W/2-120+Math.cos(a)*l,1480+52+Math.sin(a)*l,8,0,7);ctx.fillStyle='#ffe066';ctx.fill()}}
  if(t>tf&&t<tp)pill('ПЕНА!',W/2,250,tf,t,{bg:'#ffffff',fg:'#24122e',size:56});
  if(t>tp){ctx.fillStyle=`rgba(0,0,0,${clamp((t-tp)/.15)*.82})`;ctx.fillRect(0,0,W,H);plaque([{t:'ПРОБКИ',c:'#ffd23f'},{t:'ВЫШИБЛО!',c:'#fff'}],W/2,300,tp,t,{border:'#ffd23f',size:80,rot:-4})}}
function p14(t){const tt=wp('толик',14),tf=wp('падает',14),tl=wp('живой',14);
  if(t<tt){const k=clamp((t-PT(14))/(wp('окне',14)+.3-PT(14)));building(t,1-k);if(t>wp('соседи',14))pill('СОСЕДИ ОРУТ',W/2-180,260,wp('соседи',14),t,{bg:'#ff5fae',fg:'#fff'});if(t>wp('мурзик',14))pill('МУРЗИК ОРЁТ',W/2+180,380,wp('мурзик',14),t,{bg:'#cbbdff',fg:'#140d26'})}
  else{ctx.fillStyle='#2a1f4a';ctx.fillRect(0,0,W,H);const rot=t>tf?outCubic((t-tf)/.5)*Math.PI/2:0;ctx.save();ctx.translate(W/2,1100);ctx.rotate(rot);ctx.translate(-W/2,-1100);tolik(W/2,1000,1.3,t,{mouth:mouthAt(t),skin:'#d9d6cf'});ctx.restore();
    if(t>tf){const R=rng(2);for(let i=0;i<10;i++){ctx.beginPath();ctx.ellipse(380+R()*400,780+R()*400+((t*200+i*40)%120),10,18,0,0,7);ctx.fillStyle='rgba(127,227,247,.8)';ctx.fill()}}
    if(t<tl)plaque([{t:'БЛЕДНЫЙ',c:'#fff'},{t:'КАК ЛАБОРАНТ',c:'#cbd3e6'}],W/2,260,tt,t,{border:'#cbd3e6',size:64,rot:-2});
    else plaque([{t:'ЖИВОЙ, Е*АТЬ!',c:'#b6ff5c'}],W/2,260,tl,t,{border:'#b6ff5c',size:76,rot:3})}}
function p15(t){schematicBg(t);const tm=wp('микроволновка',15),tg=wp('магнетрон',15);
  if(t<tm){schematicBox();const cx=W/2,cy=1000;for(let i=0;i<9;i++){const ph=((t*1.4+i/9)%1);ctx.beginPath();ctx.arc(cx,cy,lerp(620,40,ph),0,7);ctx.strokeStyle=`rgba(255,180,200,${.15+.5*ph})`;ctx.lineWidth=6;ctx.stroke()}halves(cx,cy,48);plasmaBall(cx,cy-20,140,t);
    text('ПО НАУКЕ:',W/2,250,{font:'Unb',size:80,color:'#fff',glow:16});if(t>wp('антенна',15)){check(true,W/2+300,700,.8);pill('АНТЕННА',W/2,400,wp('антенна',15),t)}if(t>wp('поджигают',15))pill('ВОЗДУХ → ПЛАЗМА',W/2,1440,wp('поджигают',15),t,{bg:'#ff9ad5',fg:'#24122e'})}
  else{microwave(W/2,800,1.2,{on:false});smoke(W/2+200,680,t,6,'120,120,130');check(true,W/2-300,1260,1);text('НЕ ВЗОРВАЛАСЬ',W/2-300,1400,{size:40,color:'#b6ff5c'});if(t>tg){check(false,W/2+300,1260,outBack((t-tg)/.3));text('МАГНЕТРОН',W/2+300,1400,{size:40,color:'#ff8a8a'});plaque([{t:'СГОРЕЛ НАХ*Й',c:'#ff8a8a'}],W/2,260,tg,t,{border:'#ff3b3b',size:66,rot:-3})}}}
function p16(t){const tm=wp('мораль',16),tv=wp('ведь',16);
  if(t<tm){ctx.save();applyCam(camFor(t,1.02));lab(t);tolik(W/2,1180,1.25,t,{mouth:mouthAt(t)});ctx.restore();if(t>wp('плакать',16)||t>PT(16)+2.0)tears(W/2,1180,t);
    const k=clamp((t-PT(16))/(tm-PT(16)-.2));calendar(1+Math.floor(k*6.99),W-190,560);text('НЕДЕЛЮ',W/2,240,{font:'Unb',size:96,color:'#ffd23f',sw:12,stroke:'#3a1d00'});
    if(t>wp('суп',16))pill('СУП НА БАТАРЕЕ',W/2,370,wp('суп',16),t,{bg:'#ff8a2a',fg:'#2a1000'})}
  else{hookBg(t);ctx.save();neonBox(260,170,560,130,'#ffd23f',{glow:30});text('МОРАЛЬ:',W/2,236,{font:'Unb',size:72,color:'#ffd23f',glow:20});ctx.restore();
    grape(320,900,130);text('+',W/2-30,900,{font:'Unb',size:110,color:'#fff'});microwave(760,900,.62,{});if(t>tm+.6)check(false,W/2,900,outBack((t-tm-.6)/.3)*1.4);
    if(t<tv)plaque([{t:'НЕ СУЙТЕ ВИНОГРАД',c:'#fff'},{t:'В МИКРОВОЛНОВКУ!',c:'#ff9ad5'}],W/2,1300,wp('суйте',16),t,{border:'#ff5fae',size:52,rot:-2});
    else{plaque([{t:'ВАЛЕРА ЕСТЬ',c:'#ffd23f'},{t:'ТОЛЬКО У ТОЛИКА',c:'#fff'}],W/2,1300,tv,t,{border:'#ffd23f',size:58,rot:2});valera(W/2,560,.6,t,{ext:false})}}}
function p17(t){ctx.save();applyCam(camFor(t,1.02));lab(t);tolik(W/2,1150,1.2,t,{mouth:0});ctx.restore();valera(W/2+330,820,.55,t,{ext:true});
  ctx.save();ctx.translate(180,1260);ctx.scale(2.2,2.2);cat(0,0,t);ctx.restore();
  drop('ВЫЖИЛ!',t,PT(17));const k=outBack((t-PT(17)-.5)/.35);if(t>PT(17)+.5){ctx.save();ctx.translate(W/2,1700);ctx.scale(k,k);neonBox(-420,-110,840,220,'#7fe3f7',{glow:36,fill:'rgba(12,8,30,.92)'});text('ТОЛИК',0,-40,{font:'Unb',size:78,color:'#ffd23f',glow:20});text('ПРОФЕССОР',0,48,{font:'Unb',size:78,color:'#7fe3f7',glow:20});ctx.restore()}}

const SC=[[4,p04],[5,p05],[6,p06],[7,p07],[8,p08],[9,p09],[10,p10],[11,p11],[12,p12],[13,p13],[14,p14],[15,p15],[16,p16],[17,p17]];
const render1=render;
window.render=function(f){const t=f/FPS;if(t<PT(4)){render1(f);return}
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);
  let fn=SC[0][1];for(const [n,g] of SC){if(t>=PT(n))fn=g}fn(t);
  toaster(t);
  for(const [n] of SC)cutFlash(t,PT(n),.12);
  // sub-cuts inside parts
  [wp('мурзик',5),wp('поехали',11),wp('ооо',11),wp('ух',11),wp('толик',14),wp('микроволновка',15),wp('мораль',16)].forEach(x=>cutFlash(t,x,.1));
  if(t<PT(17))subs(t,1640);
};
window.TOTAL_FRAMES=Math.round(END*FPS);
