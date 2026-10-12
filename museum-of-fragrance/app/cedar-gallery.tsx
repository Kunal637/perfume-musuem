"use client";


import {RoomPortal} from "./room-portal";
import {useRoomResponse,driftPoint,responseStrength} from "./room-response";

import {LivingMaterials} from "./living-materials";

import {useEffect,useRef} from "react";

const PHOTOGRAPH="/images/cedar-gallery.webp";

export function CedarGallery({active,paused}:{active:boolean;paused:boolean}){
  const root=useRef<HTMLElement>(null),water=useRef<HTMLCanvasElement>(null),air=useRef<HTMLCanvasElement>(null);
  const response=useRoomResponse(root,"cedar",active,paused);

  useEffect(()=>{
    if(!active||paused)return;
    const scene=root.current,canvas=air.current,pool=water.current;
    if(!scene||!canvas||!pool)return;
    const ctx=canvas.getContext("2d"),waterCtx=pool.getContext("2d");if(!ctx||!waterCtx)return;
    const photo=new Image();let ready=false;photo.onload=()=>{ready=true;};photo.src=PHOTOGRAPH;
    let w=1,h=1,clock=0,previous=0,last=0,raf=0;
    const resize=()=>{w=canvas.clientWidth;h=canvas.clientHeight;canvas.width=pool.width=w;canvas.height=pool.height=h;};
    const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
    const frame=(now:number)=>{
      raf=requestAnimationFrame(frame);const dt=previous?(now-previous)/1000:0;previous=now;
      if(document.hidden)return;
      clock+=dt;if(now-last<33)return;last=now;
      // Keep all architectural effects registered to the same object-fit crop.
      const scale=Math.max(w/1672,h/940),ox=(w-1672*scale)*(w<760?.59:.5),oy=(h-940*scale)*.5;
      scene.style.setProperty("--cedar-daylight",(.12+Math.sin(clock*.23)*.055+Math.sin(clock*.39)*.025).toFixed(4));
      scene.style.setProperty("--cedar-cloud",`${(Math.sin(clock*.055)*5).toFixed(3)}px`);
      if(ready){
        waterCtx.clearRect(0,0,w,h);waterCtx.save();waterCtx.setTransform(scale,0,0,scale,ox,oy);
        waterCtx.beginPath();waterCtx.moveTo(740,421);waterCtx.lineTo(1097,434);waterCtx.lineTo(1097,493);waterCtx.lineTo(742,439);waterCtx.closePath();
        waterCtx.moveTo(1127,437);waterCtx.lineTo(1210,450);waterCtx.lineTo(1200,478);waterCtx.lineTo(1127,493);waterCtx.closePath();waterCtx.clip();
        // Refraction moves only the water: glazing, terrace and car stay sharp.
        for(let y=418;y<498;y+=2){const flow=Math.sin(y*.21-clock*1.35)*2.2+Math.sin(y*.09+clock*.73)*1.2;waterCtx.drawImage(photo,725,y,505,2,725+flow,y,505,2);}
        waterCtx.globalCompositeOperation="screen";waterCtx.strokeStyle="#b5fff2";
        for(let i=0;i<14;i++){const p=(i/14+clock*.022)%1;waterCtx.globalAlpha=Math.sin(p*Math.PI)*.15;waterCtx.lineWidth=.7;waterCtx.beginPath();waterCtx.ellipse(880+Math.sin(i*7.3)*160,425+p*73,22+p*24,1+p*2,0,0,Math.PI*2);waterCtx.stroke();}
        waterCtx.restore();
      }
      ctx.clearRect(0,0,w,h);ctx.save();ctx.setTransform(scale,0,0,scale,ox,oy);
      // Touch sends rings across the actual terrace pool, clipped behind its edges.
      const ripple=responseStrength(response.current,now);
      if(ripple>0){
        ctx.save();ctx.beginPath();ctx.moveTo(740,421);ctx.lineTo(1097,434);ctx.lineTo(1097,493);ctx.lineTo(742,439);ctx.closePath();ctx.clip();
        for(let i=0;i<4;i++){
          const p=(clock*.75+i*.25)%1;ctx.globalAlpha=ripple*(1-p)*.65;ctx.strokeStyle="#ddfff7";ctx.lineWidth=1.1;
          ctx.beginPath();ctx.ellipse(938,453,12+p*115,1+p*12,0,0,Math.PI*2);ctx.stroke();
        }ctx.restore();
      }
      ctx.globalCompositeOperation="screen";
      // Warm display lights gently breathe independently; they never black out.
      [[1478,107,22],[1619,109,18],[1450,381,22],[803,322,25],[137,493,3]].forEach(([x,y,r],i)=>{
        const glow=.44+Math.sin(clock*(1.18+i*.22)+i*1.9)*.18+Math.sin(clock*(2.13+i*.31))* .08;
        ctx.globalAlpha=glow;const gradient=ctx.createRadialGradient(x,y,0,x,y,r*2.5);
        gradient.addColorStop(0,"#fff2b099");gradient.addColorStop(.25,"#ffd78c55");gradient.addColorStop(1,"#ffd78c00");ctx.fillStyle=gradient;ctx.fillRect(x-r*2.5,y-r*2.5,r*5,r*5);
      });
      // Brief reflections on polished accessories, not floating decorative stars.
      [[137,785],[424,791],[316,735],[1046,378],[1446,401]].forEach(([x,y],i)=>{
        const shine=Math.pow(Math.max(0,Math.sin(clock*(.39+i*.077)+i*1.8)),18)*.7;
        ctx.globalAlpha=shine;ctx.strokeStyle="#fff6d8";ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(x-5,y);ctx.lineTo(x+5,y);ctx.moveTo(x,y-4);ctx.lineTo(x,y+4);ctx.stroke();
      });
      // A fine thread of smoke starts at the photographed cigar tip.
      ctx.strokeStyle="#ecf0e8";ctx.shadowColor="#d2ddcf";ctx.shadowBlur=5;
      for(let i=0;i<5;i++){
        const p=(clock*.037+i*.2)%1;ctx.globalAlpha=Math.sin(p*Math.PI)*.085;ctx.lineWidth=.9+p*2;
        ctx.beginPath();ctx.moveTo(453,683);ctx.bezierCurveTo(455+Math.sin(clock*.63+i)*8,651,449+Math.sin(clock*.4+i)*17,657-p*77,448+Math.sin(clock*.54+i)*25,673-p*145);ctx.stroke();
      }
      ctx.restore();
      // Several speeds and radii imply depth without confetti or indoor leaves.
      const count=w<760?36:76;
      for(let i=0;i<count;i++){
        const depth=(i%5)/4,p=(i*.173+clock*(.013+depth*.010))%1;
        let x=((i*.618+clock*(.002+depth*.002))%1)*w+Math.sin(clock*.29+i)*18;
        let y=(1-p)*h+Math.cos(clock*.21+i*2)*14;
        [x,y]=driftPoint(x,y,response.current,now);
        ctx.globalAlpha=Math.sin(p*Math.PI)*(.15+depth*.28);ctx.fillStyle=i%3?"#fff6d5":"#d6ffff";
        ctx.beginPath();ctx.arc(x,y,.55+depth*1.15,0,Math.PI*2);ctx.fill();
      }
      scene.dataset.environmentTime=clock.toFixed(2);
    };raf=requestAnimationFrame(frame);
    const reset=()=>{previous=0;};document.addEventListener("visibilitychange",reset);
    return()=>{cancelAnimationFrame(raf);observer.disconnect();photo.onload=null;document.removeEventListener("visibilitychange",reset);};
  },[active,paused,response]);
  return <section id="cedar-room" ref={root} className={`cedar-gallery${active?" is-active":""}`} aria-labelledby="cedar-title" aria-hidden={!active} inert={!active}>
    <div className="cedar-environment" aria-hidden="true">
      <LivingMaterials scene="cedar" active={active} paused={paused}/>
      <img className="cedar-photograph" src={PHOTOGRAPH} alt="" decoding="async"/>
      <div className="cedar-clouds"><img src={PHOTOGRAPH} alt="" decoding="async"/></div>
      <canvas ref={water} className="cedar-water"/>
      <div className="cedar-daylight"/><div className="cedar-shade"/>
      <canvas ref={air} className="cedar-atmosphere"/>
    </div>
    <div className="cedar-copy">
      <p className="cedar-eyebrow">Gallery 04 <span/> Woods · Fresh</p>
      <h2 id="cedar-title" tabIndex={-1}><span>The</span> Cedar<br/>Room</h2>
      <p>Citrus, aromatic freshness<br/>and refined woods.</p>
      <p className="cedar-signature">Modern fragrances. Effortless presence.</p>
    </div>
    <div className="cedar-footer"><span>Freshness, impeccably tailored.</span><span>04 / Cedar Room</span></div>
  <RoomPortal room="cedar" active={active} paused={paused}/>
  </section>;
}
