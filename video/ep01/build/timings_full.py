import json,re,subprocess
P='/home/user/face-value/voiceover/ep01/parts/'
order=['01-hook','02-hero','03-start']+[f'{i:02d}' for i in range(4,18)]
dur={};off={};o=0
for n in order:
  d=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',P+n+'.mp3']).decode());off[n]=o;dur[n]=d;o+=d
V=set("аеёиоуыэюяАЕЁИОУЫЭЮЯ")
CENS={'блять':'бл*ть','сука':'с*ка','нахуй':'нах*й','ебать':'е*ать','пиздец':'п*здец','долбоёба':'долбо*ба'}
def cens(w):
  for a,b in CENS.items():
    if a in w.lower(): w=re.sub(a,b,w,flags=re.I)
  return w
words=[]
# parts 1-3: hand-mapped segments (unchanged from the 24s cut)
O=[0,off['02-hero'],off['03-start']]
segs=[(0,0.10,2.08,"Чё будет, если засунуть виноград в микроволновку?"),(0,2.27,3.49,"Кухня улетела в отпуск!"),(0,3.56,5.07,"Знакомьтесь, ядрёна батарейка,"),(0,5.17,6.21,"это Толик Профессор!"),(1,0.00,1.48,"Человек, мать моя кибернетика,"),(1,1.56,3.65,"у которого вместо мозга один нейрон Валера."),(1,3.84,5.42,"В один прекрасный день Толику стало,"),(1,5.51,6.19,"ёшкин кот,"),(1,6.29,6.84,"любопытно."),(1,7.00,7.68,"И он решил!"),(1,8.07,9.66,"Спокойно, я в интернете читал."),(2,0.08,3.37,"Толик режет виноградину пополам, закидывает в микроволновку и жмёт старт."),(2,3.89,8.10,"В первую, шлёп-нога, секунду половинки работают как антенна, и волны собираются в одной точке.")]
def wgt(x): return max(1,sum(c in V for c in x))+0.3
for p,s,e,t in segs:
  ws=t.split();w=[wgt(x) for x in ws];tot=sum(w);cur=O[p]+s
  for x,k in zip(ws,w):
    d=(e-s)*k/tot;words.append({"w":x,"s":round(cur,3),"e":round(cur+d,3),"p":p+1});cur+=d
texts={}
for f in ['script-rest.txt']:
  for l in open('/home/user/face-value/voiceover/ep01/'+f,encoding='utf-8'):
    n,t=l.rstrip('\n').split('|',1);texts[n]=re.sub(r'\[[^\]]*\]\s*','',t)
texts['17']='Выжил! Толик Профессор.'
for n in order[3:]:
  # speech intervals = complement of silences
  out=subprocess.run(['ffmpeg','-v','info','-i',P+n+'.mp3','-af','silencedetect=n=-32dB:d=0.07','-f','null','-'],capture_output=True,text=True).stderr
  ss=[float(x) for x in re.findall(r'silence_start: ([0-9.]+)',out)];ee=[float(x) for x in re.findall(r'silence_end: ([0-9.]+)',out)]
  sil=list(zip(ss,ee+[dur[n]]*(len(ss)-len(ee))));sp=[];cur=0
  for a,b in sil:
    if a>cur+0.02: sp.append((cur,a))
    cur=max(cur,b)
  if cur<dur[n]-0.05: sp.append((cur,dur[n]))
  ws=texts[n].split()
  # phrases split after punctuation
  ph=[];cur=[]
  for x in ws:
    cur.append(x)
    if re.search(r'[,.!?:…]$',x): ph.append(cur);cur=[]
  if cur: ph.append(cur)
  pw=[sum(wgt(x) for x in p) for p in ph];sd=[b-a for a,b in sp]
  import functools
  def blocks(nitems,ngroups):
    # all ways to cut nitems into ngroups contiguous non-empty groups -> DP below
    pass
  P_,S_=len(ph),len(sp);TW=sum(pw);TD=sum(sd)
  if P_>=S_:
    @functools.lru_cache(None)
    def f(i,j):
      if j==S_: return (0,()) if i==P_ else (1e9,())
      best=(1e9,())
      for k in range(i+1,P_-(S_-j-1)+1):
        c=(sd[j]/TD-sum(pw[i:k])/TW)**2;r=f(k,j+1)
        if c+r[0]<best[0]: best=(c+r[0],((i,k),)+r[1])
      return best
    groups=f(0,0)[1]
    assign=[(ph[a:b],[sp[j]]) for j,(a,b) in enumerate(groups)]
  else:
    @functools.lru_cache(None)
    def g(i,j):
      if i==P_: return (0,()) if j==S_ else (1e9,())
      best=(1e9,())
      for k in range(j+1,S_-(P_-i-1)+1):
        c=(sum(sd[j:k])/TD-pw[i]/TW)**2;r=g(i+1,k)
        if c+r[0]<best[0]: best=(c+r[0],((j,k),)+r[1])
      return best
    groups=g(0,0)[1]
    assign=[([ph[i]] if False else [ph[i]],sp[a:b]) for i,(a,b) in enumerate(groups)]
  for phs,segs_ in assign:
    wl=[x for p in phs for x in p];L=sum(b-a for a,b in segs_)
    def tmap(x,segs_=segs_):
      for a,b in segs_:
        if x<=b-a: return a+x
        x-=b-a
      return segs_[-1][1]
    w=[wgt(x) for x in wl];tot=sum(w);acc=0
    for x,k in zip(wl,w):
      s0=tmap(acc*L/tot);acc+=k;e0=tmap(acc*L/tot)
      words.append({"w":cens(x),"s":round(off[n]+s0,3),"e":round(off[n]+e0,3),"p":int(n)})
rms=[]
for l in open('rms_full.txt'):
  if 'RMS' in l:
    v=l.split('=')[1].strip();v=-90 if 'inf' in v else float(v);rms.append(round(max(0,min(1,(v+42)/30)),3))
json.dump({"words":words,"rms":rms,"off":off},open('data_full.json','w'),ensure_ascii=False)
open('data.js','w').write('const DATA='+json.dumps({"words":words,"rms":rms,"off":off},ensure_ascii=False)+';')
print(len(words),'words'); print({k:round(v,2) for k,v in off.items()})
for x in words:
  if x['p'] in (11,12): print(x['s'],x['w'])
