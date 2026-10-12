"use client";

import {useEffect,useRef,useState} from "react";

/**
 * Real-time 3D amber flacon for the Amber Lounge entrance.
 * - Scroll: --room-progress (set by museum-entrance.tsx) drives a camera dive through the glass into the liquid.
 * - Motion controls: drag to spin (with inertia), pointer/gyro tilt, auto-spin, glow, reset.
 * - three.js is loaded on demand and everything is disposed on unmount. Reduced motion skips 3D entirely.
 */

type Controls={spin:boolean;tilt:boolean;glow:number;gyro:boolean;resetAt:number};

const clamp=(x:number,a=0,b=1)=>Math.min(b,Math.max(a,x));
const ease=(t:number)=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;

export function AmberBottle3D({active,paused,onReady}:{active:boolean;paused:boolean;onReady:(ready:boolean)=>void}){
  const host=useRef<HTMLDivElement>(null);
  const ctl=useRef<Controls>({spin:true,tilt:true,glow:1,gyro:false,resetAt:0});
  const run=useRef({active,paused});run.current={active,paused};
  const gyroValue=useRef({x:0,y:0});
  const [ready,setReady]=useState(false);
  const [spin,setSpin]=useState(true);
  const [tilt,setTilt]=useState(true);
  const [glow,setGlow]=useState(1);
  const [gyro,setGyro]=useState(false);
  const [gyroAvailable,setGyroAvailable]=useState(false);

  useEffect(()=>{ctl.current.spin=spin;},[spin]);
  useEffect(()=>{ctl.current.tilt=tilt;},[tilt]);
  useEffect(()=>{ctl.current.glow=glow;},[glow]);
  useEffect(()=>{ctl.current.gyro=gyro;},[gyro]);
  useEffect(()=>{
    setGyroAvailable(typeof window!=="undefined"&&"DeviceOrientationEvent" in window&&window.matchMedia("(pointer: coarse)").matches);
  },[]);

  useEffect(()=>{
    const el=host.current;
    if(!el||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    let disposed=false,raf=0,cleanup=()=>{};

    (async()=>{
      try{
        const THREE=await import("three");
        const {RoomEnvironment}=await import("three/examples/jsm/environments/RoomEnvironment.js");
        const {RoundedBoxGeometry}=await import("three/examples/jsm/geometries/RoundedBoxGeometry.js");
        if(disposed)return;

        const journey=el.closest<HTMLElement>(".museum-journey");
        const portal=el.parentElement as HTMLElement;
        const mobile=window.matchMedia("(max-width: 760px)").matches;

        const renderer=new THREE.WebGLRenderer({alpha:true,antialias:!mobile,powerPreference:"high-performance"});
        renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,mobile?1.5:1.8));
        renderer.toneMapping=THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure=1.05;
        renderer.setClearColor(0x000000,0);
        el.appendChild(renderer.domElement);
        renderer.domElement.className="amber-3d__canvas";

        const scene=new THREE.Scene();
        const pmrem=new THREE.PMREMGenerator(renderer);
        const envTexture=pmrem.fromScene(new RoomEnvironment(),.04).texture;
        scene.environment=envTexture;

        const camera=new THREE.PerspectiveCamera(32,1,.05,40);
        camera.position.set(0,.1,6.4);

        const group=new THREE.Group();scene.add(group);

        // Glass body: transmissive, so the amber liquid refracts through it.
        const glassMat=new THREE.MeshPhysicalMaterial({
          color:0xfff3dc,transmission:1,thickness:1.4,roughness:.03,ior:1.52,
          attenuationColor:new THREE.Color(0xffb85c),attenuationDistance:2.4,
          clearcoat:1,clearcoatRoughness:.04,envMapIntensity:1.5,
        });
        const body=new THREE.Mesh(new RoundedBoxGeometry(1.7,2.1,.95,5,.14),glassMat);
        body.position.y=-.15;group.add(body);

        const liquidMat=new THREE.MeshPhysicalMaterial({
          color:0xd8861f,roughness:.35,metalness:0,emissive:0xff9d2e,emissiveIntensity:.5,
          side:THREE.DoubleSide,
        });
        const liquid=new THREE.Mesh(new RoundedBoxGeometry(1.5,1.55,.75,4,.1),liquidMat);
        liquid.position.y=-.38;group.add(liquid);

        // Teardrop floating in the liquid: the point the camera dives toward.
        const profile:InstanceType<typeof THREE.Vector2>[]=[];
        for(let i=0;i<=28;i++){const t=i/28*Math.PI;profile.push(new THREE.Vector2(Math.sin(t)*Math.sin(t/2)*.28,Math.cos(t)*.34));}
        const dropMat=new THREE.MeshPhysicalMaterial({
          color:0xffe08a,emissive:0xffc24d,emissiveIntensity:1.1,roughness:.12,clearcoat:1,envMapIntensity:1.8,
        });
        const drop=new THREE.Mesh(new THREE.LatheGeometry(profile,40),dropMat);
        drop.position.set(0,-.2,0);drop.scale.setScalar(.55);group.add(drop);

        const gold=new THREE.MeshStandardMaterial({color:0xd9a441,metalness:1,roughness:.22,envMapIntensity:1.6});
        const neck=new THREE.Mesh(new THREE.CylinderGeometry(.27,.33,.3,40),gold);neck.position.y=1.02;group.add(neck);
        const collar=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,.09,40),gold);collar.position.y=1.2;group.add(collar);
        const cap=new THREE.Mesh(
          new RoundedBoxGeometry(.86,.74,.6,4,.09),
          new THREE.MeshPhysicalMaterial({color:0x0e0b0c,roughness:.22,metalness:.25,clearcoat:1,clearcoatRoughness:.08,envMapIntensity:1.4}),
        );
        cap.position.y=1.62;group.add(cap);

        // Gold label printed on the front of the glass.
        const labelCanvas=document.createElement("canvas");labelCanvas.width=512;labelCanvas.height=256;
        const lc=labelCanvas.getContext("2d");
        if(lc){
          lc.clearRect(0,0,512,256);lc.strokeStyle="#e8c27a";lc.lineWidth=3;lc.strokeRect(14,14,484,228);
          lc.fillStyle="#f3d79a";lc.textAlign="center";
          lc.font="italic 34px Georgia, serif";lc.fillText("Museum of Fragrance",256,98);
          lc.font="600 58px Georgia, serif";lc.fillText("AMBER",256,165);
          lc.font="22px Georgia, serif";lc.fillText("N° 05  ·  LOUNGE",256,212);
        }
        const labelTexture=new THREE.CanvasTexture(labelCanvas);labelTexture.colorSpace=THREE.SRGBColorSpace;
        const label=new THREE.Mesh(
          new THREE.PlaneGeometry(.95,.475),
          new THREE.MeshBasicMaterial({map:labelTexture,transparent:true,depthWrite:false,opacity:.92}),
        );
        label.position.set(0,-.1,.5);group.add(label);

        // Warm lights: one inside the liquid, rim lights for the glass edges.
        const inner=new THREE.PointLight(0xffb24a,6,6,1.6);inner.position.set(0,-.2,.1);group.add(inner);
        const rimA=new THREE.DirectionalLight(0xffd9a0,2.2);rimA.position.set(-4,3,3);scene.add(rimA);
        const rimB=new THREE.DirectionalLight(0x9fd8d0,1.1);rimB.position.set(4,1,-3);scene.add(rimB);

        // Soft halo behind the bottle.
        const haloCanvas=document.createElement("canvas");haloCanvas.width=haloCanvas.height=256;
        const hc=haloCanvas.getContext("2d");
        if(hc){const g=hc.createRadialGradient(128,128,0,128,128,128);g.addColorStop(0,"rgba(255,190,90,.9)");g.addColorStop(.45,"rgba(255,150,50,.25)");g.addColorStop(1,"rgba(255,140,40,0)");hc.fillStyle=g;hc.fillRect(0,0,256,256);}
        const haloTexture=new THREE.CanvasTexture(haloCanvas);haloTexture.colorSpace=THREE.SRGBColorSpace;
        const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:haloTexture,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.55}));
        halo.position.set(0,0,-1.4);halo.scale.setScalar(7);scene.add(halo);

        // Drifting amber dust.
        const count=mobile?90:220;
        const positions=new Float32Array(count*3),speeds=new Float32Array(count);
        for(let i=0;i<count;i++){positions[i*3]=(Math.random()-.5)*7;positions[i*3+1]=(Math.random()-.5)*6;positions[i*3+2]=(Math.random()-.5)*5;speeds[i]=.04+Math.random()*.12;}
        const dustGeometry=new THREE.BufferGeometry();
        dustGeometry.setAttribute("position",new THREE.BufferAttribute(positions,3));
        const dust=new THREE.Points(dustGeometry,new THREE.PointsMaterial({color:0xffd28a,size:.035,sizeAttenuation:true,transparent:true,opacity:.75,depthWrite:false,blending:THREE.AdditiveBlending}));
        scene.add(dust);

        // Sizing
        const resize=()=>{
          const w=Math.max(1,el.clientWidth),h=Math.max(1,el.clientHeight);
          renderer.setSize(w,h,false);camera.aspect=w/h;
          camera.position.x=0;camera.updateProjectionMatrix();
        };
        const observer=new ResizeObserver(resize);observer.observe(el);resize();

        // Pointer, drag and gyro input
        const pointer={x:0,y:0};
        let dragging=false,lastX=0,rotY=0,velY=0;
        const onMove=(ev:PointerEvent)=>{
          const r=el.getBoundingClientRect();
          pointer.x=((ev.clientX-r.left)/r.width-.5)*2;pointer.y=((ev.clientY-r.top)/r.height-.5)*2;
          if(dragging){const dx=ev.clientX-lastX;lastX=ev.clientX;rotY+=dx*.008;velY=dx*.008;}
        };
        const onDown=(ev:PointerEvent)=>{dragging=true;lastX=ev.clientX;el.setPointerCapture(ev.pointerId);el.classList.add("is-dragging");};
        const onUp=(ev:PointerEvent)=>{dragging=false;el.classList.remove("is-dragging");if(el.hasPointerCapture(ev.pointerId))el.releasePointerCapture(ev.pointerId);};
        el.addEventListener("pointermove",onMove);el.addEventListener("pointerdown",onDown);
        el.addEventListener("pointerup",onUp);el.addEventListener("pointercancel",onUp);
        const onOrient=(ev:DeviceOrientationEvent)=>{
          gyroValue.current.x=clamp(((ev.gamma??0)/35),-1,1);gyroValue.current.y=clamp((((ev.beta??45)-45)/35),-1,1);
        };
        window.addEventListener("deviceorientation",onOrient);

        // Frame loop
        let t=0,prev=0,tiltX=0,tiltY=0,seenReset=0,live="";
        const frame=(now:number)=>{
          raf=requestAnimationFrame(frame);
          const dt=Math.min(.05,prev?(now-prev)/1000:0);prev=now;
          if(document.hidden||!run.current.active||run.current.paused)return;
          const progress=parseFloat(journey?.style.getPropertyValue("--room-progress")||"1");
          const e=clamp(progress*9);
          const nextLive=e<.85?"1":"0";
          if(nextLive!==live){live=nextLive;portal.dataset.live=live;}
          if(e>=.995)return; // portal fully faded; stop drawing
          t+=dt;
          const c=ctl.current;
          if(c.resetAt!==seenReset){seenReset=c.resetAt;rotY=0;velY=0;}
          if(!dragging){rotY+=velY;velY*=.93;if(c.spin)rotY+=dt*.4;}
          const useGyro=c.gyro;
          const px=useGyro?gyroValue.current.x:pointer.x,py=useGyro?gyroValue.current.y:pointer.y;
          const tx=c.tilt?py*.22:0,ty=c.tilt?px*.35:0;
          tiltX+=(tx-tiltX)*Math.min(1,dt*4);tiltY+=(ty-tiltY)*Math.min(1,dt*4);
          const eased=ease(e);
          group.rotation.y=rotY+tiltY+eased*Math.PI*1.3;
          group.rotation.x=tiltX;
          group.position.y=Math.sin(t*.9)*.05;
          drop.rotation.y+=dt*.8;drop.position.y=-.2+Math.sin(t*1.3)*.05;
          // Scroll dive: from a full portrait to inside the liquid, widening the lens as we go in.
          camera.position.z=6.4-eased*6.25;camera.position.y=.1-eased*.2;
          const fov=32+eased*26;if(Math.abs(camera.fov-fov)>.05){camera.fov=fov;camera.updateProjectionMatrix();}
          camera.lookAt(0,-.2,0);
          const g=c.glow;
          inner.intensity=(5+Math.sin(t*2.1)*.6)*g*(1+eased*2.2);
          liquidMat.emissiveIntensity=.5*g+eased*.7;
          dropMat.emissiveIntensity=1.1*g;
          (halo.material as InstanceType<typeof THREE.SpriteMaterial>).opacity=.55*clamp(g/1.2,.2,1.3)*(1-eased*.6);
          const arr=dustGeometry.attributes.position.array as Float32Array;
          for(let i=0;i<count;i++){let y=arr[i*3+1]+dt*speeds[i];if(y>3)y=-3;arr[i*3+1]=y;arr[i*3]+=Math.sin(t*.4+i)*dt*.02;}
          dustGeometry.attributes.position.needsUpdate=true;
          dust.rotation.y=eased*.6;
          renderer.render(scene,camera);
        };
        raf=requestAnimationFrame(frame);

        setReady(true);onReady(true);

        cleanup=()=>{
          cancelAnimationFrame(raf);observer.disconnect();
          el.removeEventListener("pointermove",onMove);el.removeEventListener("pointerdown",onDown);
          el.removeEventListener("pointerup",onUp);el.removeEventListener("pointercancel",onUp);
          window.removeEventListener("deviceorientation",onOrient);
          scene.traverse(obj=>{
            const mesh=obj as InstanceType<typeof THREE.Mesh>;
            mesh.geometry?.dispose?.();
            const m=mesh.material as InstanceType<typeof THREE.Material>|InstanceType<typeof THREE.Material>[]|undefined;
            (Array.isArray(m)?m:m?[m]:[]).forEach(mat=>mat.dispose());
          });
          labelTexture.dispose();haloTexture.dispose();envTexture.dispose();pmrem.dispose();renderer.dispose();
          renderer.domElement.remove();
        };
      }catch{
        // No WebGL or import failure: the CSS bottle in the portal stays as the fallback.
        onReady(false);
      }
    })();

    return()=>{disposed=true;cleanup();onReady(false);setReady(false);};
  },[onReady]);

  const toggleGyro=async()=>{
    if(!gyro){
      const DOE=window.DeviceOrientationEvent as unknown as {requestPermission?:()=>Promise<string>};
      try{if(typeof DOE.requestPermission==="function"&&(await DOE.requestPermission())!=="granted")return;}catch{return;}
    }
    setGyro(v=>!v);
  };

  return <>
    <div ref={host} className="amber-3d" aria-hidden="true"/>
    {ready&&<div className="amber-3d-controls" role="group" aria-label="Bottle motion controls">
      <button type="button" aria-pressed={spin} onClick={()=>setSpin(v=>!v)}>Auto-spin</button>
      <button type="button" aria-pressed={tilt} onClick={()=>setTilt(v=>!v)}>Tilt</button>
      {gyroAvailable&&<button type="button" aria-pressed={gyro} onClick={toggleGyro}>Gyro</button>}
      <label>Glow<input type="range" min=".3" max="2" step=".05" value={glow} onChange={ev=>setGlow(Number(ev.target.value))} aria-label="Glow intensity"/></label>
      <button type="button" onClick={()=>{ctl.current.resetAt=performance.now();}}>Reset</button>
      <span className="amber-3d-hint">Drag the bottle · scroll to step inside</span>
    </div>}
  </>;
}
