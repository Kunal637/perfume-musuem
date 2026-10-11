"use client";
import {useEffect,useRef} from "react";
import {LivingMaterials} from "./living-materials";
import {driftPoint,responseStrength,useRoomResponse} from "./room-response";

/** The guest is photographed in the room. No cutout portrait or floating chair. */
export function TobaccoGallery({active,paused}:{active:boolean;paused:boolean}){
 const root=useRef<HTMLElement>(null),air=useRef<HTMLCanvasElement>(null),clock=useRef(0);
 const response=useRoomResponse(root,"tobacco",active,paused);
 useEffect(()=>{
  const scene=root.current,canvas=air.current;if(!scene||!canvas||!active||paused)return;
  const ctx=canvas.getContext("2d");if(!ctx)return;
  let w=1,h=1,raf=0,last=0,previous=0,draw=-1;
  const resize=()=>{w=canvas.clientWidth;h=canvas.clientHeight;canvas.width=w;canvas.height=h;};const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
  const frame=(now:number)=>{
   raf=requestAnimationFrame(frame);if(document.hidden||paused){previous=0;return;}clock.current+=previous?Math.min(.08,(now-previous)/1000):0;previous=now;if(now-last<33)return;last=now;
   const t=clock.current,s=Math.max(w/1600,h/900),ox=(w-1600*s)*(w<1100?.82:.5),oy=(h-900*s)*.5;
   scene.dataset.environmentTime=t.toFixed(2);scene.style.setProperty("--tobacco-light",String(.2+Math.sin(t*.51)*.1));
   ctx.clearRect(0,0,w,h);ctx.save();ctx.translate(ox,oy);ctx.scale(s,s);
   const phase=t%12,inhale=Math.pow(Math.max(0,Math.sin(phase/3*Math.PI)),4)*(phase<3?1:0);
   if(phase>.5&&draw!==Math.floor(t/12)){draw=Math.floor(t/12);window.dispatchEvent(new Event("museum-tobacco-draw"));}
   const responsePower=responseStrength(response.current,now);
   [[1038,423,6,.28+inhale*.7],[399,688,6,.3+Math.sin(t*1.5)*.12],[100,20,42,.27+Math.sin(t*.87)*.13],[106,211,20,.32+Math.sin(t*1.1)*.14]].forEach(([x,y,r,a])=>{
    const ember=a+(x===1038?responsePower*.2:0);
    const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(255,193,108,${ember})`);g.addColorStop(.22,`rgba(255,112,39,${ember*.6})`);g.addColorStop(1,"rgba(255,163,72,0)");ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
   });ctx.restore();
   for(let i=0;i<(w<760?42:85);i++){const d=i%3,p=(i*.173+t*(.019+d*.008))%1;let x=p*w,y=((i*.618)%1)*h+Math.sin(t*.7+i)*15;[x,y]=driftPoint(x,y,response.current,now);ctx.globalAlpha=Math.sin(p*Math.PI)*(.22+d*.1);ctx.fillStyle="#f8dbaa";ctx.beginPath();ctx.arc(x,y,.65+d*.65,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
  };raf=requestAnimationFrame(frame);return()=>{cancelAnimationFrame(raf);observer.disconnect();};
 },[active,paused,response]);
 return <section ref={root} id="the-tobacco-shop" className={`tobacco-gallery${active?" is-active":""}`} aria-labelledby="tobacco-title" aria-hidden={!active} inert={!active}>
  <div className="tobacco-environment" aria-hidden="true"><img className="tobacco-photograph" src="/images/tobacco-shop-living.webp" alt="" decoding="async"/><LivingMaterials scene="tobacco" active={active} paused={paused}/><div className="tobacco-sunlight"/><div className="tobacco-tone"/></div>
  <canvas ref={air} className="tobacco-atmosphere" aria-hidden="true"/>
  <div className="tobacco-copy"><p className="tobacco-eyebrow">Gallery 10 <span/> Tobacco · Leather · Smoke</p><h2 id="tobacco-title" tabIndex={-1}><span>The</span>Tobacco<br/><em>Shop</em></h2><p>Golden leaf. Worn leather. A slow curl of smoke.<br/>Fragrances with a story that lingers.</p></div>
  <div className="tobacco-footer"><span>The last room. A lasting impression.</span><span>10 / The Tobacco Shop</span></div>
 </section>;
}
