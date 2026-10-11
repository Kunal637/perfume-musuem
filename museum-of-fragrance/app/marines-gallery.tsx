"use client";

import {useEffect,useRef} from "react";
import {MarineWater} from "./marine-water";
import {responseStrength,useRoomResponse,driftPoint} from "./room-response";

export function MarinesGallery({active,paused}:{active:boolean;paused:boolean}){
  const root=useRef<HTMLElement>(null),spray=useRef<HTMLCanvasElement>(null);
  const response=useRoomResponse(root,"marines",active,paused);
  useEffect(()=>{
    if(!active||paused)return;
    const scene=root.current,canvas=spray.current;if(!scene||!canvas)return;
    const ctx=canvas.getContext("2d");if(!ctx)return;
    let w=1,h=1,raf=0,previous=0,last=0,clock=0;
    const resize=()=>{w=canvas.clientWidth;h=canvas.clientHeight;canvas.width=w;canvas.height=h;};
    const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
    const drops=Array.from({length:48},(_,i)=>({phase:i*.73,x:(i*.618)%1,size:.7+(i%4)*.5}));
    const frame=(now:number)=>{
      raf=requestAnimationFrame(frame);const dt=previous?(now-previous)/1000:0;previous=now;
      if(document.hidden)return;
      clock+=dt;if(now-last<33)return;last=now;
      const responsePower=responseStrength(response.current,now);
      const responseX=(response.current.x/w-.5)*28*responsePower;
      const responseY=(response.current.y/h-.5)*14*responsePower;
      scene.style.setProperty("--swell-x",`${(Math.sin(clock*.49)*18+responseX).toFixed(2)}px`);
      scene.style.setProperty("--swell-y",`${(Math.sin(clock*.83)*13+responseY).toFixed(2)}px`);
      scene.style.setProperty("--swell-turn",`${(Math.sin(clock*.37)*.7+responsePower*.35).toFixed(2)}deg`);
      ctx.clearRect(0,0,w,h);
      for(const [i,drop] of drops.entries()){
        if(w<760&&i>23)break;
        const p=(clock*.16+drop.phase)%1;
        let x=(drop.x+p*.065)*w;
        let y=h*(.94-Math.sin(p*Math.PI)*(.12+drop.x*.16));
        [x,y]=driftPoint(x,y,response.current,now);
        ctx.globalAlpha=Math.sin(p*Math.PI)*.5;
        ctx.fillStyle="#e3ffff";ctx.beginPath();ctx.ellipse(x,y,drop.size*.65,drop.size*(1+p),-.3,0,Math.PI*2);ctx.fill();
      }
      scene.dataset.environmentTime=clock.toFixed(2);
    };raf=requestAnimationFrame(frame);
    const reset=()=>{previous=0;};document.addEventListener("visibilitychange",reset);
    return()=>{cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener("visibilitychange",reset);};
  },[active,paused,response]);
  return <section id="the-marines" ref={root} className={`marines-gallery${active?" is-active":""}`} aria-labelledby="marines-title" aria-hidden={!active} inert={!active}>
    <div className="marine-environment" aria-hidden="true">
      <img className="marine-photograph" src="/images/marines-gallery.webp" alt="" decoding="async"/>
      <MarineWater active={active} paused={paused}/>
      <div className="marine-color"/>
      <img className="marine-wave marine-wave--far" src="/images/marines-wave.webp" alt="" decoding="async"/>
      <img className="marine-wave marine-wave--near" src="/images/marines-wave.webp" alt="" decoding="async"/>
      <canvas className="marine-spray" ref={spray}/>
    </div>
    <div className="marines-copy">
      <p className="marines-eyebrow">Gallery 01 <span/> Salty · Aquatic</p>
      <h2 id="marines-title" tabIndex={-1}><span>The</span> Marines</h2>
      <p className="marines-description">An extraordinary collection of aquatic fragrances.<br/>For those who belong to the sea.</p>
    </div>
    <div className="marine-footer"><span>Sea salt. Mineral air. Endless blue.</span><span>01 / The Marines</span></div>
  </section>;
}
