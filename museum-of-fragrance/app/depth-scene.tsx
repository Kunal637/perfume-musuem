"use client";

import {LivingMaterials} from "./living-materials";

import { useEffect, useRef, type CSSProperties, type RefObject } from "react";

const WIDE = "/images/museum-exterior-clean.webp";
const LOBBY = "/images/museum-lobby-photo.webp";

type SceneProps = { paused: boolean; onReady?: () => void };
type LampPosition = { x: number; y: number; delay: number; size?: number };
const lobbyLamps: LampPosition[] = [
  { x: 66.9, y: 4, delay: 1.2, size: .35 },
  { x: 66.4, y: 16.9, delay: 2.4, size: .35 },
  { x: 61.3, y: 27.6, delay: 3.6, size: .3 },
  { x: 39.5, y: 27.6, delay: .4, size: .3 },
  { x: 40.7, y: 32.8, delay: 4.2, size: .22 },
  { x: 58.8, y: 33.7, delay: 1.8, size: .22 },
];

const clamp = (x: number) => Math.max(0,Math.min(1,x));
const smooth = (x: number) => { const t=clamp(x); return t*t*(3-2*t); };

/** One clock drives photometric changes and wind; scroll owns only the camera.
 * Material animation is handled independently by LivingMaterials. */
function useLivingScene(rootRef: RefObject<HTMLDivElement | null>,paused: boolean) {
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const scene = root.closest<HTMLElement>(".museum-journey");
    const inside = root.dataset.scene === "interior";
    const lights = Array.from(root.querySelectorAll<HTMLElement>("[data-practical]")).map((element,i) => ({
      element, next: Number(element.dataset.delay || (i*2+3)), start: -100,
      duration: 1.1, power: 1, phase: i*2.7, neon: element.dataset.practical === "neon",
    }));
    let raf = 0, clock = 0, previous = 0, drawAt = 0;
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; previous = 0; });
    observer.observe(root);
    const visibility = () => { previous = 0; };
    document.addEventListener("visibilitychange",visibility);
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const delta = previous ? (now-previous)/1000 : 0;
      previous = now;
      if (document.hidden || !visible || pausedRef.current) return;
      const progress = Number(scene?.style.getPropertyValue("--scroll") || 0);
      if (inside ? progress < .48 : progress > .77) return;
      clock += delta;
      if (now-drawAt < 32) return;
      drawAt = now;
      const gust = Math.sin(clock*.69)*.55+Math.sin(clock*1.37+1.2)*.28+Math.sin(clock*.17)*.4;
      root.style.setProperty("--wind",gust.toFixed(4));
      root.style.setProperty("--wind-back",(Math.sin(clock*.83+1.4)*.65+Math.sin(clock*.29)*.35).toFixed(4));
      root.style.setProperty("--cloud-x",`${(Math.sin(clock*.012)*80+Math.sin(clock*.031)*13).toFixed(2)}px`);
      if(inside){
        root.style.setProperty("--window-cloud-x",`${(Math.sin(clock*.20)*40).toFixed(2)}px`);
        root.style.setProperty("--window-cloud-y",`${(Math.sin(clock*.14+1)*8).toFixed(2)}px`);
        root.style.setProperty("--glass-shift",`${(Math.sin(clock*.24)*18).toFixed(2)}%`);
        root.style.setProperty("--reflection-shift",`${(Math.sin(clock*.37)*140).toFixed(2)}px`);
      }
      root.style.setProperty("--cloud-light",(.045+Math.sin(clock*.17)*.025+Math.sin(clock*.071)*.02).toFixed(4));
      for (const light of lights) {
        if (clock >= light.next) {
          light.start = clock;
          light.duration = inside ? 1.6+Math.random()*1.2 : light.neon ? .65+Math.random()*.65 : 1.3+Math.random()*1.6;
          light.next = clock+light.duration+(inside?1.5+Math.random()*3.5:5+Math.random()*11);
        }
        const elapsed = clock-light.start;
        const pulse = elapsed < light.duration
          ? smooth(elapsed/(inside?.75:.18))*(1-smooth((elapsed-light.duration+(inside?.9:.45))/(inside?.9:.45))) : 0;
        const breathing = .94+.06*Math.sin(clock*.74+light.phase);
        // Frequent, soft indoor variations preserve the welcoming illumination.
        light.power = inside ? Math.max(.5,breathing-pulse*.4) : Math.max(.025,breathing-pulse*(light.neon ? .9 : .97));
        light.element.style.setProperty("--power",light.power.toFixed(3));
        light.element.dataset.lightState = light.power < .16 ? "off" : "on";
      }
      // QA can inspect the rendered scene's animation clock without accessing
      // application internals or depending on a GPU implementation.
      root.dataset.environmentTime = clock.toFixed(2);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); observer.disconnect(); document.removeEventListener("visibilitychange",visibility); };
  },[rootRef]);
}

function Lamp({x,y,delay,size=.48}: LampPosition) {
  return <span className="practical-lamp" data-practical="bulb" data-delay={delay}
    style={{left:`${x}%`,top:`${y}%`,"--bulb-size":`${size}%`} as CSSProperties}>
    <i className="lamp-blackout" /><i className="lamp-bloom" /><i className="lamp-spill" />
  </span>;
}

function Sign({detail=false}: {detail?: boolean}) {
  return <div className={`museum-neon${detail ? " museum-neon--detail" : ""}`}
    data-practical="neon" data-delay="4.6">
    <span>MUSEUM OF FRAGRANCE</span><i />
  </div>;
}

/** Every plane starts in the same photographed coordinate space. The camera
 * projects farther planes more slowly, allowing real occlusion at roof edges. */
export function ExteriorDepthScene({paused,onReady}: SceneProps) {
  const root = useRef<HTMLDivElement>(null);
  useLivingScene(root,paused);
  return <div className="depth-scene exterior-depth-scene" data-scene="exterior" ref={root}>
    <div className="clean-arrival-plane">
      <img src={WIDE} alt="" className="depth-photo arrival-photo" fetchPriority="high" onLoad={onReady} onError={onReady}/>
      <LivingMaterials scene="arrival" active={!paused} paused={paused}/>
      <div className="photo-space"><Sign/><div className="surface-shadow"/></div>
    </div>
  </div>;
}

export function InteriorDepthScene({paused}: SceneProps) {
  const root = useRef<HTMLDivElement>(null);
  useLivingScene(root,paused);
  return <div className="depth-scene interior-depth-scene" data-scene="interior" ref={root}>
    <div className="interior-rear">
      <LivingMaterials scene="atrium" active={!paused} paused={paused}/>
      <img src={LOBBY} alt="" className="depth-photo" decoding="async" fetchPriority="low" />
      <div className="photo-space">
        <div className="window-clouds window-clouds--rear"><img src={LOBBY} className="depth-photo" alt="" /></div>
        <div className="window-clouds window-clouds--side"><img src={LOBBY} className="depth-photo" alt="" /></div>
        {lobbyLamps.map((lamp,i) => <Lamp key={i} {...lamp} />)}
        {["left","right","cabinet"].map((position,i)=><div key={position}
          className={`exhibit-light exhibit-light--${position}`} data-practical="exhibit" data-delay={.8+i*1.3}>
          <i className="exhibit-light__glass" /><i className="exhibit-light__reflection" />
        </div>)}
        <div className="atrium-light-shafts" />
        <div className="surface-shadow" />
      </div>
    </div>
    <div className="interior-caustic" />
  </div>;
}
