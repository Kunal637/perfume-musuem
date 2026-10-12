"use client";

import {useCallback,useEffect,useRef,useState,type CSSProperties} from "react";

/**
 * Shared room entrance, inspired by scroll-scrubbed "fly into the bottle" product films:
 * a glass flacon floats among its signature ingredients, the camera pushes through the glass into the
 * liquid, and the room is revealed through an opening iris.
 *
 * - Scroll: --room-progress (set by museum-entrance.tsx) drives the dive over the first ~11% of the room.
 * - Motion controls: drag to spin with inertia, pointer/gyro tilt, auto-spin, glow, reset.
 * - Every room supplies a look (liquid colours, light, label, floating ingredient). One WebGL context exists at a time:
 *   the scene mounts only while its room is active and is fully disposed afterwards.
 */

type NoteShape="petal"|"leaf"|"shard"|"crystal"|"slice";
type RoomLook={
  title:string;subtitle:string;
  liquid:[string,string,string];light:number;dust:number;
  cap:number;metal:number;ink:string;veil:string;
  note:{shape:NoteShape;color:number;accent?:number;size:number};
};

const LOOKS:Record<string,RoomLook>={
  marines:{title:"MARINES",subtitle:"N° 01  ·  SALT & SEA",liquid:["#9ad6e6","#2f93b8","#0c3a58"],light:0x7fd4ff,dust:0xd6f1ff,cap:0x0b1722,metal:0xcfd8de,ink:"#e4f4f9",veil:"#05131b",note:{shape:"crystal",color:0xcfe8f2,size:.34}},
  gardens:{title:"GARDENS",subtitle:"N° 02  ·  GREEN & BLOOM",liquid:["#cbe596","#74a64c","#2a5428"],light:0xc9f0a0,dust:0xf4ffd8,cap:0x111d0f,metal:0xd8c47a,ink:"#f3f8da",veil:"#07130a",note:{shape:"petal",color:0xfdf8ec,accent:0xf3e3c3,size:.75}},
  sultans:{title:"SULTANS",subtitle:"N° 03  ·  OUD & INCENSE",liquid:["#d98a99","#8c2f4c","#34101d"],light:0xffb27a,dust:0xffd9b0,cap:0x120a0c,metal:0xd9a441,ink:"#fbe3c4",veil:"#13070b",note:{shape:"shard",color:0x3a2316,accent:0x8a5a2a,size:.7}},
  cedar:{title:"CEDAR",subtitle:"N° 04  ·  THE CEDAR ROOM",liquid:["#b6cc94","#62814c","#23351d"],light:0xd8e8b2,dust:0xeaf3c8,cap:0x10170d,metal:0xc9b27a,ink:"#eef3d6",veil:"#091109",note:{shape:"shard",color:0xb98a55,accent:0x7a5230,size:.8}},
  amber:{title:"AMBER",subtitle:"N° 05  ·  THE LOUNGE",liquid:["#f0b04a","#c97a1f","#5e2c0a"],light:0xffb24a,dust:0xffd28a,cap:0x0e0b0c,metal:0xd9a441,ink:"#fbe7b8",veil:"#1a0d07",note:{shape:"crystal",color:0xf2a93a,accent:0xffd37a,size:.38}},
  pastry:{title:"PASTRY",subtitle:"N° 07  ·  SWEET NOTES",liquid:["#ffdce6","#e69ab2","#8a3a52"],light:0xffc6d6,dust:0xffe8ef,cap:0x1a0d12,metal:0xe3c08a,ink:"#fff0f3",veil:"#1a0c12",note:{shape:"crystal",color:0xf6dfe4,accent:0xf7b6c8,size:.32}},
  liquors:{title:"LIQUORS",subtitle:"N° 08  ·  CRYSTAL & CASK",liquid:["#dfb86c","#92601f","#2d1708"],light:0xffbf6a,dust:0xffe0a8,cap:0x0d0907,metal:0xc9a15a,ink:"#fbe9c4",veil:"#100a06",note:{shape:"crystal",color:0xdbe9ee,accent:0xffffff,size:.4}},
  riviera:{title:"RIVIERA",subtitle:"N° 09  ·  SUN & CITRUS",liquid:["#fff0a4","#f5b83a","#d1651f"],light:0xfff0b0,dust:0xfff6c8,cap:0x0c1a22,metal:0xe7d49a,ink:"#fffbe6",veil:"#0b1b25",note:{shape:"slice",color:0xf59b23,accent:0xffd36a,size:.9}},
  tobacco:{title:"TOBACCO",subtitle:"N° 10  ·  LEATHER & SMOKE",liquid:["#cf9250","#7e4c20","#2a1508"],light:0xffa95a,dust:0xf2cfa0,cap:0x0e0805,metal:0xb88a4a,ink:"#f6e1bf",veil:"#120a05",note:{shape:"leaf",color:0x8a5a2a,accent:0x5a3a18,size:.9}},
};

