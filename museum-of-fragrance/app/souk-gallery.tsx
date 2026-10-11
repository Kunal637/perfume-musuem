"use client";

import {useRoomResponse,driftPoint} from "./room-response";

import {LivingMaterials} from "./living-materials";

import {useEffect,useRef} from "react";

const PHOTO="/images/souk-gallery.webp";

export function SoukGallery({active,paused}:{active:boolean;paused:boolean}){
  const root=useRef<HTMLElement>(null),air=useRef<HTMLCanvasElement>(null),fabric=useRef<HTMLCanvasElement>(null);
  const response=useRoomResponse(root,"souk",active,paused);

  useEffect(()=>{
    if(!active||paused)return;
    const scene=root.current,canvas=air.current,cloth=fabric.current;if(!scene||!canvas||!cloth)return;
    const ctx=canvas.getContext("2d"),silk=cloth.getContext("2d");if(!ctx||!silk)return;
    const photo=new Image();let ready=false;photo.onload=()=>{ready=true;};photo.src=PHOTO;
    let w=1,h=1,clock=0,previous=0,last=0,raf=0;
    const resize=()=>{
      w=canvas.clientWidth;h=canvas.clientHeight;canvas.width=cloth.width=w;canvas.height=cloth.height=h;
      const scale=Math.max(w/1672,h/941),ox=(w-1672*scale)*(w<760?.65:.5),oy=(h-941*scale)*.5;
      scene.style.setProperty("--souk-scale",String(scale));
      scene.style.setProperty("--muse-x",`${(w<760?1100:1050)*scale+ox}px`);
      scene.style.setProperty("--muse-y",`${790*scale+oy}px`);
    };
    const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
    const frame=(now:number)=>{
      raf=requestAnimationFrame(frame);const dt=previous?(now-previous)/1000:0;previous=now;
      if(document.hidden)return;
      clock+=dt;if(now-last<33)return;last=now;
      const scale=Math.max(w/1672,h/941),ox=(w-1672*scale)*(w<760?.65:.5),oy=(h-941*scale)*.5;
      scene.style.setProperty("--souk-sway",`${(Math.sin(clock*.52)*.55+Math.sin(clock*.83)*.18).toFixed(3)}deg`);
      scene.style.setProperty("--souk-silk",`${(Math.sin(clock*.87)*1.6).toFixed(3)}px`);
      scene.style.setProperty("--souk-light",(.16+Math.sin(clock*.24)*.055).toFixed(3));
      if(ready){
        silk.clearRect(0,0,w,h);silk.save();silk.setTransform(scale,0,0,scale,ox,oy);
        // Move the hanging blue silk, leaving stone, ropes and camel sharp.
        silk.beginPath();silk.moveTo(1480,0);silk.lineTo(1672,0);silk.lineTo(1672,941);silk.lineTo(1510,941);silk.lineTo(1560,405);silk.lineTo(1555,280);silk.closePath();silk.clip();
        for(let y=0;y<941;y+=4){const flow=(Math.sin(y*.013-clock*1.14)*1.8+Math.sin(y*.029+clock*.61)*.6)*Math.sin(y/941*Math.PI);silk.drawImage(photo,1460,y,212,4,1460+flow,y,212,4);}
        silk.restore();
        // A separate awning patch bends around its upper suspension point.
        silk.save();silk.setTransform(scale,0,0,scale,ox,oy);silk.beginPath();silk.moveTo(1090,0);silk.lineTo(1455,0);silk.lineTo(1480,67);silk.lineTo(1375,82);silk.lineTo(1195,43);silk.closePath();silk.clip();
        silk.globalAlpha=.85;silk.drawImage(photo,1070,0,430,100,1070,Math.sin(clock*.75)*1.7,430,100);silk.restore();
      }
      ctx.clearRect(0,0,w,h);ctx.save();ctx.setTransform(scale,0,0,scale,ox,oy);
      // Bakhoor convection is attached to the actual brass burner.
      ctx.strokeStyle="#e4e5df";ctx.shadowColor="#e9e8e1";ctx.shadowBlur=9;
      for(let i=0;i<9;i++){
        const p=(clock*.033+i*.111)%1;ctx.globalAlpha=Math.sin(p*Math.PI)*.16;ctx.lineWidth=1.5+p*3;
        ctx.beginPath();ctx.moveTo(244,572);ctx.bezierCurveTo(244+Math.sin(clock*.64+i)*20,530,210+Math.sin(clock*.43+i)*40,555-p*165,225+Math.sin(clock*.34+i)*60,565-p*290);ctx.stroke();
      }
      ctx.shadowBlur=0;
      [[204,156,7],[1375,194,6],[1118,404,5],[901,655,5],[1425,654,5]].forEach(([x,y,r],i)=>{
        const glow=.58+Math.sin(clock*(1.23+i*.17)+i)*.2+Math.sin(clock*2.37+i*1.7)*.07;
        ctx.globalCompositeOperation="screen";ctx.globalAlpha=glow*.6;
        const g=ctx.createRadialGradient(x,y,0,x,y,r*4);g.addColorStop(0,"#ffd080bb");g.addColorStop(.2,"#ffc26155");g.addColorStop(1,"#ffb75a00");ctx.fillStyle=g;ctx.fillRect(x-r*4,y-r*4,r*8,r*8);
      });
      // Grazing sand streams stay close to the ground, never a storm.
      ctx.globalCompositeOperation="source-over";ctx.strokeStyle="#cfa06a";
      const grains=w<760?80:170;
      for(let i=0;i<grains;i++){
        const depth=(i%5)/4,p=(i*.618+clock*(.05+depth*.035))%1;
        const x=p*1750-40,y=675+(i*.173%1)*270+Math.sin(clock*.6+i)*4;
        ctx.globalAlpha=Math.sin(p*Math.PI)*(.24+depth*.23);ctx.lineWidth=.5+depth*.6;
        ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+2+depth*5,y-.4);ctx.stroke();
      }
      ctx.restore();
      for(let i=0;i<(w<760?28:60);i++){
        const p=(i*.173+clock*(.008+(i%4)*.002))%1;
        ctx.globalAlpha=Math.sin(p*Math.PI)*.32;ctx.fillStyle=i%3?"#ad783f":"#fff0bc";
        const [px,py]=driftPoint(((i*.618+clock*.013)%1)*w+Math.sin(clock*.3+i)*14,(1-p)*h,response.current,now);
        ctx.beginPath();ctx.arc(px,py,.55+(i%3)*.42,0,Math.PI*2);ctx.fill();
      }
      scene.dataset.environmentTime=clock.toFixed(2);
    };raf=requestAnimationFrame(frame);
    const reset=()=>{previous=0;};document.addEventListener("visibilitychange",reset);
    return()=>{cancelAnimationFrame(raf);observer.disconnect();photo.onload=null;document.removeEventListener("visibilitychange",reset);};
  },[active,paused,response]);
  return <section id="the-souk" ref={root} className={`souk-gallery${active?" is-active":""}`} aria-labelledby="souk-title" aria-hidden={!active} inert={!active}>
    <div className="souk-environment" aria-hidden="true">
      <LivingMaterials scene="souk" active={active} paused={paused}/>
      <img className="souk-photograph" src={PHOTO} alt="" decoding="async"/>
      <canvas ref={fabric} className="souk-fabric"/>
      <div className="souk-daylight"/>
      <canvas ref={air} className="souk-atmosphere"/>
    </div>
    <div className="souk-copy">
      <p className="souk-eyebrow">Gallery 06 <span/> Oud · Resins</p>
      <h2 id="souk-title" tabIndex={-1}><span>The</span> Souk</h2>
      <p>Precious oud. Smouldering bakhoor.<br/>Resinous treasures, carried on desert air.</p>
    </div>
    <div className="souk-footer"><span>Where the precious becomes perfume.</span><span>06 / The Souk</span></div>
  </section>;
}
