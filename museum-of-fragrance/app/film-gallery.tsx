"use client";

import {useEffect,useRef} from "react";

/**
 * Shared scroll-scrubbed film gallery (used by the Souk and the Sultans).
 * A numbered WebP frame sequence (<dir>/001.webp ...) is drawn to a canvas and scrubbed by --room-progress,
 * which museum-entrance.tsx sets across the room's runway. Frames load coarse-to-fine so scrubbing works at once,
 * and are cached per directory so revisiting a room never reloads them. Four text moments fade in and out.
 */

export type FilmSpec={
  sectionId:string;        // e.g. "the-souk"
  className:string;        // gallery class that owns position/transition, e.g. "souk-gallery"
  titleId:string;          // heading id used by aria-labelledby
  dir:string;              // e.g. "/souk-frames"
  count:number;            // number of frames
  label:string;            // "Gallery 06"
  heading:string;          // "THE SOUK"
  sub:string;
  lineA:string;            // second moment
  caps:string;             // third moment (note list)
  lineEnd:string;          // closing moment
  loading:string;          // "Entering the souk"
  preload?:boolean;        // start loading frames shortly after page load (use for the first gallery)
  ranges:readonly [readonly [number,number],readonly [number,number],readonly [number,number],readonly [number,number]];
};

type Cache={frames:(HTMLImageElement|undefined)[];loaded:boolean[];started:boolean};
const caches=new Map<string,Cache>();
const cacheFor=(spec:FilmSpec)=>{
  let cache=caches.get(spec.dir);
  if(!cache){cache={frames:new Array(spec.count),loaded:new Array(spec.count).fill(false),started:false};caches.set(spec.dir,cache);}
  return cache;
};

function startLoading(spec:FilmSpec,cache:Cache){
  if(cache.started)return;cache.started=true;
  const order:number[]=[];const seen=new Set<number>();
  for(const step of [8,4,2,1])for(let i=0;i<spec.count;i+=step)if(!seen.has(i)){seen.add(i);order.push(i);}
  if(!seen.has(spec.count-1))order.push(spec.count-1);
  let next=0;
  const worker=async()=>{
    while(next<order.length){
      const index=order[next++];
      const image=new Image();image.decoding="async";cache.frames[index]=image;
      await new Promise<void>(resolve=>{
        image.onload=()=>{cache.loaded[index]=true;resolve();};image.onerror=()=>resolve();
        image.src=`${spec.dir}/${String(index+1).padStart(3,"0")}.webp`;
      });
    }
  };
  for(let i=0;i<6;i++)void worker();
}

const nearestLoaded=(cache:Cache,count:number,frame:number)=>{
  for(let d=0;d<count;d++){
    const before=frame-d,after=frame+d;
    if(before>=0&&cache.loaded[before])return before;
    if(after<count&&cache.loaded[after])return after;
  }
  return -1;
};
const ramp=(p:number,a:number,b:number)=>{const f=.05;return p<a||p>b?0:Math.min(1,(p-a)/f,(b-p)/f);};

export function FilmGallery({spec,active,paused}:{spec:FilmSpec;active:boolean;paused:boolean}){
  const root=useRef<HTMLElement>(null),canvas=useRef<HTMLCanvasElement>(null);
  const beatEls=useRef<(HTMLDivElement|null)[]>([]);
  const pausedRef=useRef(paused);pausedRef.current=paused;

  useEffect(()=>{
    if(!spec.preload)return;
    const idle=(window as unknown as {requestIdleCallback?:(cb:()=>void,o?:{timeout:number})=>number}).requestIdleCallback;
    const run=()=>startLoading(spec,cacheFor(spec));
    const handle=idle?idle(run,{timeout:3000}):window.setTimeout(run,1500);
    return()=>{if(!idle)window.clearTimeout(handle);};
  },[spec]);

  useEffect(()=>{
    if(!active)return;
    const scene=root.current,cv=canvas.current;if(!scene||!cv)return;
    const ctx=cv.getContext("2d");if(!ctx)return;
    const cache=cacheFor(spec);startLoading(spec,cache);
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
      const image=cache.frames[index];if(!image||!image.complete||!image.naturalWidth)return false;
      const cw=cv.width,ch=cv.height,s=Math.max(cw/image.naturalWidth,ch/image.naturalHeight);
      const iw=image.naturalWidth*s,ih=image.naturalHeight*s;
      ctx.drawImage(image,(cw-iw)/2,(ch-ih)/2,iw,ih);return true;
    };

    const frame=()=>{
      raf=requestAnimationFrame(frame);
      if(document.hidden||!sized)return;
      const progress=Math.min(1,Math.max(0,parseFloat(journey?.style.getPropertyValue("--room-progress")||"0")||0));
      const target=progress*(spec.count-1);
      if(cur<0)cur=target;
      cur+=(target-cur)*(reduce||pausedRef.current?1:.14);
      if(Math.abs(target-cur)<.01)cur=target;
      const wanted=nearestLoaded(cache,spec.count,Math.round(cur));
      if(wanted>=0&&wanted!==drawn&&draw(wanted)){drawn=wanted;if(scene.dataset.film!=="ready")scene.dataset.film="ready";}
      spec.ranges.forEach(([a,b],i)=>{
        const el=beatEls.current[i];if(!el)return;
        const o=Math.round(ramp(cur/(spec.count-1),a,b)*100)/100;
        if(o===lastOpacity[i])return;lastOpacity[i]=o;
        el.style.opacity=String(o);el.style.setProperty("--beat-shift",`${((1-o)*18).toFixed(1)}px`);
      });
    };
    raf=requestAnimationFrame(frame);
    return()=>{cancelAnimationFrame(raf);observer.disconnect();};
  },[active,spec]);

  return <section id={spec.sectionId} ref={root} className={`${spec.className} film-gallery${active?" is-active":""}`} aria-labelledby={spec.titleId} aria-hidden={!active} inert={!active}>
    <canvas ref={canvas} className="film-canvas" aria-hidden="true"/>
    <div className="film-shade" aria-hidden="true"/>
    <div className="film-grain" aria-hidden="true"/>
    <div className="film-loading" aria-hidden="true"><span>{spec.loading}</span><i/></div>
    <div className="film-beat film-beat--title" ref={el=>{beatEls.current[0]=el;}}>
      <span className="film-label">{spec.label}</span>
      <h2 id={spec.titleId} tabIndex={-1}>{spec.heading}</h2>
      <p className="film-sub">{spec.sub}</p>
    </div>
    <div className="film-beat film-beat--center" ref={el=>{beatEls.current[1]=el;}}><p className="film-line">{spec.lineA}</p></div>
    <div className="film-beat film-beat--center" ref={el=>{beatEls.current[2]=el;}}><p className="film-caps">{spec.caps}</p></div>
    <div className="film-beat film-beat--end" ref={el=>{beatEls.current[3]=el;}}><p className="film-line film-line--end">{spec.lineEnd}</p></div>
  </section>;
}
