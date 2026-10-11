"use client";

import {useEffect,useRef} from "react";

const vertex=`attribute vec2 position;
varying vec2 uv;
void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
const fragment=`precision mediump float;
varying vec2 uv;
uniform sampler2D photograph;
uniform vec2 cover;
uniform vec2 origin;
uniform float time;
void main(){
  vec2 p=uv*cover+origin;
  float water=1.-smoothstep(.39,.51,p.y);
  float nearWater=1.-p.y;
  vec2 flow=vec2(sin(p.y*90.-time*1.4)+sin(p.x*39.+p.y*57.+time*.83),
                 sin(p.x*53.-time*.75)+sin(p.y*81.+time*1.1));
  vec2 samplePoint=p+flow*vec2(.0060,.0035)*water*nearWater;
  vec3 color=texture2D(photograph,clamp(samplePoint,.001,.999)).rgb;
  float glint=pow(max(0.,sin(p.x*64.+p.y*97.-time*.95)*sin(p.y*120.+time*.73)),14.);
  color+=vec3(.38,.7,.72)*glint*.24*water;
  color*=1.+sin(p.y*46.+p.x*11.-time*.8)*.045*water;
  gl_FragColor=vec4(color,water);
}`;

/** Only the photographed water is displaced. The architecture remains a
 * native, full-resolution image, including on devices without WebGL. */
export function MarineWater({active,paused}:{active:boolean;paused:boolean}){
  const ref=useRef<HTMLCanvasElement>(null);
  const fallbackRef=useRef<HTMLCanvasElement>(null);
  const running=useRef({active,paused});running.current={active,paused};
  useEffect(()=>{
    const canvas=ref.current;if(!canvas)return;
    let stopFallback:(()=>void)|undefined;
    const startFallback=()=>{
      if(stopFallback)return;
      const surface=fallbackRef.current,ctx=surface?.getContext("2d");if(!surface||!ctx)return;
      const source=new Image();let w=1,h=1,ready=false,id=0,previous=0,last=0,time=0;
      const resize=()=>{w=surface.clientWidth;h=surface.clientHeight;const ratio=Math.min(devicePixelRatio,1.25);surface.width=Math.round(w*ratio);surface.height=Math.round(h*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);};
      const observer=new ResizeObserver(resize);observer.observe(surface);resize();
      const draw=()=>{
        const imageAspect=source.naturalWidth/source.naturalHeight,aspect=w/h;
        const sw=source.naturalWidth*Math.min(1,aspect/imageAspect),sh=source.naturalHeight*Math.min(1,imageAspect/aspect);
        const left=(source.naturalWidth-sw)*(w<760?.72:.5),top=(source.naturalHeight-sh)/2;
        ctx.clearRect(0,0,w,h);
        // Narrow photographic strips create a moving water surface without
        // relying on GPU availability; the architecture is never redrawn.
        for(let y=0;y<h;y+=4){
          const sy=top+y/h*sh,depth=sy/source.naturalHeight;
          if(depth<.49)continue;
          const mask=Math.min(1,(depth-.49)/.12);
          const offset=(Math.sin(depth*90-time*1.4)*3.5+Math.sin(depth*57+time*.83)*2.5)*mask;
          const rowHeight=Math.min(4,h-y);
          ctx.globalAlpha=mask;
          ctx.drawImage(source,Math.max(0,left+offset),sy,Math.min(sw,source.naturalWidth-Math.max(0,left+offset)),rowHeight/h*sh,0,y,w,rowHeight);
        }
        surface.dataset.state="ready";surface.dataset.waterTime=time.toFixed(2);
      };
      source.onload=()=>{ready=true;draw();};source.src="/images/marines-gallery.webp";
      const frame=(now:number)=>{id=requestAnimationFrame(frame);const dt=previous?(now-previous)/1000:0;previous=now;
        if(!ready||document.hidden||!running.current.active||running.current.paused)return;
        time+=dt;if(now-last<40)return;last=now;draw();};id=requestAnimationFrame(frame);
      const reset=()=>{previous=0;};document.addEventListener("visibilitychange",reset);
      stopFallback=()=>{cancelAnimationFrame(id);observer.disconnect();source.onload=null;document.removeEventListener("visibilitychange",reset);};
    };
    const gl=canvas.getContext("webgl",{alpha:true,antialias:false,premultipliedAlpha:false,powerPreference:"low-power"});
    if(!gl){canvas.dataset.state="fallback";canvas.dataset.reason="webgl-unavailable";startFallback();return()=>stopFallback?.();}
    const shaders:WebGLShader[]=[];
    const compile=(type:number,source:string)=>{
      const shader=gl.createShader(type);if(!shader)throw new Error("Shader unavailable");
      shaders.push(shader);gl.shaderSource(shader,source);gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error("Water shader unavailable");
      return shader;
    };
    let program:WebGLProgram|null=null,buffer:WebGLBuffer|null=null,texture:WebGLTexture|null=null;
    let raf=0,previous=0,last=0,clock=0,ready=false,disposed=false;
    let observer:ResizeObserver|undefined;
    const photo=new Image();
    const lost=(event:Event)=>{event.preventDefault();ready=false;canvas.dataset.state="fallback";startFallback();};
    canvas.addEventListener("webglcontextlost",lost);
    try{
      program=gl.createProgram();if(!program)throw new Error("Water program unavailable");
      gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));
      gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error("Water program unavailable");
      gl.useProgram(program);
      buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
      const position=gl.getAttribLocation(program,"position");gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
      const cover=gl.getUniformLocation(program,"cover"),origin=gl.getUniformLocation(program,"origin"),time=gl.getUniformLocation(program,"time");
      texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      const resize=()=>{
        const w=canvas.clientWidth,h=canvas.clientHeight,ratio=Math.min(devicePixelRatio,w<760?1:1.35);
        canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);gl.viewport(0,0,canvas.width,canvas.height);
        const imageAspect=(photo.naturalWidth||16)/(photo.naturalHeight||9),aspect=w/h;
        gl.uniform2f(cover,Math.min(1,aspect/imageAspect),Math.min(1,imageAspect/aspect));
        gl.uniform2f(origin,(1-Math.min(1,aspect/imageAspect))*(w<760?.72:.5),(1-Math.min(1,imageAspect/aspect))*.5);
      };
      observer=new ResizeObserver(resize);observer.observe(canvas);
      photo.onload=()=>{
        if(disposed)return;
        gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,photo);
        resize();ready=true;canvas.dataset.state="ready";
        gl.uniform1f(time,0);gl.drawArrays(gl.TRIANGLES,0,6);
      };
      photo.onerror=()=>{canvas.dataset.state="fallback";};
      photo.src="/images/marines-gallery.webp";
      const frame=(now:number)=>{
        raf=requestAnimationFrame(frame);
        const delta=previous?(now-previous)/1000:0;previous=now;
        if(!ready||document.hidden||!running.current.active||running.current.paused)return;
        clock+=delta;if(now-last<33)return;last=now;
        gl.uniform1f(time,clock);gl.drawArrays(gl.TRIANGLES,0,6);
        canvas.dataset.waterTime=clock.toFixed(2);
      };raf=requestAnimationFrame(frame);
    }catch(error){canvas.dataset.state="fallback";canvas.dataset.reason=String(error);startFallback();}
    const reset=()=>{previous=0;};document.addEventListener("visibilitychange",reset);
    return()=>{disposed=true;cancelAnimationFrame(raf);stopFallback?.();observer?.disconnect();photo.onload=null;photo.onerror=null;
      document.removeEventListener("visibilitychange",reset);canvas.removeEventListener("webglcontextlost",lost);
      shaders.forEach(s=>gl.deleteShader(s));gl.deleteProgram(program);gl.deleteBuffer(buffer);gl.deleteTexture(texture);};
  },[]);
  return <><canvas className="marine-water marine-water--gpu" ref={ref} aria-hidden="true" data-state="loading"/>
    <canvas className="marine-water marine-water--fallback" ref={fallbackRef} aria-hidden="true" data-state="loading"/></>;
}
