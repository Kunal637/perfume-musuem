"use client";

import {useRoomResponse,driftPoint,responseStrength} from "./room-response";

import {LivingMaterials} from "./living-materials";

import {useCallback,useEffect,useRef,useState} from "react";

import {AmberBottle3D} from "./amber-bottle-3d";

export function AmberGallery({active,paused}:{active:boolean;paused:boolean}){
  const root=useRef<HTMLElement>(null),air=useRef<HTMLCanvasElement>(null);
  const response=useRoomResponse(root,"amber",active,paused);
  const [gl,setGl]=useState(false);
  const onGl=useCallback((ready:boolean)=>setGl(ready),[]);

  useEffect(()=>{
    if(!active||paused)return;
    const scene=root.current,canvas=air.current;if(!scene||!canvas)return;
    const ctx=canvas.getContext("2d");if(!ctx)return;
    let w=1,h=1,clock=0,previous=0,last=0,raf=0;
    const resize=()=>{
      w=canvas.clientWidth;h=canvas.clientHeight;canvas.width=w;canvas.height=h;
      const scale=Math.max(w/1672,h/941),ox=(w-1672*scale)*(w<760?.82:1),oy=(h-941*scale)*.5;
      scene.style.setProperty("--amber-scale",String(scale));
      scene.style.setProperty("--couple-x",`${(w<760?1365:1180)*scale+ox}px`);
      scene.style.setProperty("--couple-y",`${(w<760?610:560)*scale+oy}px`);
    };
    const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
    const frame=(now:number)=>{
      raf=requestAnimationFrame(frame);const dt=previous?(now-previous)/1000:0;previous=now;
      if(document.hidden)return;
      clock+=dt;if(now-last<33)return;last=now;
      const scale=Math.max(w/1672,h/941),ox=(w-1672*scale)*(w<760?.82:1),oy=(h-941*scale)*.5;
      scene.style.setProperty("--amber-sway",`${(Math.sin(clock*.69)*1.15+Math.sin(clock*.23)*.3).toFixed(3)}deg`);
      scene.style.setProperty("--amber-turn",(1+Math.sin(clock*.34)*.016).toFixed(4));
      scene.style.setProperty("--amber-spill",(.4+Math.sin(clock*.29)*.13+Math.sin(clock*.61)*.05).toFixed(3));
      scene.style.setProperty("--amber-sweep",`${(Math.sin(clock*.18)*9).toFixed(3)}deg`);
      ctx.clearRect(0,0,w,h);ctx.save();ctx.setTransform(scale,0,0,scale,ox,oy);
      // Emission and spill are tied to actual photographed lamp locations.
      [[47,351,7],[258,389,5],[392,375,8],[556,408,4],[600,405,4],[644,354,5],[735,366,4],[811,275,7],[910,284,7],[1139,270,8],[1470,407,10],[1652,749,13],[266,603,11]].forEach(([x,y,r],i)=>{
        const glow=.55+Math.sin(clock*(.94+i*.21)+i*1.7)*.19+Math.sin(clock*(2.17+i*.13)+i)*.08;
        ctx.globalCompositeOperation="source-over";ctx.globalAlpha=(1-glow)*.4;ctx.fillStyle="#643217";ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
        ctx.globalCompositeOperation="screen";ctx.globalAlpha=glow;const g=ctx.createRadialGradient(x,y,0,x,y,r*6);
        g.addColorStop(0,"#ffefb0dd");g.addColorStop(.2,"#ffc66a77");g.addColorStop(1,"#ffb14800");ctx.fillStyle=g;ctx.fillRect(x-r*6,y-r*6,r*12,r*12);
      });
      // Feathered stage light moves through haze without hard cone edges.
      for(let i=0;i<3;i++){
        ctx.save();ctx.translate(1140+i*180,190);ctx.rotate(Math.sin(clock*(.29+i*.047)+i)*.2+responseStrength(response.current,now)*(response.current.x/w-.5)*.35);
        ctx.scale(90,430);const g=ctx.createRadialGradient(0,.45,0,0,.45,1);
        g.addColorStop(0,"#ffcc8a29");g.addColorStop(.6,"#ffe2a412");g.addColorStop(1,"#ffe2a400");
        ctx.globalAlpha=.7+Math.sin(clock*.41+i)*.2;ctx.fillStyle=g;ctx.fillRect(-1,-.55,2,2);ctx.restore();
      }
      ctx.restore();
      const count=w<760?44:96;
      for(let i=0;i<count;i++){
        const depth=(i%6)/5,p=(i*.173+clock*(.01+depth*.012))%1;
        let x=((i*.618+clock*(.0018+depth*.002))%1)*w+Math.sin(clock*.25+i)*20;
        let y=(1-p)*h+Math.sin(clock*.31+i)*12;
        [x,y]=driftPoint(x,y,response.current,now);
        ctx.globalAlpha=Math.sin(p*Math.PI)*(.12+depth*.34);ctx.fillStyle=i%4?"#ffd99a":"#dcffed";ctx.beginPath();ctx.arc(x,y,.6+depth*1.35,0,Math.PI*2);ctx.fill();
      }
      scene.dataset.environmentTime=clock.toFixed(2);
    };raf=requestAnimationFrame(frame);
    const reset=()=>{previous=0;};document.addEventListener("visibilitychange",reset);
    return()=>{cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener("visibilitychange",reset);};
  },[active,paused,response]);
  return <section id="amber-lounge" ref={root} className={`amber-gallery${active?" is-active":""}`} aria-labelledby="amber-title" aria-hidden={!active} inert={!active}>
    <div className="amber-environment" aria-hidden="true">
      <LivingMaterials scene="amber" active={active} paused={paused}/>
      <img className="amber-photograph" src="/images/amber-lounge-living.webp" alt="" decoding="async"/>
      <div className="amber-lightwash"/>
      <div className="amber-shade"/><canvas ref={air} className="amber-atmosphere"/>
    </div>
    <div className="amber-portal" data-gl={gl?"ready":"fallback"}>
      <div className="amber-portal__veil" aria-hidden="true"/>
      <AmberBottle3D active={active} paused={paused} onReady={onGl}/>
      <div className="amber-portal__bottle" aria-hidden="true">
        <i className="amber-portal__cap"/><i className="amber-portal__neck"/>
        <div className="amber-portal__glass">
          <i className="amber-portal__liquid"/><i className="amber-portal__drop"/><i className="amber-portal__shine"/>
        </div>
      </div>
    </div>
    <div className="amber-copy">
      <p className="amber-eyebrow">Gallery 05 <span/> Amber · Warmth</p>
      <h2 id="amber-title" tabIndex={-1}><span>The</span> Amber<br/>Lounge</h2>
      <p>Golden resins. Velvet warmth.<br/>Amber fragrances with an after-hours soul.</p>
    </div>
    <div className="amber-footer"><span>Stay for one more song.</span><span>05 / Amber Lounge</span></div>
  </section>;
}