type Controls={spin:boolean;tilt:boolean;glow:number;gyro:boolean;resetAt:number};
const clamp=(x:number,a=0,b=1)=>Math.min(b,Math.max(a,x));
const ease=(t:number)=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;

export function RoomPortal({room,active,paused}:{room:keyof typeof LOOKS&string;active:boolean;paused:boolean}){
  const look=LOOKS[room];
  const [gl,setGl]=useState<"loading"|"ready"|"failed">("loading");
  const onReady=useCallback((state:"loading"|"ready"|"failed")=>setGl(state),[]);
  if(!active||!look)return null;
  const style={"--portal-veil":look.veil,"--portal-1":look.liquid[0],"--portal-2":look.liquid[1],"--portal-3":look.liquid[2]} as CSSProperties;
  return <div className="room-portal" data-gl={gl} style={style}>
    <div className="room-portal__veil" aria-hidden="true"/>
    <div className="room-portal__bottle" aria-hidden="true">
      <i className="room-portal__cap"/><i className="room-portal__neck"/>
      <div className="room-portal__glass"><i className="room-portal__liquid"/><i className="room-portal__drop"/><i className="room-portal__shine"/></div>
    </div>
    <RoomBottle3D look={look} paused={paused} onReady={onReady}/>
  </div>;
}

