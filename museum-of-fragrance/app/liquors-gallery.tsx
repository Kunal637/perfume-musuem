"use client";

import {useRoomResponse,driftPoint,responseStrength} from "./room-response";

import {LivingMaterials} from "./living-materials";

import {useEffect,useRef} from "react";

const PHOTO="/images/liquors-gallery.webp";
const LAMPS=[[1049,145,18],[926,270,12],[1005,303,10],[1042,371,8],[1045,480,12],[1315,435,13],[219,183,3],[345,292,3],[56,391,3],[230,425,3],[347,452,3],[309,598,3],[495,551,6]];
const BOTTLES=[[1130,363,12],[1205,352,14],[1235,294,11],[1260,269,13],[1480,303,15],[1532,302,16],[1580,294,12]];

export function LiquorsGallery({active,paused}:{active:boolean;paused:boolean}){
  const root=useRef<HTMLElement>(null),air=useRef<HTMLCanvasElement>(null);
  const time=useRef(0);
  const dimensions=useRef({w:1,h:1,scale:1,ox:0,oy:0});

  const response=useRoomResponse(root,"liquors",active,paused);

  useEffect(()=>{
    const scene=root.current,canvas=air.current;if(!scene||!canvas)return;
    const resize=()=>{
      const w=canvas.clientWidth,h=canvas.clientHeight,scale=Math.max(w/1600,h/900),ox=(w-1600*scale)*(w<760?.64:.5),oy=(h-900*scale)*.5;
      const dpr=Math.min(window.devicePixelRatio||1,1.5);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
      dimensions.current={w,h,scale,ox,oy};
    };
    const observer=new ResizeObserver(resize);observer.observe(canvas);resize();return()=>observer.disconnect();
  },[]);

  useEffect(()=>{
    const scene=root.current,canvas=air.current;if(!scene||!canvas||!active||paused)return;
    const ctx=canvas.getContext("2d");if(!ctx)return;
    let raf=0,previous=0,last=0;
    const frame=(now:number)=>{
      raf=requestAnimationFrame(frame);if(document.hidden){previous=0;return;}
      time.current+=previous?Math.min(.1,(now-previous)/1000):0;previous=now;if(now-last<33)return;last=now;
      const t=time.current,{w,h,scale,ox,oy}=dimensions.current;
      scene.dataset.environmentTime=t.toFixed(2);
      scene.style.setProperty("--liquor-light",String(.16+Math.sin(t*.21)*.055+Math.sin(t*.37)*.025));
      scene.style.setProperty("--liquor-beam",`${Math.sin(t*.12)*22}px`);
      ctx.setTransform(canvas.width/w,0,0,canvas.height/h,0,0);ctx.clearRect(0,0,w,h);ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);
      // Pendants, shelf bulbs and their warm spill have individual light rhythms.
      ctx.globalCompositeOperation="screen";
      LAMPS.forEach(([x,y,r],i)=>{
        const a=.36+Math.sin(t*(.85+i*.19)+i*2)*.12+Math.sin(t*2.17+i)*.045;
        const g=ctx.createRadialGradient(x,y,0,x,y,r*3);g.addColorStop(0,"#fff3c4bc");g.addColorStop(.25,"#ffba5466");g.addColorStop(1,"#ff9d3100");ctx.globalAlpha=a;ctx.fillStyle=g;ctx.fillRect(x-r*3,y-r*3,r*6,r*6);
      });
      // Glints travel vertically along real decanter edges, not across the room.
      BOTTLES.forEach(([x,y,r],i)=>{
        const p=(t*(.075+i*.013)+i*.23)%1,yy=y-45+p*70;
        ctx.globalAlpha=Math.pow(Math.sin(p*Math.PI),3)*(.75+responseStrength(response.current,now)*.25);ctx.strokeStyle="#ffe4b2";ctx.lineWidth=1.1;
        ctx.beginPath();ctx.moveTo(x-r*.4,yy-8);ctx.lineTo(x-r*.4,yy+8);ctx.stroke();
        const g=ctx.createRadialGradient(x,yy,0,x,yy,r*1.5);g.addColorStop(0,"#ffca7255");g.addColorStop(1,"#ffbb5500");ctx.fillStyle=g;ctx.fillRect(x-r*1.5,yy-r*1.5,r*3,r*3);
      });
      // Narrow reflected light sweeps follow the perspective of the onyx bar.
      ctx.save();ctx.beginPath();ctx.moveTo(810,510);ctx.lineTo(1600,630);ctx.lineTo(1600,900);ctx.lineTo(1030,900);ctx.closePath();ctx.clip();
      const sweep=800+(t*75)%900,g=ctx.createLinearGradient(sweep-80,0,sweep+80,0);g.addColorStop(0,"#ffd08000");g.addColorStop(.5,"#ffe6ae32");g.addColorStop(1,"#ffd08000");ctx.globalAlpha=.85;ctx.fillStyle=g;ctx.fillRect(780,510,820,390);ctx.restore();ctx.restore();
      ctx.globalCompositeOperation="source-over";
      for(let i=0;i<(w<760?35:76);i++){
        const d=(i%5)/4,p=(i*.173+t*(.012+d*.011))%1;
        ctx.globalAlpha=Math.sin(p*Math.PI)*(.18+d*.3);ctx.fillStyle=i%4?"#ffd48b":"#fff0d7";
        const [px,py]=driftPoint(((i*.618+t*.007)%1)*w+Math.sin(t*.31+i)*16,(1-p)*h,response.current,now);
        ctx.beginPath();ctx.arc(px,py,.5+d*1.6,0,Math.PI*2);ctx.fill();
      }
      ctx.globalAlpha=1;

    };
    raf=requestAnimationFrame(frame);return()=>cancelAnimationFrame(raf);
  },[active,paused]);

  return <section ref={root} id="the-liquors" className={`liquors-gallery${active?" is-active":""}`} aria-labelledby="liquors-title" aria-hidden={!active} inert={!active}>
    <div className="liquors-environment" aria-hidden="true">
      <LivingMaterials scene="liquors" active={active} paused={paused}/><img className="liquors-photograph" src={PHOTO} alt="" decoding="async"/><div className="liquors-light"/><div className="liquors-tone"/></div>
    <canvas ref={air} className="liquors-atmosphere" aria-hidden="true"/>
    <div className="liquors-copy"><p className="liquors-eyebrow">Gallery 08 <span/> Spirits · Woods · Amber</p><h2 id="liquors-title" tabIndex={-1}><span>The</span>Liquors</h2><p>Oak-aged warmth. A measure of indulgence.<br/>Boozy fragrances, beautifully composed.</p></div>
    <div className="liquors-footer"><span>Good taste. Long after the last note.</span><span>08 / The Liquors</span></div>
  </section>;
}
