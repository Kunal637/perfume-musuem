"use client";


import {RoomPortal} from "./room-portal";
import {useRoomResponse,driftPoint,responseStrength} from "./room-response";

import {LivingMaterials} from "./living-materials";

import {useEffect,useRef} from "react";

export function SultansGallery({active,paused}:{active:boolean;paused:boolean}){
  const root=useRef<HTMLElement>(null),atmosphere=useRef<HTMLCanvasElement>(null),water=useRef<HTMLCanvasElement>(null);
  const response=useRoomResponse(root,"sultans",active,paused);

  useEffect(()=>{
    if(!active||paused)return;
    const scene=root.current,canvas=atmosphere.current;if(!scene||!canvas)return;
    const ctx=canvas.getContext("2d");if(!ctx)return;
    const sea=water.current,seaCtx=sea?.getContext("2d"),photo=new Image();let photoReady=false;
    photo.onload=()=>{photoReady=true;};photo.src="/images/sultans-gallery.webp";
    const lanterns=[...scene.querySelectorAll<HTMLElement>(".sultan-lantern")];
    let w=1,h=1,clock=0,previous=0,last=0,raf=0;
    const resize=()=>{w=canvas.clientWidth;h=canvas.clientHeight;canvas.width=w;canvas.height=h;if(sea){sea.width=w;sea.height=h;}};
    const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
    const smooth=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
    const frame=(now:number)=>{
      raf=requestAnimationFrame(frame);const dt=previous?(now-previous)/1000:0;previous=now;
      if(document.hidden)return;
      clock+=dt;if(now-last<33)return;last=now;
      lanterns.forEach((lamp,i)=>{
        const glow=Math.min(1,.78+responseStrength(response.current,now)*.12)+Math.sin(clock*(1.1+i*.27)+i*2.1)*.12+Math.sin(clock*(2.03+i*.17)+i)*.06;
        lamp.style.setProperty("--lamp",glow.toFixed(3));
        lamp.style.setProperty("--swing",`${(Math.sin(clock*(.4+i*.09)+i*1.6)*(1.8+i*.23)).toFixed(3)}deg`);
      });
      scene.style.setProperty("--silk",`${(Math.sin(clock*.39)*.3+Math.sin(clock*.73)*.1).toFixed(3)}deg`);
      scene.style.setProperty("--silk-light",(.5+Math.sin(clock*.29)*.18).toFixed(3));
      const visit=clock%46,presence=smooth((visit-6)/2.5)*(1-smooth((visit-18)/3));
      scene.style.setProperty("--nobleman",presence.toFixed(3));
      scene.style.setProperty("--nobleman-x",`${((1-presence)*45).toFixed(2)}px`);
      const scale=Math.max(w/1672,h/941),offsetX=(w-1672*scale)*(w<760?.58:.5),offsetY=(h-941*scale)*.5;
      if(seaCtx&&photoReady){
        seaCtx.clearRect(0,0,w,h);seaCtx.save();seaCtx.setTransform(scale,0,0,scale,offsetX,offsetY);
        seaCtx.beginPath();seaCtx.moveTo(100,525);seaCtx.lineTo(902,515);seaCtx.lineTo(897,545);seaCtx.lineTo(93,598);seaCtx.closePath();seaCtx.clip();
        for(let y=513;y<600;y+=3){const flow=Math.sin(y*.16-clock*1.1)*1.25+Math.sin(y*.09+clock*.6)*.7;seaCtx.drawImage(photo,50,y,875,3,50+flow,y,875,3);}
        seaCtx.restore();
      }
      ctx.clearRect(0,0,w,h);
      // Registered light cores alter the photographed lamps as well as their spill.
      [[450,674,10],[990,610,8],[1174,587,6],[1349,274,6]].forEach(([px,py,radius],i)=>{
        const x=px*scale+offsetX,y=py*scale+offsetY,r=radius*scale;
        const intensity=.72+Math.sin(clock*(.86+i*.31)+i*1.7)*.15+Math.sin(clock*2.1+i)*.07;
        ctx.globalAlpha=(1-intensity)*.6;ctx.fillStyle="#321a0b";ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
        ctx.save();ctx.globalCompositeOperation="screen";ctx.globalAlpha=intensity*.65;
        const glow=ctx.createRadialGradient(x,y,0,x,y,r*4);glow.addColorStop(0,"#ffc56b");glow.addColorStop(.2,"#f5a23188");glow.addColorStop(1,"#f5a23100");
        ctx.fillStyle=glow;ctx.fillRect(x-r*4,y-r*4,r*8,r*8);ctx.restore();
      });
      const count=w<760?28:62;
      for(let i=0;i<count;i++){
        const p=(i*.173+clock*(.012+(i%4)*.0025))%1;
        let x=((i*.618+clock*.003)%1)*w+Math.sin(clock*.31+i)*12;
        let y=(1-p)*h;
        [x,y]=driftPoint(x,y,response.current,now);
        ctx.globalAlpha=Math.sin(p*Math.PI)*(.14+(i%4)*.1);ctx.fillStyle="#ffe0a0";
        ctx.beginPath();ctx.arc(x,y,.65+(i%3)*.6,0,Math.PI*2);ctx.fill();
      }
      // Soft incense convection, confined to the lower foreground.
      ctx.save();ctx.globalCompositeOperation="screen";ctx.strokeStyle="#e1c9ad";ctx.shadowColor="#cdbca3";ctx.shadowBlur=12;
      for(let i=0;i<7;i++){
        const phase=(clock*.045+i*.143)%1,baseX=w*.76;
        ctx.globalAlpha=Math.sin(phase*Math.PI)*.07;ctx.lineWidth=2+i*.55;
        ctx.beginPath();ctx.moveTo(baseX,h*1.02);
        ctx.bezierCurveTo(baseX+Math.sin(clock*.37+i)*35,h*.91,baseX-40+Math.sin(clock*.24+i)*40,h*(.85-phase*.12),baseX+Math.sin(clock*.42+i)*55,h*(.91-phase*.31));ctx.stroke();
      }
      ctx.restore();scene.dataset.environmentTime=clock.toFixed(2);
    };raf=requestAnimationFrame(frame);
    const reset=()=>{previous=0;};document.addEventListener("visibilitychange",reset);
    return()=>{cancelAnimationFrame(raf);observer.disconnect();photo.onload=null;document.removeEventListener("visibilitychange",reset);};
  },[active,paused,response]);
  return <section id="the-sultans" ref={root} className={`sultans-gallery${active?" is-active":""}`} aria-labelledby="sultans-title" aria-hidden={!active} inert={!active}>
    <div className="sultan-environment" aria-hidden="true">
      <LivingMaterials scene="sultans" active={active} paused={paused}/>
      <img className="sultan-photograph" src="/images/sultans-gallery.webp" alt="" decoding="async"/>
      <canvas ref={water} className="sultan-water"/>
      <div className="sultan-silk"><img src="/images/sultans-gallery.webp" alt="" decoding="async"/></div>
      <div className="sultan-reflections"/>
      <div className="sultan-color"/>
      {[0,1,2].map(i=><div key={i} className={`sultan-lantern sultan-lantern--${i}`}><img src="/images/sultan-lantern.webp" alt="" decoding="async"/><span className="sultan-lantern__emission"/></div>)}
      <canvas ref={atmosphere} className="sultan-atmosphere"/>
    </div>
    <div className="sultans-copy">
      <p className="sultans-eyebrow">Gallery 03 <span/> Woods · Resins</p>
      <h2 id="sultans-title" tabIndex={-1}><span>The</span> Sultans</h2>
      <p>Sandalwood, amber, resins and oud.<br/>An opulent collection with lasting presence.</p>
    </div>
    <div className="sultan-footer"><span>Where richness reigns.</span><span>03 / The Sultans</span></div>
  <RoomPortal room="sultans" active={active} paused={paused}/>
  </section>;
}
