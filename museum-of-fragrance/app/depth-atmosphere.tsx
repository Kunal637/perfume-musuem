"use client";

import { useEffect, useRef } from "react";

type Mote = { x: number; y: number; z: number; phase: number; speed: number };

/** Only atmosphere is drawn to this small transparent canvas. Architectural
 * photography stays at native image resolution in the compositor. */
export function DepthAtmosphere({paused}: {paused: boolean}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const foliageRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  useEffect(() => {
    const canvas = canvasRef.current;
    const foliage = foliageRef.current;
    if (!canvas || !foliage) return;
    const ctx = canvas.getContext("2d",{alpha:true});
    if (!ctx) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const journey = canvas.closest<HTMLElement>(".museum-journey");
    const leaves = Array.from(foliage.querySelectorAll<HTMLImageElement>("img"));
    const trajectories = leaves.map((element,i) => {
      const duration=13+(i%4)*2;
      return {element,age:((i*.137+.08)%1)*duration,duration,
        y:18+(i%7)*9,phase:i*1.7,near:i%3===0};
    });
    const motes: Mote[] = Array.from({length:56},(_,i) => ({x:Math.random(),y:Math.random(),z:.15+Math.random()*.85,phase:i*1.7,speed:.003+Math.random()*.006}));
    // Indoor dust follows slow convection, separate from outdoor wind.
    const atriumDust: Mote[] = Array.from({length:108},(_,i) => ({x:Math.random(),y:Math.random(),z:.15+Math.random()*.85,phase:i*2.39,speed:.014+Math.random()*.012}));

    // A small, cached fractal density field. It costs no download and gives
    // fog irregular structure instead of a stack of uniform CSS ellipses.
    const fog = document.createElement("canvas");
    fog.width=256; fog.height=96;
    const fctx=fog.getContext("2d")!;
    const pixels=fctx.createImageData(fog.width,fog.height);
    const hash=(x:number,y:number) => {const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};
    const noise=(x:number,y:number) => {
      const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;
      const sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);
      const a=hash(ix,iy)*(1-sx)+hash(ix+1,iy)*sx;
      const b=hash(ix,iy+1)*(1-sx)+hash(ix+1,iy+1)*sx;
      return a*(1-sy)+b*sy;
    };
    for(let y=0;y<96;y++)for(let x=0;x<256;x++){
      const n=noise(x/35,y/19)*.55+noise(x/17,y/9)*.3+noise(x/7,y/4)*.15;
      const edge=Math.sin(x/256*Math.PI)*Math.pow(Math.sin(y/96*Math.PI),1.8);
      const i=(y*256+x)*4;
      pixels.data[i]=184; pixels.data[i+1]=202; pixels.data[i+2]=207;
      pixels.data[i+3]=Math.max(0,n-.3)*edge*170;
    }
    fctx.putImageData(pixels,0,0);
    let w=1,h=1,raf=0,clock=0,previous=0,last=0,visible=true;
    const resize=()=>{w=canvas.clientWidth;h=canvas.clientHeight;const ratio=w<760?.7:1;canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);};
    const observer=new ResizeObserver(resize); observer.observe(canvas); resize();
    const visibility=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;previous=0;last=0;});visibility.observe(canvas);
    const resetTime=()=>{previous=0;last=0;};document.addEventListener("visibilitychange",resetTime);
    const frame=(now:number)=>{
      raf=requestAnimationFrame(frame);
      const dt=previous?(now-previous)/1000:0; previous=now;
      if(document.hidden||!visible||pausedRef.current||reduced.matches){last=now;return;}
      clock+=dt;
      if(now-last<33)return;
      const step=last?(now-last)/1000:0;last=now;
      const progress=Number(journey?.style.getPropertyValue("--scroll")||0);
      const inside=Math.max(0,Math.min(1,(progress-.56)/.18));
      ctx.clearRect(0,0,w,h);
      for(let i=0;i<3;i++){
        const near=i===2;
        if(near&&w<760)continue;
        const drift=((clock*(near?16:7)+i*w*.39)%(w*1.7))-w*.45;
        ctx.globalAlpha=(1-inside)*(near?.65:.75);
        ctx.drawImage(fog,drift,near?h*.76:h*(.18+i*.12),w*1.2,h*(near?.26:.14));
      }
      for(const mote of motes){
        mote.x+=step*mote.speed*(1+mote.z*2);mote.y-=step*mote.speed*.7;
        if(mote.x>1.05){mote.x=-.03;mote.y=.3+Math.random()*.7;}
        if(mote.y<0)mote.y=1;
        const x=mote.x*w+Math.sin(clock*.6+mote.phase)*8*mote.z;
        const y=mote.y*h+Math.sin(clock*.8+mote.phase)*4;
        ctx.globalAlpha=(.12+.24*mote.z)*(1-inside);
        ctx.fillStyle="#e4dfcb";ctx.beginPath();ctx.arc(x,y,.5+mote.z,0,Math.PI*2);ctx.fill();
      }
      if(inside>0)for(const [i,mote] of atriumDust.entries()){
        if(w<760&&i>39)break;
        mote.y-=step*mote.speed;
        mote.x+=Math.sin(clock*.13+mote.phase)*step*.002;
        if(mote.y<-.02)mote.y=1.02;
        const x=mote.x*w+Math.sin(clock*.35+mote.phase)*24*mote.z;
        const y=mote.y*h+Math.sin(clock*.31+mote.phase)*6;
        const inLight=.5+.5*Math.pow(Math.sin(mote.x*9+clock*.08),2);
        const clearCopy=mote.x>.22&&mote.x<.78&&mote.y>.38&&mote.y<.67?.45:1;
        ctx.globalAlpha=inside*(.3+.5*mote.z)*inLight*clearCopy;
        ctx.fillStyle="#f5e4bb";
        const radius=.65+mote.z*(i%6===0?3:1.7);
        ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill();
      }
      for(const leaf of trajectories){
        leaf.age+=step;
        if(leaf.age>leaf.duration){
          leaf.age=-Math.random()*2;
          leaf.y=18+Math.random()*54;
          leaf.duration=13+Math.random()*6;
        }
        const p=leaf.age/leaf.duration;
        const presence=1-inside;
        if(p<0||presence<.01){leaf.element.style.opacity="0";continue;}
        const fade=Math.min(1,p*8,(1-p)*7)*presence;
        const x=-.12+p*1.3;
        const y=leaf.y+Math.sin(p*5+leaf.phase)*9+p*16;
        const z=leaf.near?Math.sin(p*Math.PI)*240-120:-180;
        leaf.element.style.opacity=(fade*.88).toFixed(3);
        const turn=350;
        const tilt=p*turn*1.5;
        leaf.element.style.transform=`translate3d(${(x*w).toFixed(1)}px,${(y*h/100).toFixed(1)}px,${z.toFixed(1)}px) rotateZ(${(p*turn+leaf.phase*30).toFixed(1)}deg) rotateY(${tilt.toFixed(1)}deg) rotateX(${(Math.sin(p*9)*35).toFixed(1)}deg)`;
      }
      canvas.dataset.environmentTime=clock.toFixed(2);
    };
    raf=requestAnimationFrame(frame);
    return()=>{cancelAnimationFrame(raf);observer.disconnect();visibility.disconnect();document.removeEventListener("visibilitychange",resetTime);};
  },[]);
  return <>
    <canvas ref={canvasRef} className="depth-atmosphere" aria-hidden="true" />
    <div className="flying-foliage" ref={foliageRef} aria-hidden="true">
      {Array.from({length:8},(_,i)=><img key={`leaf-${i}`} src="/images/wind-leaf.webp" alt="" className="flying-leaf" data-environment="exterior" data-mobile-hidden={i>4||undefined} style={{width:22+(i%4)*6}} />)}
      {Array.from({length:2},(_,i)=><img key={`garden-petal-${i}`} src="/images/ivory-petal.webp" alt="" className="flying-leaf flying-petal" data-environment="exterior" data-mobile-hidden={i>0||undefined} style={{width:20+i*10}} />)}
    </div>
  </>;
}
