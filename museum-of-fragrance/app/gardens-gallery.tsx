"use client";

import {useRoomResponse,driftPoint} from "./room-response";

import {LivingMaterials} from "./living-materials";

import {useEffect,useRef} from "react";

export function GardensGallery({active,paused}:{active:boolean;paused:boolean}){
  const root=useRef<HTMLElement>(null),dust=useRef<HTMLCanvasElement>(null);
  const response=useRoomResponse(root,"gardens",active,paused);

  useEffect(()=>{
    if(!active||paused)return;
    const scene=root.current,canvas=dust.current;if(!scene||!canvas)return;
    const ctx=canvas.getContext("2d");if(!ctx)return;
    const seeds=[...scene.querySelectorAll<HTMLElement>(".garden-seed")],butterflies=[...scene.querySelectorAll<HTMLElement>(".garden-butterfly")];
    const petals=[...scene.querySelectorAll<HTMLElement>(".garden-petal")];
    let w=1,h=1,clock=0,previous=0,last=0,raf=0;
    const resize=()=>{w=canvas.clientWidth;h=canvas.clientHeight;canvas.width=w;canvas.height=h;};
    const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
    const frame=(now:number)=>{
      raf=requestAnimationFrame(frame);const dt=previous?(now-previous)/1000:0;previous=now;
      if(document.hidden)return;
      clock+=dt;if(now-last<33)return;last=now;
      scene.style.setProperty("--garden-breeze",`${(Math.sin(clock*.47)*.28+Math.sin(clock*.81)*.09).toFixed(3)}deg`);
      scene.style.setProperty("--garden-breeze-far",`${(Math.sin(clock*.36+2)*.24).toFixed(3)}deg`);
      scene.style.setProperty("--garden-light",(.45+Math.sin(clock*.17)*.13+Math.sin(clock*.39)*.06).toFixed(3));
      scene.style.setProperty("--garden-sun-x",`${(Math.sin(clock*.12)*22).toFixed(2)}px`);
      seeds.forEach((seed,i)=>{
        const p=(clock*(.018+(i%4)*.003)+i*.137)%1;
        let x=(-.12+p*1.25)*w,y=(.13+((i*.173)% .76))*h+Math.sin(clock*.73+i)*h*.045-p*h*.14;
        [x,y]=driftPoint(x,y,response.current,now);
        seed.style.transform=`translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${i%3*35}px) rotate(${(Math.sin(clock*.8+i)*37-18).toFixed(1)}deg)`;
        seed.style.opacity=(Math.min(1,p*8,(1-p)*8)*(.45+i%3*.18)).toFixed(2);
      });
      // Separate photographed petals fall through near and middle distance.
      // The flower beds and conservatory remain completely stationary.
      petals.forEach((petal,i)=>{
        const p=(clock*(.014+i*.004)+i*.31)%1;
        const x=w*(.18+i*.32)+Math.sin(clock*.27+i)*w*.06+p*w*.06;
        const y=(-.12+p*1.25)*h;
        petal.style.transform=`translate3d(${x}px,${y}px,0) rotate(${p*230+i*73}deg) rotateY(${Math.sin(clock*.9+i)*45}deg)`;
        petal.style.opacity=String(Math.min(1,p*10,(1-p)*10)*(.45+i*.13));
      });
      butterflies.forEach((butterfly,i)=>{
        const p=(clock*(.035+i*.003)+i*.27)%1;
        let x=(i%2?1.15-p*1.3:-.15+p*1.3)*w;
        let y=h*(.35+i*.13)+Math.sin(p*Math.PI*3+i)*h*.12+Math.sin(clock*1.4+i)*10;
        [x,y]=driftPoint(x,y,response.current,now);
        butterfly.style.transform=`translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${i*35}px) rotate(${(Math.sin(clock*.7+i)*15).toFixed(1)}deg)`;
        butterfly.style.opacity=(Math.min(1,p*9,(1-p)*9)*.85).toFixed(2);
        butterfly.style.setProperty("--wing",`${(25+Math.abs(Math.sin(clock*(6+i*.3)+i))*58).toFixed(1)}deg`);
      });
      ctx.clearRect(0,0,w,h);
      const count=w<760?24:56;
      for(let i=0;i<count;i++){
        const p=(i*.137+clock*(.009+(i%5)*.002))%1;
        let x=((i*.618+clock*.007)%1)*w+Math.sin(clock*.24+i)*14,y=(1-p)*h;
        [x,y]=driftPoint(x,y,response.current,now);
        ctx.globalAlpha=(.24+(i%4)*.08)*Math.sin(p*Math.PI);ctx.fillStyle="#fff7cd";
        ctx.beginPath();ctx.arc(x,y,.65+(i%3)*.55,0,Math.PI*2);ctx.fill();
      }
      scene.dataset.environmentTime=clock.toFixed(2);
    };raf=requestAnimationFrame(frame);
    const reset=()=>{previous=0;};document.addEventListener("visibilitychange",reset);
    return()=>{cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener("visibilitychange",reset);};
  },[active,paused,response]);
  return <section id="the-gardens" ref={root} className={`gardens-gallery${active?" is-active":""}`} aria-labelledby="gardens-title" aria-hidden={!active} inert={!active}>
    <div className="garden-environment" aria-hidden="true">
      <LivingMaterials scene="gardens" active={active} paused={paused}/>
      <img className="garden-photograph" src="/images/gardens-gallery.webp" alt="" decoding="async"/>
      <div className="garden-planting garden-planting--left"><img src="/images/gardens-gallery.webp" alt="" decoding="async"/></div>
      <div className="garden-planting garden-planting--right"><img src="/images/gardens-gallery.webp" alt="" decoding="async"/></div>
      <div className="garden-sunlight"/>
      <div className="garden-color"/>
      <canvas ref={dust} className="garden-pollen"/>
      {Array.from({length:12},(_,i)=><img className={`garden-seed garden-seed--${i%3}`} key={`seed-${i}`} src="/images/garden-seed.webp" alt="" style={{width:14+(i%4)*8}} decoding="async"/>)}
      {[0,1,2].map(i=><img key={`petal-${i}`} className="garden-petal" src="/images/ivory-petal.webp" alt="" style={{width:12+i*7}} decoding="async"/>)}
      {Array.from({length:4},(_,i)=><div className="garden-butterfly" key={`butterfly-${i}`} style={{width:28+i*9,height:28+i*9}}>
        <span className="garden-wing garden-wing--left"/><span className="garden-wing garden-wing--right"/>
      </div>)}
    </div>
    <div className="gardens-copy">
      <p className="gardens-eyebrow">Gallery 02 <span/> Green · White floral</p>
      <h2 id="gardens-title" tabIndex={-1}><span>The</span> Gardens</h2>
      <p>Leafy greens. Luminous white florals.<br/>Unisex fragrances in full bloom.</p>
    </div>
    <div className="garden-footer"><span>The art of growing wild.</span><span>02 / The Gardens</span></div>
  </section>;
}
