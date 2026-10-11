"use client";

import {useRoomResponse,driftPoint} from "./room-response";

import {LivingMaterials} from "./living-materials";

import { useEffect, useRef, useState } from "react";

const PHOTO = "/images/pastry-vivid.webp";
// Coordinates are authored on a 1600 × 900 photographic plate.
const CUP = { x: 188, y: 527 };
const RABBIT = { x: 1092, y: 518 };
const LAMPS = [[364,140,42],[475,196,25],[1244,112,44],[1097,278,16],[1117,281,15],[1130,307,15]];

export function PastryGallery({ active, paused }: { active: boolean; paused: boolean }) {
  const root = useRef<HTMLElement>(null), air = useRef<HTMLCanvasElement>(null);
  const clock = useRef(0), discovery = useRef(-100), [found, setFound] = useState(false);
  const dimensions = useRef({w:1,h:1,scale:1,ox:0,oy:0,rx:RABBIT.x,ry:RABBIT.y});

  const response=useRoomResponse(root,"pastry",active,paused);

  useEffect(() => {
    const scene=root.current,canvas=air.current;if(!scene||!canvas)return;
    const resize=()=>{
      const w=canvas.clientWidth,h=canvas.clientHeight,scale=Math.max(w/1600,h/900);
      const ox=(w-1600*scale)*(w<760?.65:.5),oy=(h-900*scale)*.5;
      const dpr=Math.min(window.devicePixelRatio||1,1.5);
      canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
      const rabbit=w>=760&&w<=1100?{x:1000,y:532}:RABBIT;
      dimensions.current={w,h,scale,ox,oy,rx:rabbit.x,ry:rabbit.y};
      scene.style.setProperty("--rabbit-x",`${rabbit.x*scale+ox}px`);
      scene.style.setProperty("--rabbit-y",`${rabbit.y*scale+oy}px`);
      scene.style.setProperty("--rabbit-size",`${Math.max(48,66*scale)}px`);
    };
    const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
    return()=>observer.disconnect();
  },[]);

  useEffect(() => {
    const scene=root.current,canvas=air.current;if(!scene||!canvas||!active||paused)return;
    const ctx=canvas.getContext("2d");if(!ctx)return;
    let raf=0,previous=0,last=0;
    const frame=(now:number)=>{
      raf=requestAnimationFrame(frame);
      if(document.hidden){previous=0;return;}
      const dt=previous?Math.min((now-previous)/1000,.1):0;previous=now;clock.current+=dt;
      if(now-last<33)return;last=now;
      const t=clock.current,{w,h,scale,ox,oy,rx,ry}=dimensions.current;
      const dpr=canvas.width/w;
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
      scene.dataset.environmentTime=t.toFixed(2);
      // Several unrelated rhythms avoid synchronized breathing or flashing.
      scene.style.setProperty("--pastry-light",String(.18+Math.sin(t*.17)*.07+Math.sin(t*.29)*.035));
      scene.style.setProperty("--sun-drift",`${Math.sin(t*.07)*30}px`);
      const cycle=t%11,secret=cycle>5&&cycle<7?Math.sin((cycle-5)/2*Math.PI):0;
      const since=Math.min(t-discovery.current,(t+4)%11),awake=since<1.6?Math.sin(since/1.6*Math.PI):0;
      scene.style.setProperty("--rabbit-hop",`${-Math.max(secret*.6,awake)*13}px`);
      scene.style.setProperty("--rabbit-tilt",`${secret*6+awake*Math.sin(since*13)*8}deg`);
      scene.style.setProperty("--rabbit-shadow",String(1-Math.max(secret*.6,awake)*.25));
      ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);
      // The real neon tube breathes quietly, independent of pendant lamps.
      ctx.save();ctx.globalCompositeOperation="screen";ctx.globalAlpha=.2+Math.sin(t*1.3)*.07+Math.sin(t*2.7)*.035;
      ctx.strokeStyle="#ffda88";ctx.lineWidth=3;ctx.shadowColor="#ffd080";ctx.shadowBlur=12;
      ctx.beginPath();ctx.moveTo(118,0);ctx.bezierCurveTo(87,65,113,80,153,94);ctx.bezierCurveTo(191,111,176,143,142,166);ctx.bezierCurveTo(126,181,117,194,112,204);ctx.stroke();ctx.restore();
      // Independent translucent steam ribbons rooted in the real espresso cup.
      for(let i=0;i<8;i++){
        const p=(t*.053+i*.125)%1,x=CUP.x+Math.sin(t*.7+i)*5;
        ctx.globalAlpha=Math.sin(p*Math.PI)*.2;ctx.strokeStyle="#fff9e9";ctx.lineWidth=1.5+p*3;
        ctx.beginPath();ctx.moveTo(x,CUP.y);ctx.bezierCurveTo(x-25,CUP.y-42,x+Math.sin(t*.55+i)*35,CUP.y-p*150,x+Math.sin(t*.4+i)*23,CUP.y-p*195);ctx.stroke();
      }
      // Gentle opaline emissions, with no strobe or blackouts.
      LAMPS.forEach(([x,y,r],i)=>{
        const a=.24+Math.sin(t*(.91+i*.27)+i*2)*.075+Math.sin(t*2.13+i)*.025;
        const glow=ctx.createRadialGradient(x,y,0,x,y,r*2.4);glow.addColorStop(0,"#fff0bda0");glow.addColorStop(.4,"#ffe6a338");glow.addColorStop(1,"#ffe6a300");
        ctx.globalAlpha=a;ctx.globalCompositeOperation="screen";ctx.fillStyle=glow;ctx.fillRect(x-r*2.4,y-r*2.4,r*4.8,r*4.8);
      });
      ctx.globalCompositeOperation="source-over";
      // A sugar puff when the small marshmallow is discovered.
      if(since>=0&&since<2.3){
        for(let i=0;i<24;i++){
          const angle=i*2.4,speed=20+(i%6)*8;
          ctx.globalAlpha=(1-since/2.3)*.8;ctx.fillStyle=i%3?"#fffaf0":"#9caf83";
          ctx.beginPath();ctx.arc(rx+Math.cos(angle)*speed*since,ry-35-Math.sin(angle)*speed*since+since*since*15,1.1+(i%3)*.5,0,Math.PI*2);ctx.fill();
        }
      }
      ctx.restore();
      // Sugar catches light at distinct depths; close grains cross the frame sparsely.
      for(let i=0;i<(w<760?42:92);i++){
        const depth=(i%5)/4,p=(i*.173+t*(.016+depth*.018))%1;
        let x=((i*.618+t*(.003+depth*.002))%1)*w+Math.sin(t*.39+i)*18;
        ctx.globalAlpha=Math.sin(p*Math.PI)*(.24+depth*.42);ctx.fillStyle=i%4?"#fffdf0":"#af8d69";
        const [sx,sy]=driftPoint(x,p*h,response.current,now);
        ctx.beginPath();ctx.ellipse(sx,sy,.7+depth*1.5,.6+depth,t*.2+i,0,Math.PI*2);ctx.fill();
      }
      ctx.globalAlpha=1;
    };
    raf=requestAnimationFrame(frame);return()=>cancelAnimationFrame(raf);
  },[active,paused]);

  const discover=()=>{
    if(!paused)discovery.current=clock.current;
    setFound(true);
    window.dispatchEvent(new Event("museum-pastry-discovery"));
  };

  useEffect(()=>{
    const wake=(event:Event)=>{if(active&&!paused&&(event as CustomEvent).detail==="pastry"){discovery.current=clock.current;setFound(true);}};
    window.addEventListener("museum-room-interaction",wake);return()=>window.removeEventListener("museum-room-interaction",wake);
  },[active,paused]);

  return <section ref={root} id="the-pastry-room" className={`pastry-gallery${active?" is-active":""}${paused?" is-paused":""}`} aria-labelledby="pastry-title" aria-hidden={!active} inert={!active}>
    <div className="pastry-environment" aria-hidden="true">
      <LivingMaterials scene="pastry" active={active} paused={paused}/>
      <img className="pastry-photograph" src={PHOTO} alt="" decoding="async"/>
      <div className="pastry-sunlight"/>
      <div className="pastry-glass-light"/>
    </div>
    <canvas ref={air} className="pastry-atmosphere" aria-hidden="true"/>
    <div className="pastry-copy">
      <p className="pastry-eyebrow">Gallery 07 <span/> Gourmand · Confection</p>
      <h2 id="pastry-title" tabIndex={-1}><span>The</span>Pastry<br/>Room</h2>
      <p>Spun sugar. Soft vanilla. A little indulgence.<br/>Fragrances for your sweetest memories.</p>
    </div>
    <button className="pastry-rabbit" type="button" onClick={discover} aria-label="Wake the marshmallow rabbit" title="A little sweetness">
      <img src="/images/pastry-rabbit.webp" alt="" decoding="async"/>
    </button>
    <div className="pastry-footer"><span>{found?"Some sweetness finds you back.":"An appetite for the extraordinary."}</span><span>07 / The Pastry Room</span></div>
    <span className="pastry-discovery-status" role="status">{found?"You found the marshmallow rabbit.":""}</span>
  </section>;
}
