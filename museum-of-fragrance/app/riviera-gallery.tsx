"use client";

import {LivingMaterials} from "./living-materials";
import {getRoomMoment} from "./room-response";

import {useEffect,useRef,useState} from "react";

const PHOTO="/images/riviera-gallery.webp";
type Ripple={x:number;y:number;at:number};
const SEA=[[822,450],[1550,450],[1550,498],[1420,515],[1372,558],[1355,639],[690,606],[520,608],[490,560],[594,517],[619,489],[806,454]];
const POOL=[[685,616],[1340,653],[1330,697],[1260,706],[1201,725],[1178,817],[431,660]];
function polygon(ctx:CanvasRenderingContext2D,points:number[][]){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();}
const smooth=(v:number)=>{const n=Math.min(1,Math.max(0,v));return n*n*(3-2*n);};

export function RivieraGallery({active,paused}:{active:boolean;paused:boolean}){
  const root=useRef<HTMLElement>(null),water=useRef<HTMLCanvasElement>(null),air=useRef<HTMLCanvasElement>(null);
  const state=useRef({active,paused});state.current={active,paused};
  const time=useRef(0),ripples=useRef<Ripple[]>([]),[touched,setTouched]=useState(false);
  const dimensions=useRef({w:1,h:1,scale:1,ox:0,oy:0});

  useEffect(()=>{
    const explore=(event:Event)=>{
      if(!state.current.active||(event as CustomEvent).detail!=="riviera")return;
      if(!state.current.paused){ripples.current=ripples.current.slice(-7);ripples.current.push({x:950,y:730,at:time.current});}
      setTouched(true);window.dispatchEvent(new Event("museum-riviera-ripple"));
    };
    const livingMoment=(event:Event)=>{
      const moment=getRoomMoment(event);
      if(!state.current.active||state.current.paused||moment?.room!=="riviera")return;
      const waypoint=moment.waypoint;
      const x=waypoint===undefined?950:550+(waypoint%6)*125;
      const y=waypoint===undefined?730:665+Math.floor(waypoint/6)*24;
      ripples.current=ripples.current.slice(-7);ripples.current.push({x,y,at:time.current});
    };
    window.addEventListener("museum-room-interaction",explore);
    window.addEventListener("museum-room-moment",livingMoment);
    return()=>{window.removeEventListener("museum-room-interaction",explore);window.removeEventListener("museum-room-moment",livingMoment);};
  },[]);

  useEffect(()=>{
    const scene=root.current,canvas=water.current,atmosphere=air.current;if(!scene||!canvas||!atmosphere)return;
    const resize=()=>{
      const w=canvas.clientWidth,h=canvas.clientHeight,scale=Math.max(w/1600,h/900),ox=(w-1600*scale)*(w<760?.55:.5),oy=(h-900*scale)*.5,dpr=Math.min(window.devicePixelRatio||1,1.5);
      canvas.width=atmosphere.width=Math.round(w*dpr);canvas.height=atmosphere.height=Math.round(h*dpr);dimensions.current={w,h,scale,ox,oy};
      scene.style.setProperty("--pool-clip",`polygon(${POOL.map(([x,y])=>`${x*scale+ox}px ${y*scale+oy}px`).join(",")})`);
    };
    const observer=new ResizeObserver(resize);observer.observe(canvas);resize();return()=>observer.disconnect();
  },[]);

  useEffect(()=>{
    const scene=root.current,canvas=water.current,atmosphere=air.current;if(!scene||!canvas||!atmosphere||!active||paused)return;
    const ctx=canvas.getContext("2d"),sky=atmosphere.getContext("2d");if(!ctx||!sky)return;
    const photo=new Image(),gull=new Image(),yacht=new Image();photo.src=PHOTO;gull.src="/images/riviera-gull.webp";yacht.src="/images/riviera-yacht.webp";
    let raf=0,previous=0,last=0;
    const frame=(now:number)=>{
      raf=requestAnimationFrame(frame);if(document.hidden){previous=0;return;}
      time.current+=previous?Math.min(.1,(now-previous)/1000):0;previous=now;if(now-last<33)return;last=now;
      const t=time.current,{w,h,scale,ox,oy}=dimensions.current,dpr=canvas.width/w;
      scene.dataset.environmentTime=t.toFixed(2);
      scene.style.setProperty("--riviera-sun",String(.21+Math.sin(t*.19)*.055+Math.sin(t*.31)*.03));
      scene.style.setProperty("--riviera-shadow",`${Math.sin(t*.23)*10+Math.sin(t*.47)*3}px`);
      ctx.globalCompositeOperation="source-over";ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);
      if(photo.complete&&photo.naturalWidth){
        const sx=photo.naturalWidth/1600,sy=photo.naturalHeight/900;
        // Native-resolution photographic strips move only within the sea mask.
        ctx.save();polygon(ctx,SEA);ctx.clip();
        for(let y=450;y<642;y+=3){const depth=(y-450)/192,dx=(Math.sin(y*.067-t*.85)*5+Math.sin(y*.029+t*.56)*2)*depth;ctx.drawImage(photo,480*sx,y*sy,1080*sx,3.2*sy,480+dx,y,1080,3.2);}
        ctx.restore();
        // Pool water has a separate, larger and slower surface ripple.
        ctx.save();polygon(ctx,POOL);ctx.clip();
        for(let y=615;y<820;y+=3){const fade=Math.sin((y-615)/205*Math.PI),dx=(Math.sin(y*.04-t*1.05)*7+Math.sin(y*.082+t*.61)*2.5)*fade;ctx.drawImage(photo,0,y*sy,1600*sx,3.2*sy,dx,y,1600,3.2);}
        ctx.restore();

      }
      // A small sailing boat travels across the middle distance.
      if(yacht.complete&&yacht.naturalWidth){
        const p=(t*.006+.55)%1,bx=1110-p*380,by=514+Math.sin(t*.7)*1.1;
        ctx.save();ctx.globalAlpha=smooth(p*8)*smooth((1-p)*8)*.87;ctx.translate(bx,by);ctx.rotate(Math.sin(t*.55)*.013);
        ctx.save();ctx.translate(0,3);ctx.scale(1,-.16);ctx.globalAlpha*=.13;ctx.drawImage(yacht,-37,-61,74,74*yacht.naturalHeight/yacht.naturalWidth);ctx.restore();
        ctx.drawImage(yacht,-37,-61,74,74*yacht.naturalHeight/yacht.naturalWidth);
        ctx.globalAlpha=.23;ctx.strokeStyle="#d8f5ff";ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(20,1);ctx.quadraticCurveTo(43,Math.sin(t)*1.3,73,4);ctx.stroke();ctx.restore();
      }
      // Moving points of sunlight on the sea and faint caustics in the pool.
      ctx.globalCompositeOperation="screen";
      ctx.save();polygon(ctx,SEA);ctx.clip();
      for(let i=0;i<95;i++){
        const p=(t*(.23+(i%4)*.037)+i*.173)%1,x=540+(i*.618%1)*1020,y=467+(i*.137%1)*170;
        ctx.globalAlpha=Math.pow(Math.sin(p*Math.PI),8)*.6;ctx.fillStyle="#efffff";ctx.fillRect(x+Math.sin(t*.4+i)*2,y,.8+(y-445)*.025,.7);
      }
      ctx.restore();ctx.save();polygon(ctx,POOL);ctx.clip();ctx.strokeStyle="#aefbff";
      for(let i=0;i<16;i++){
        ctx.globalAlpha=.09+Math.sin(t*.5+i)*.035;ctx.lineWidth=1.2;
        ctx.beginPath();ctx.ellipse(450+(i*.618%1)*920+Math.sin(t*.34+i)*14,635+(i*.173%1)*185,55+Math.sin(t*.7+i)*13,9+Math.sin(t*.4+i)*3,Math.sin(i)*.12,0,Math.PI*2);ctx.stroke();
      }
      ripples.current=ripples.current.filter(r=>t-r.at<4);
      for(const r of ripples.current){const age=t-r.at;for(let i=0;i<3;i++){const radius=age*48-i*17;if(radius<0)continue;ctx.globalAlpha=(1-age/4)*(.43-i*.07);ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(r.x,r.y,radius,radius*.24,0,0,Math.PI*2);ctx.stroke();}}
      ctx.restore();ctx.restore();ctx.globalAlpha=1;
      sky.setTransform(dpr,0,0,dpr,0,0);sky.clearRect(0,0,w,h);
      // The birds glide at different depths and never form a synchronized loop.
      if(gull.complete&&gull.naturalWidth){
        for(let i=0;i<(w<760?3:5);i++){
          const p=(t*(.015+i*.0023)+i*.213)%1,size=(i%2?14:23)*Math.min(1.2,scale);
          const x=(-.08+p*1.16)*w,y=h*(.12+(i%3)*.05)+Math.sin(t*.22+i)*h*.02;
          sky.save();sky.globalAlpha=smooth(p*9)*smooth((1-p)*9)*.7;sky.translate(x,y);sky.rotate(Math.sin(t*.4+i)*.15);sky.drawImage(gull,-size/2,-size/2,size,size*gull.naturalHeight/gull.naturalWidth);sky.restore();
        }
      }
      for(let i=0;i<(w<760?22:42);i++){
        const p=(i*.173+t*(.011+(i%3)*.003))%1;
        sky.globalAlpha=Math.sin(p*Math.PI)*.32;sky.fillStyle=i%3?"#fffef1":"#9bbfca";
        sky.beginPath();sky.arc(p*w,((i*.618)%1)*h+Math.sin(t*.5+i)*10,.7+(i%3)*.45,0,Math.PI*2);sky.fill();
      }sky.globalAlpha=1;
    };raf=requestAnimationFrame(frame);return()=>cancelAnimationFrame(raf);
  },[active,paused]);

  const touchPool=(event:React.MouseEvent<HTMLButtonElement>)=>{
    const rect=root.current?.getBoundingClientRect();if(!rect)return;
    const {scale,ox,oy}=dimensions.current;
    const x=event.detail?(event.clientX-rect.left-ox)/scale:950,y=event.detail?(event.clientY-rect.top-oy)/scale:730;
    if(!paused){ripples.current=ripples.current.slice(-7);ripples.current.push({x,y,at:time.current});}setTouched(true);window.dispatchEvent(new Event("museum-riviera-ripple"));
  };
  return <section ref={root} id="the-riviera" className={`riviera-gallery${active?" is-active":""}`} aria-labelledby="riviera-title" aria-hidden={!active} inert={!active}>
    <div className="riviera-environment" aria-hidden="true">
      <LivingMaterials scene="riviera" active={active} paused={paused}/><img className="riviera-photograph" src={PHOTO} alt="" decoding="async"/><canvas className="riviera-water" ref={water}/><div className="riviera-sunlight"/><div className="riviera-tone"/></div>
    <canvas className="riviera-atmosphere" ref={air} aria-hidden="true"/>
    <div className="riviera-copy"><p className="riviera-eyebrow">Gallery 09 <span/> Clean · Linen · Musk</p><h2 id="riviera-title" tabIndex={-1}><span>The</span>Riviera</h2><p>White linen. Bare skin. A Mediterranean breeze.<br/>Clean musks, with room to breathe.</p></div>
    <button className="riviera-pool-touch" type="button" onClick={touchPool} aria-label="Touch the pool at this point" title="A moment of stillness"/>
    <div className="riviera-footer"><span>The quiet art of feeling fresh.</span><span>09 / The Riviera</span></div>
    <span className="riviera-status" role="status">{touched?(paused?"A quiet moment by the water.":"A ripple travels across the sunlit pool."):""}</span>
  </section>;
}
