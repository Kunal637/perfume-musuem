"use client";

import {useEffect,useRef} from "react";
import {materialScenes} from "./museum-materials";
import {useRoomResponse,responseStrength} from "./room-response";

const vertex=`attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
const fragment=`precision highp float;
varying vec2 uv;
uniform sampler2D photo;
uniform vec2 resolution;
uniform vec2 offset;
uniform vec2 displaySize;
uniform float time;
uniform int count;
uniform vec4 quadA[8];
uniform vec4 quadB[8];
uniform vec4 meta[8];
float edge(vec2 a,vec2 b,vec2 p){vec2 d=b-a;return (d.x*(p.y-a.y)-d.y*(p.x-a.x))/max(length(d),.01);}
void main(){
 vec2 p=(vec2(uv.x,1.-uv.y)*resolution-offset)/displaySize*vec2(1600.,900.);
 vec2 displacement=vec2(0.);float alpha=0.;vec3 light=vec3(0.);
 for(int i=0;i<8;i++){
  if(i>=count)break;
  vec2 a=quadA[i].xy,b=quadA[i].zw,c=quadB[i].xy,d=quadB[i].zw;
  float distance=min(min(edge(a,b,p),edge(b,c,p)),min(edge(c,d,p),edge(d,a,p)));
  float mask=smoothstep(0.,meta[i].z,distance);if(mask<.001)continue;
  float k=meta[i].x,amp=meta[i].y,phase=float(i)*1.93;
  vec2 flow=vec2(0.);
  if(k<.5){
   flow=vec2(sin(p.y*.095-time*1.5)+sin(p.x*.023+p.y*.05+time*.83)*.55,sin(p.x*.055-time*.95)*.30)*amp;
   float glint=pow(max(0.,sin(p.x*.095+p.y*.13-time*1.25)*sin(p.y*.18+time*.81)),12.);
   light+=vec3(.22,.43,.42)*glint*.22*mask;
  }else if(k<1.5){
   float suspension=smoothstep(a.y,max(c.y,d.y),p.y);
   flow=vec2((sin(p.y*.016-time*1.35+phase)+sin(p.y*.037+time*.77)*.32)*amp*(.15+suspension),sin(p.x*.02+time*.7)*amp*.13);
   light+=vec3(.022)*sin(p.y*.032-time*1.1+phase)*mask;
  }else if(k<2.5){
   float gust=.65+sin(time*.31+phase)*.35;
   flow=vec2(sin(time*1.45+p.y*.023+phase)+sin(time*2.7+p.x*.031)*.22,cos(time*1.1+p.x*.018+phase)*.35)*amp*gust;
  }else if(k<3.5){
   flow=vec2(sin(time*.075+phase)*70.+sin(time*.23)*9.,sin(time*.11+phase)*6.);
   flow*=min(1.,max(0.,distance*.8)/max(length(flow),.01));
  }else if(k<4.5){
   float band=pow(.5+.5*sin(p.x*.010+p.y*.006-time*.9+phase),8.);
   float secondary=pow(.5+.5*sin(p.x*.019-p.y*.009+time*.53),12.);
   light+=vec3(.18,.13,.063)*(band*.75+secondary*.3)*mask;
  }else{
   flow=vec2(sin(time*1.1+phase)*amp,sin(time*.73+phase)*amp*.45);
  }
  displacement+=flow*mask;alpha=max(alpha,mask);
 }
 vec3 color=texture2D(photo,clamp((p+displacement)/vec2(1600.,900.),.001,.999)).rgb;
 gl_FragColor=vec4(color+light,alpha);
}`;

/** Surface-local photographic animation. Architecture and type stay sharp.
 * Only the active room owns a GPU context; a 2D material fallback is retained. */
export function LivingMaterials({scene,active,paused}:{scene:string;active:boolean;paused:boolean}){
 const host=useRef<HTMLDivElement>(null),pause=useRef(paused),clock=useRef(0);pause.current=paused;
 const response=useRoomResponse(host,scene,active,paused);
 useEffect(()=>{
  const parent=host.current,config=materialScenes[scene];
  if(!parent||!config||(!config.regions.length&&!config.flows?.length)||!active||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const canvas=document.createElement("canvas"),air=document.createElement("canvas");parent.append(canvas,air);
  const gl=config.regions.length?canvas.getContext("webgl",{alpha:true,antialias:false,premultipliedAlpha:false,powerPreference:"low-power"}):null;
  const atmosphere=air.getContext("2d"),image=new Image(),smoke=new Image();smoke.src="/images/tobacco-smoke.webp";
  let fallback:CanvasRenderingContext2D|null=null,program:WebGLProgram|null=null,buffer:WebGLBuffer|null=null,texture:WebGLTexture|null=null;
  let raf=0,previous=0,last=0,ready=false,disposed=false,w=1,h=1,scale=1,ox=0,oy=0,ratio=1;
  const shaders:WebGLShader[]=[];
  const uniform=(name:string)=>gl!.getUniformLocation(program!,name);
  try{
   if(!gl)throw new Error("No GPU surface");
   const compile=(type:number,code:string)=>{const s=gl.createShader(type)!;shaders.push(s);gl.shaderSource(s,code);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error("Material shader unavailable");return s;};
   program=gl.createProgram()!;gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error("Material program unavailable");gl.useProgram(program);
   buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
   const at=gl.getAttribLocation(program,"position");gl.enableVertexAttribArray(at);gl.vertexAttribPointer(at,2,gl.FLOAT,false,0,0);
   texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
   const a=new Float32Array(32),b=new Float32Array(32),meta=new Float32Array(32);
   config.regions.slice(0,8).forEach((r,i)=>{a.set(r.quad.slice(0,4),i*4);b.set(r.quad.slice(4,8),i*4);meta.set([r.kind,r.strength,r.feather??12,0],i*4);});
   gl.uniform4fv(uniform("quadA[0]"),a);gl.uniform4fv(uniform("quadB[0]"),b);gl.uniform4fv(uniform("meta[0]"),meta);gl.uniform1i(uniform("count"),Math.min(8,config.regions.length));parent.dataset.renderer="webgl";
  }catch{
   const replacement=document.createElement("canvas");canvas.replaceWith(replacement);fallback=replacement.getContext("2d");parent.dataset.renderer="canvas";
  }
  // Cache feathered masks once. The 2D renderer uses the same architectural
  // boundaries as the shader, without hard-edged rectangular patches.
  const patches=fallback?config.regions.map(r=>{
   const xs=r.quad.filter((_,j)=>j%2===0),ys=r.quad.filter((_,j)=>j%2===1);
   const left=Math.floor(Math.min(...xs)),top=Math.floor(Math.min(...ys));
   const width=Math.ceil(Math.max(...xs))-left,height=Math.ceil(Math.max(...ys))-top;
   const layer=document.createElement("canvas"),mask=document.createElement("canvas");layer.width=mask.width=width;layer.height=mask.height=height;
   const mc=mask.getContext("2d")!,pixels=mc.createImageData(width,height),feather=r.kind===3?Math.max(32,r.feather??12):r.feather??12;
   for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    let distance=Infinity;
    for(let j=0;j<8;j+=2){const k=(j+2)%8,dx=r.quad[k]-r.quad[j],dy=r.quad[k+1]-r.quad[j+1];distance=Math.min(distance,(dx*(y+top-r.quad[j+1])-dy*(x+left-r.quad[j]))/Math.max(.01,Math.hypot(dx,dy)));}
    const m=Math.max(0,Math.min(1,distance/feather));pixels.data[(y*width+x)*4+3]=255*m*m*(3-2*m);
   }mc.putImageData(pixels,0,0);return {left,top,width,height,layer,mask,ctx:layer.getContext("2d")!};
  }):[];
  const surface=parent.firstElementChild as HTMLCanvasElement;
  const resize=()=>{w=parent.clientWidth;h=parent.clientHeight;ratio=Math.min(devicePixelRatio||1,w<760?1.15:1.5);surface.width=air.width=Math.round(w*ratio);surface.height=air.height=Math.round(h*ratio);scale=Math.max(w/1600,h/900);ox=(w-1600*scale)*(w<760?(config.mobilePosition??.5):w<1100?(config.tabletPosition??config.position??.5):(config.position??.5));oy=(h-900*scale)*.5;if(gl&&!fallback&&program){gl.viewport(0,0,surface.width,surface.height);gl.uniform2f(uniform("resolution"),w,h);gl.uniform2f(uniform("offset"),ox,oy);gl.uniform2f(uniform("displaySize"),1600*scale,900*scale);}};
  const observer=new ResizeObserver(resize);observer.observe(parent);resize();
  image.onload=()=>{if(disposed)return;if(gl&&!fallback&&program){gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);}ready=true;};image.src=config.photo;
  const render=(now:number)=>{
   raf=requestAnimationFrame(render);if(document.hidden||pause.current||!ready){previous=0;return;}clock.current+=previous?Math.min(.08,(now-previous)/1000):0;previous=now;if(now-last<(w<760?40:33))return;last=now;const t=clock.current;
   if(gl&&!fallback&&program){gl.uniform1f(uniform("time"),t);gl.drawArrays(gl.TRIANGLES,0,6);}
   if(fallback){
    const ctx=fallback;ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,w,h);ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);
    for(const [i,r] of config.regions.entries()){
     const patch=patches[i],{left,top,width,height,layer,mask}=patch,lc=patch.ctx;
     lc.clearRect(0,0,width,height);lc.globalCompositeOperation="source-over";
     if(r.kind===4){
      const x=((t*.14+i*.23)%1)*(width+200)-100,g=lc.createLinearGradient(x-100,0,x+100,0);
      g.addColorStop(0,"#ffe0a000");g.addColorStop(.5,"#ffe0a036");g.addColorStop(1,"#ffe0a000");lc.fillStyle=g;lc.fillRect(0,0,width,height);
     }else if(r.kind===3){
      const dx=Math.sin(t*.075+i*1.93)*70+Math.sin(t*.23)*9,dy=Math.sin(t*.11+i)*6;
      lc.drawImage(image,left/1600*image.naturalWidth,top/900*image.naturalHeight,width/1600*image.naturalWidth,height/900*image.naturalHeight,dx,dy,width,height);
      lc.globalCompositeOperation="destination-in";lc.drawImage(mask,dx,dy);lc.globalCompositeOperation="source-over";
     }else{
      for(let y=0;y<height;y+=3){
       const py=y+top,amp=r.strength,phase=i*1.93;
       const dx=r.kind===0?(Math.sin(py*.095-t*1.5)+Math.sin(py*.05+t*.83)*.55)*amp:
        r.kind===1?(Math.sin(py*.016-t*1.35+phase)+Math.sin(py*.037+t*.77)*.32)*amp*(.15+y/height):
        r.kind===2?(Math.sin(t*1.45+py*.023+phase)+Math.sin(t*2.7+left*.031)*.22)*amp*(.65+Math.sin(t*.31+phase)*.35):Math.sin(t*1.1+phase)*amp;
       const sy=Math.max(0,Math.min(897,py));
       lc.drawImage(image,0,sy/900*image.naturalHeight,image.naturalWidth,3/900*image.naturalHeight,-left+dx,y,1600,3.1);
      }
     }
     lc.globalCompositeOperation="destination-in";lc.drawImage(mask,0,0);lc.globalCompositeOperation="source-over";
     ctx.drawImage(layer,left,top);
    }ctx.restore();
   }
   if(atmosphere){const ctx=atmosphere;ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,w,h);ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);
    if(smoke.complete&&smoke.naturalWidth)for(const [i,f] of (config.flows??[]).entries()){
     for(let j=0;j<3;j++){const p=(t*(f.speed??.1)+j/3+i*.17)%1,fade=Math.sin(p*Math.PI),gust=responseStrength(response.current,now);ctx.save();ctx.globalAlpha=fade*f.opacity;ctx.translate(f.x+Math.sin(t*.43+j+i)*f.width*.13*p+gust*p*f.width*.3,f.y-p*f.height*.2);ctx.rotate(Math.sin(t*.23+j)*.1+gust*p*.12);const wide=f.width*(.65+p*.5);ctx.drawImage(smoke,-wide/2,-f.height*(.7+p*.3),wide,f.height*(.7+p*.3));ctx.restore();}
    }ctx.restore();
   }
   parent.dataset.materialTime=t.toFixed(2);parent.dataset.activeRegions=String(config.regions.length);
  };raf=requestAnimationFrame(render);
  return()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();image.onload=null;parent.replaceChildren();if(gl){shaders.forEach(s=>gl.deleteShader(s));gl.deleteProgram(program);gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.getExtension("WEBGL_lose_context")?.loseContext();}};
 },[scene,active]);
 return <div className="living-materials" ref={host} data-material-scene={scene} aria-hidden="true"/>;
}