function RoomBottle3D({look,paused,onReady}:{look:RoomLook;paused:boolean;onReady:(state:"loading"|"ready"|"failed")=>void}){
  const host=useRef<HTMLDivElement>(null);
  const ctl=useRef<Controls>({spin:true,tilt:true,glow:1,gyro:false,resetAt:0});
  const pausedRef=useRef(paused);pausedRef.current=paused;
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
  useEffect(()=>{setGyroAvailable("DeviceOrientationEvent" in window&&window.matchMedia("(pointer: coarse)").matches);},[]);

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
        const toCss=(hex:number,a:number)=>{const c=new THREE.Color(hex);return `rgba(${Math.round(c.r*255)},${Math.round(c.g*255)},${Math.round(c.b*255)},${a})`;};

        const renderer=new THREE.WebGLRenderer({alpha:true,antialias:!mobile,powerPreference:"high-performance"});
        renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,mobile?1.5:1.8));
        renderer.toneMapping=THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure=1.05;
        renderer.setClearColor(0x000000,0);
        renderer.domElement.className="room-3d__canvas";
        el.appendChild(renderer.domElement);

        const scene=new THREE.Scene();
        const pmrem=new THREE.PMREMGenerator(renderer);
        const envTexture=pmrem.fromScene(new RoomEnvironment(),.04).texture;
        scene.environment=envTexture;

        const camera=new THREE.PerspectiveCamera(30,1,.05,60);
        camera.position.set(0,.2,8.8);

        const group=new THREE.Group();scene.add(group);

        // Glass body: transmissive, so the liquid refracts through it.
        const glassMat=new THREE.MeshPhysicalMaterial({
          color:0xfff6e8,transmission:1,thickness:1.4,roughness:.03,ior:1.52,
          attenuationColor:new THREE.Color(look.liquid[0]),attenuationDistance:2.6,
          clearcoat:1,clearcoatRoughness:.04,envMapIntensity:1.5,
        });
        const body=new THREE.Mesh(new RoundedBoxGeometry(1.7,2.1,.95,5,.14),glassMat);
        body.position.y=-.15;group.add(body);

        const liquidCanvas=document.createElement("canvas");liquidCanvas.width=4;liquidCanvas.height=256;
        const lq=liquidCanvas.getContext("2d");
        if(lq){const g=lq.createLinearGradient(0,0,0,256);g.addColorStop(0,look.liquid[0]);g.addColorStop(.45,look.liquid[1]);g.addColorStop(1,look.liquid[2]);lq.fillStyle=g;lq.fillRect(0,0,4,256);}
        const liquidTexture=new THREE.CanvasTexture(liquidCanvas);liquidTexture.colorSpace=THREE.SRGBColorSpace;
        const liquidMat=new THREE.MeshPhysicalMaterial({
          color:0xffffff,map:liquidTexture,roughness:.4,metalness:0,emissive:0xffffff,emissiveMap:liquidTexture,emissiveIntensity:.32,side:THREE.DoubleSide,
        });
        const liquid=new THREE.Mesh(new RoundedBoxGeometry(1.5,1.55,.75,4,.1),liquidMat);
        liquid.position.y=-.38;group.add(liquid);

        // Teardrop in the liquid: the point the camera dives toward.
        const profile:InstanceType<typeof THREE.Vector2>[]=[];
        for(let i=0;i<=28;i++){const t=i/28*Math.PI;profile.push(new THREE.Vector2(Math.sin(t)*Math.sin(t/2)*.28,Math.cos(t)*.34));}
        const dropMat=new THREE.MeshPhysicalMaterial({
          color:new THREE.Color(look.liquid[0]).lerp(new THREE.Color(0xffd36e),.55),emissive:new THREE.Color(look.light),emissiveIntensity:.9,
          roughness:.18,clearcoat:1,envMapIntensity:1.2,transparent:true,
        });
        const drop=new THREE.Mesh(new THREE.LatheGeometry(profile,40),dropMat);
        drop.position.set(0,-.2,0);drop.scale.setScalar(.55);group.add(drop);

        const metal=new THREE.MeshStandardMaterial({color:look.metal,metalness:1,roughness:.22,envMapIntensity:1.6});
        const neck=new THREE.Mesh(new THREE.CylinderGeometry(.27,.33,.3,40),metal);neck.position.y=1.02;group.add(neck);
        const collar=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,.09,40),metal);collar.position.y=1.2;group.add(collar);
        const cap=new THREE.Mesh(
          new RoundedBoxGeometry(.86,.74,.6,4,.09),
          new THREE.MeshPhysicalMaterial({color:look.cap,roughness:.22,metalness:.25,clearcoat:1,clearcoatRoughness:.08,envMapIntensity:1.4}),
        );
        cap.position.y=1.62;group.add(cap);

        // Label printed on the front of the glass.
        const labelCanvas=document.createElement("canvas");labelCanvas.width=1024;labelCanvas.height=512;
        const lc=labelCanvas.getContext("2d");
        if(lc){
          lc.clearRect(0,0,1024,512);lc.strokeStyle=look.ink;lc.fillStyle=look.ink;lc.lineWidth=4;lc.strokeRect(28,28,968,456);
          lc.lineWidth=1.5;lc.strokeRect(44,44,936,424);lc.textAlign="center";
          lc.font="italic 54px Georgia, serif";lc.fillText("Museum of Fragrance",512,170);
          let size=120;lc.font=`600 ${size}px Georgia, serif`;
          while(lc.measureText(look.title).width>780&&size>50){size-=4;lc.font=`600 ${size}px Georgia, serif`;}
          lc.fillText(look.title,512,300);
          lc.font="34px Georgia, serif";lc.fillText(look.subtitle,512,400);
        }
        const labelTexture=new THREE.CanvasTexture(labelCanvas);labelTexture.colorSpace=THREE.SRGBColorSpace;
        const label=new THREE.Mesh(
          new THREE.PlaneGeometry(.95,.475),
          new THREE.MeshBasicMaterial({map:labelTexture,transparent:true,depthWrite:false,toneMapped:false}),
        );
        label.position.set(0,-.1,.5);group.add(label);

        // Lights
        const inner=new THREE.PointLight(look.light,6,6,1.6);inner.position.set(0,-.2,.1);group.add(inner);
        const rimA=new THREE.DirectionalLight(0xfff0d8,2.2);rimA.position.set(-4,3,3);scene.add(rimA);
        const rimB=new THREE.DirectionalLight(look.light,1.1);rimB.position.set(4,1,-3);scene.add(rimB);

        // Halo + floor glow
        const haloCanvas=document.createElement("canvas");haloCanvas.width=haloCanvas.height=256;
        const hc=haloCanvas.getContext("2d");
        if(hc){const g=hc.createRadialGradient(128,128,0,128,128,128);g.addColorStop(0,toCss(look.light,.9));g.addColorStop(.45,toCss(look.light,.25));g.addColorStop(1,toCss(look.light,0));hc.fillStyle=g;hc.fillRect(0,0,256,256);}
        const haloTexture=new THREE.CanvasTexture(haloCanvas);haloTexture.colorSpace=THREE.SRGBColorSpace;
        const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:haloTexture,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.55}));
        halo.position.set(0,0,-1.4);halo.scale.setScalar(7);scene.add(halo);
        const floor=new THREE.Sprite(new THREE.SpriteMaterial({map:haloTexture,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.4}));
        floor.position.set(0,-1.3,0);floor.scale.set(5.2,1.2,1);scene.add(floor);

        // Signature ingredients floating around the bottle; they sweep past the lens during the dive.
        const spec=look.note;
        const noteMain=new THREE.MeshPhysicalMaterial({color:spec.color,roughness:spec.shape==="crystal"?.08:.55,metalness:spec.shape==="crystal"?.1:0,clearcoat:spec.shape==="crystal"?1:.2,envMapIntensity:1.5,side:THREE.DoubleSide,
          emissive:spec.shape==="crystal"?new THREE.Color(spec.color):new THREE.Color(0x000000),emissiveIntensity:spec.shape==="crystal"?.15:0});
        const noteAccent=new THREE.MeshPhysicalMaterial({color:spec.accent??spec.color,roughness:.5,envMapIntensity:1.2,side:THREE.DoubleSide});
        const noteGeo:{dispose():void}[]=[];
        const makeNote=():InstanceType<typeof THREE.Object3D>=>{
          if(spec.shape==="slice"){
            const g=new THREE.Group();
            const rindGeo=new THREE.CylinderGeometry(.5,.5,.08,44);const fleshGeo=new THREE.CylinderGeometry(.43,.43,.095,44);
            noteGeo.push(rindGeo,fleshGeo);
            g.add(new THREE.Mesh(rindGeo,noteMain),new THREE.Mesh(fleshGeo,noteAccent));
            return g;
          }
          let geo:InstanceType<typeof THREE.SphereGeometry>|InstanceType<typeof THREE.BoxGeometry>|InstanceType<typeof THREE.OctahedronGeometry>;
          if(spec.shape==="petal"||spec.shape==="leaf"){
            const leaf=spec.shape==="leaf";
            const sphere=new THREE.SphereGeometry(.5,26,18);sphere.scale(leaf?.42:.6,.05,leaf?1.25:1);
            const pos=sphere.attributes.position;
            for(let i=0;i<pos.count;i++){ // taper toward the tip and curl the blade
              const x=pos.getX(i),z=pos.getZ(i),t=(z/(leaf?.625:.5)+1)/2;
              pos.setXYZ(i,x*(.35+(1-t)*.95),pos.getY(i)+(x*x)*(leaf?.5:1.3)+t*t*.16,z);
            }
            sphere.computeVertexNormals();geo=sphere;
          }
          else if(spec.shape==="shard"){geo=new THREE.BoxGeometry(.1,.9,.06);}
          else{geo=new THREE.OctahedronGeometry(.35);geo.scale(.7,1.25,.7);}
          noteGeo.push(geo);
          return new THREE.Mesh(geo,spec.shape==="leaf"||spec.shape==="shard"?noteAccent:noteMain);
        };
        const noteCount=mobile?14:26;
        const notes=new THREE.Group();scene.add(notes);
        const noteData=Array.from({length:noteCount},(_,i)=>{
          const mesh=makeNote();
          const angle=(i/noteCount)*Math.PI*2+Math.random()*.6;
          const radius=2+Math.random()*2.6;
          const base=new THREE.Vector3(Math.cos(angle)*radius,(Math.random()-.5)*4.2,Math.sin(angle)*radius*.8-.4);
          const scale=spec.size*(.55+Math.random()*.7);
          mesh.scale.setScalar(scale);
          mesh.rotation.set(Math.random()*6,Math.random()*6,Math.random()*6);
          notes.add(mesh);
          return {mesh,base,phase:Math.random()*6.28,spin:new THREE.Vector3((Math.random()-.5)*.8,(Math.random()-.5)*.8,(Math.random()-.5)*.8),bob:.12+Math.random()*.2};
        });

        // Fine dust
        const count=mobile?90:200;
        const positions=new Float32Array(count*3),speeds=new Float32Array(count);
        for(let i=0;i<count;i++){positions[i*3]=(Math.random()-.5)*10;positions[i*3+1]=(Math.random()-.5)*7;positions[i*3+2]=(Math.random()-.5)*6;speeds[i]=.04+Math.random()*.12;}
        const dustGeometry=new THREE.BufferGeometry();
        dustGeometry.setAttribute("position",new THREE.BufferAttribute(positions,3));
        const dust=new THREE.Points(dustGeometry,new THREE.PointsMaterial({color:look.dust,size:.035,sizeAttenuation:true,transparent:true,opacity:.75,depthWrite:false,blending:THREE.AdditiveBlending}));
        scene.add(dust);

        const resize=()=>{
          const w=Math.max(1,el.clientWidth),h=Math.max(1,el.clientHeight);
          renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
        };
        const observer=new ResizeObserver(resize);observer.observe(el);resize();

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
          gyroValue.current.x=clamp((ev.gamma??0)/35,-1,1);gyroValue.current.y=clamp(((ev.beta??45)-45)/35,-1,1);
        };
        window.addEventListener("deviceorientation",onOrient);

        let t=0,prev=0,tiltX=0,tiltY=0,seenReset=0,live="";
        const frame=(now:number)=>{
          raf=requestAnimationFrame(frame);
          const dt=Math.min(.05,prev?(now-prev)/1000:0);prev=now;
          if(document.hidden||pausedRef.current)return;
          const progress=parseFloat(journey?.style.getPropertyValue("--room-progress")||"1");
          const e=clamp(progress*9);
          const nextLive=e<.85?"1":"0";
          if(nextLive!==live){live=nextLive;portal.dataset.live=live;}
          if(e>=.995)return;
          t+=dt;
          const c=ctl.current;
          if(c.resetAt!==seenReset){seenReset=c.resetAt;rotY=0;velY=0;}
          if(!dragging){rotY+=velY;velY*=.93;if(c.spin)rotY+=dt*.4;}
          const px=c.gyro?gyroValue.current.x:pointer.x,py=c.gyro?gyroValue.current.y:pointer.y;
          const tx=c.tilt?py*.22:0,ty=c.tilt?px*.35:0;
          tiltX+=(tx-tiltX)*Math.min(1,dt*4);tiltY+=(ty-tiltY)*Math.min(1,dt*4);
          const eased=ease(e);
          group.rotation.y=rotY+tiltY+eased*Math.PI*1.3;
          group.rotation.x=tiltX;
          group.position.y=Math.sin(t*.9)*.05;
          drop.rotation.y+=dt*.8;drop.position.y=-.2+Math.sin(t*1.3)*.05;
          // Ingredients drift, then fan outward past the lens as the camera pushes in.
          const spread=1+eased*1.5;
          for(const n of noteData){
            n.mesh.position.set(n.base.x*spread,n.base.y*spread+Math.sin(t*.7+n.phase)*n.bob,n.base.z+eased*2.2);
            n.mesh.rotation.x+=n.spin.x*dt;n.mesh.rotation.y+=n.spin.y*dt;n.mesh.rotation.z+=n.spin.z*dt;
          }
          notes.visible=eased<.92;
          camera.position.z=8.8-eased*8.65;camera.position.y=.2-eased*.4;
          const fov=30+eased*26;if(Math.abs(camera.fov-fov)>.05){camera.fov=fov;camera.updateProjectionMatrix();}
          camera.lookAt(0,.2-eased*.4,0);
          dropMat.opacity=1-clamp((eased-.5)*2.2);
          const g=c.glow;
          inner.intensity=(5+Math.sin(t*2.1)*.6)*g*(1+eased*2.2);
          liquidMat.emissiveIntensity=.32*g+eased*.35;
          dropMat.emissiveIntensity=.9*g;
          (halo.material as InstanceType<typeof THREE.SpriteMaterial>).opacity=.55*clamp(g/1.2,.2,1.3)*(1-eased*.6);
          const arr=dustGeometry.attributes.position.array as Float32Array;
          for(let i=0;i<count;i++){let y=arr[i*3+1]+dt*speeds[i];if(y>3.5)y=-3.5;arr[i*3+1]=y;arr[i*3]+=Math.sin(t*.4+i)*dt*.02;}
          dustGeometry.attributes.position.needsUpdate=true;
          dust.rotation.y=eased*.6;
          renderer.render(scene,camera);
        };
        raf=requestAnimationFrame(frame);

        setReady(true);onReady("ready");

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
          noteGeo.forEach(geo=>geo.dispose());noteMain.dispose();noteAccent.dispose();
          labelTexture.dispose();liquidTexture.dispose();haloTexture.dispose();envTexture.dispose();pmrem.dispose();renderer.dispose();
          renderer.domElement.remove();
        };
      }catch{
        onReady("failed"); // No WebGL: show the CSS bottle instead.
      }
    })();

    return()=>{disposed=true;cleanup();onReady("loading");setReady(false);};
  },[look,onReady]);

  const toggleGyro=async()=>{
    if(!gyro){
      const DOE=window.DeviceOrientationEvent as unknown as {requestPermission?:()=>Promise<string>};
      try{if(typeof DOE.requestPermission==="function"&&(await DOE.requestPermission())!=="granted")return;}catch{return;}
    }
    setGyro(v=>!v);
  };

  return <>
    <div ref={host} className="room-3d" aria-hidden="true"/>
    {ready&&<div className="room-3d-controls" role="group" aria-label="Bottle motion controls">
      <button type="button" aria-pressed={spin} onClick={()=>setSpin(v=>!v)}>Auto-spin</button>
      <button type="button" aria-pressed={tilt} onClick={()=>setTilt(v=>!v)}>Tilt</button>
      {gyroAvailable&&<button type="button" aria-pressed={gyro} onClick={toggleGyro}>Gyro</button>}
      <label>Glow<input type="range" min=".3" max="2" step=".05" value={glow} onChange={ev=>setGlow(Number(ev.target.value))} aria-label="Glow intensity"/></label>
      <button type="button" onClick={()=>{ctl.current.resetAt=performance.now();}}>Reset</button>
    </div>}
  </>;
}
