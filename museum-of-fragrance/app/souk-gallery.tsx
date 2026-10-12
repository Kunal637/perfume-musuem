"use client";

import {useEffect,useRef} from "react";

/**
 * The Souk: a scroll-scrubbed film. 96 pre-rendered frames (public/souk-frames) run from a bottle on stone,
 * through its emblem and the amber liquid, into the lantern-lit market and out to the desert arch.
 * Progress comes from --room-progress (set by museum-entrance.tsx across this room's runway), so the film
 * scrubs forward and backward with native scroll. Frames load coarse-to-fine so scrubbing works immediately.
 */

const FRAME_COUNT=96;
const frameSrc=(index:number)=>`/souk-frames/${String(index+1).padStart(3,"0")}.webp`;

// Module-level cache so revisiting the room never reloads or re-decodes frames.
const frames:(HTMLImageElement|undefined)[]=new Array(FRAME_COUNT);
const loaded:boolean[]=new Array(FRAME_COUNT).fill(false);
let loadingStarted=false;

function startLoading(){
  if(loadingStarted)return;loadingStarted=true;
  const order:number[]=[];const seen=new Set<number>();
  for(const step of [8,4,2,1])for(let i=0;i<FRAME_COUNT;i+=step)if(!seen.has(i)){seen.add(i);order.push(i);}
  if(!seen.has(FRAME_COUNT-1))order.push(FRAME_COUNT-1);
  let next=0;
  const worker=async()=>{
    while(next<order.length){
      const index=order[next++];
      const image=new Image();image.decoding="async";frames[index]=image;
      await new Promise<void>(resolve=>{image.onload=()=>{loaded[index]=true;resolve();};image.onerror=()=>resolve();image.src=frameSrc(index);});
    }
  };
  for(let i=0;i<6;i++)void worker();
}

const nearestLoaded=(frame:number)=>{
  for(let d=0;d<FRAME_COUNT;d++){
    const before=frame-d,after=frame+d;
    if(before>=0&&loaded[before])return before;
    if(after<FRAME_COUNT&&loaded[after])return after;
  }
  return -1;
};

// Text moments, as fractions of the room's scroll. Each fades in and out over 5% of progress.
const BEATS=[[0,.17],[.26,.5],[.56,.76],[.84,1.01]] as const;
const ramp=(p:number,a:number,b:number)=>{const f=.05;return p<a||p>b?0:Math.min(1,(p-a)/f,(b-p)/f);};

export function SoukGallery({active,paused}:{active:boolean;paused:boolean}){
  const root=useRef<HTMLElement>(null),canvas=useRef<HTMLCanvasElement>(null);
  const beatEls=useRef<(HTMLDivElement|null)[]>([]);
  const pausedRef=useRef(paused);pausedRef.current=paused;

  useEffect(()=>{
    if(!active)return;
    const scene=root.current,cv=canvas.current;if(!scene||!cv)return;
    const ctx=cv.getContext("2d");if(!ctx)return;
    startLoading();
    const journey=scene.closest<HTMLElement>(".museum-journey");
    const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cur=-1,drawn=-2,raf=0,sized=false;
    const lastOpacity=[-1,-1,-1,-1];

    const resize=()=>{
      const dpr=Math.min(window.devicePixelRatio||1,2);
      const w=Math.max(1,Math.round(cv.clientWidth*dpr)),h=Math.max(1,Math.round(cv.clientHeight*dpr));
      const cap=Math.min(1,1920/w);cv.width=Math.round(w*cap);cv.height=Math.round(h*cap);
      sized=true;drawn=-2;
    };
    const observer=new ResizeObserver(resize);observer.observe(cv);resize();

    const draw=(index:number)=>{
      const image=frames[index];if(!image||!image.complete||!image.naturalWidth)return false;
      const cw=cv.width,ch=cv.height,s=Math.max(cw/image.naturalWidth,ch/image.naturalHeight);
      const iw=image.naturalWidth*s,ih=image.naturalHeight*s;
      ctx.drawImage(image,(cw-iw)/2,(ch-ih)/2,iw,ih);return true;
    };

    const frame=()=>{
      raf=requestAnimationFrame(frame);
      if(document.hidden||!sized)return;
      const progress=Math.min(1,Math.max(0,parseFloat(journey?.style.getPropertyValue("--room-progress")||"0")||0));
      const target=progress*(FRAME_COUNT-1);
      if(cur<0)cur=target;
      cur+=(target-cur)*(reduce||pausedRef.current?1:.14);
      if(Math.abs(target-cur)<.01)cur=target;
      const wanted=nearestLoaded(Math.round(cur));
      if(wanted>=0&&wanted!==drawn&&draw(wanted)){drawn=wanted;if(scene.dataset.film!=="ready")scene.dataset.film="ready";}
      BEATS.forEach(([a,b],i)=>{
        const el=beatEls.current[i];if(!el)return;
        const o=Math.round(ramp(cur/(FRAME_COUNT-1),a,b)*100)/100;
        if(o===lastOpacity[i])return;lastOpacity[i]=o;
        el.style.opacity=String(o);el.style.setProperty("--beat-shift",`${((1-o)*18).toFixed(1)}px`);
      });
    };
    raf=requestAnimationFrame(frame);
    return()=>{cancelAnimationFrame(raf);observer.disconnect();};
  },[active]);

  return <section id="the-souk" ref={root} className={`souk-gallery${active?" is-active":""}`} aria-labelledby="souk-title" aria-hidden={!active} inert={!active}>
    <canvas ref={canvas} className="souk-film" aria-hidden="true"/>
    <div className="souk-shade" aria-hidden="true"/>
    <div className="souk-grain" aria-hidden="true"/>
    <div className="souk-loading" aria-hidden="true"><span>Entering the souk</span><i/></div>
    <div className="souk-beat souk-beat--title" ref={el=>{beatEls.current[0]=el;}}>
      <span className="souk-label">Gallery 06</span>
      <h2 id="souk-title" tabIndex={-1}>THE SOUK</h2>
      <p className="souk-sub">Where the desert whispers in amber.</p>
    </div>
    <div className="souk-beat souk-beat--center" ref={el=>{beatEls.current[1]=el;}}><p className="souk-line">A world within.</p></div>
    <div className="souk-beat souk-beat--center" ref={el=>{beatEls.current[2]=el;}}><p className="souk-caps">Spice &nbsp;·&nbsp; Oud &nbsp;·&nbsp; Sand &nbsp;·&nbsp; Lantern light</p></div>
    <div className="souk-beat souk-beat--end" ref={el=>{beatEls.current[3]=el;}}><p className="souk-line souk-line--end">Step into the market.</p></div>
  </section>;
}
