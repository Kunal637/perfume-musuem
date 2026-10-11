"use client";

import {useEffect,useRef,useState} from "react";
import {Music2,Volume2} from "lucide-react";

export type MuseumDestination="arrival"|"atrium"|"marines"|"gardens"|"sultans"|"cedar"|"amber"|"souk"|"pastry"|"liquors"|"riviera"|"tobacco";
const scores={
  arrival:{chord:[52,59,66,71],melody:[76,78,83,78,76,71,74,78],tempo:54,tone:"sine",label:"Above the cloudline"},
  atrium:{chord:[50,57,61,69],melody:[78,81,85,81,78,76,73,76],tempo:58,tone:"sine",label:"The grand atrium"},
  marines:{chord:[45,52,59,64],melody:[76,83,81,76,71,76,78,83],tempo:64,tone:"triangle",label:"Tides in blue"},
  gardens:{chord:[53,60,64,69],melody:[81,84,88,84,79,81,76,79],tempo:68,tone:"triangle",label:"A garden in bloom"},
  sultans:{chord:[40,47,52,59],melody:[64,65,68,71,69,68,65,64],tempo:62,tone:"triangle",label:"Amber after dusk"},
  cedar:{chord:[48,55,59,64],melody:[76,79,83,81,79,76,74,76],tempo:76,tone:"sine",label:"Cedar in daylight"},
  amber:{chord:[50,57,60,64],melody:[69,72,76,74,72,69,67,65],tempo:86,tone:"sine",label:"After hours · Amber jazz quartet"},
  souk:{chord:[50,57,62,69],melody:[62,63,66,67,69,70,69,66],tempo:78,tone:"triangle",label:"Caravan in sunlight"},
  pastry:{chord:[53,60,64,69],melody:[77,81,84,83,79,76,77,72],tempo:92,tone:"sine",label:"Sunday at the pâtisserie"},
  liquors:{chord:[45,52,55,59],melody:[71,74,76,74,71,67,69,66],tempo:66,tone:"sine",label:"The amber hour"},
  riviera:{chord:[50,57,61,66],melody:[78,81,85,83,81,78,76,73],tempo:70,tone:"sine",label:"Linen in the sea breeze"},
  tobacco:{chord:[40,47,52,56],melody:[64,68,71,68,66,64,59,61],tempo:62,tone:"triangle",label:"The last light · Tobacco & leather"},
} as const;
const identities:Record<MuseumDestination,string>={
 arrival:"Cinematic ambient",atrium:"Glass harmonics",marines:"Tidal marimba",gardens:"Harp garden waltz",
 sultans:"Modal strings & reed",cedar:"Modern lounge groove",amber:"After-hours jazz",souk:"Caravan percussion",
 pastry:"Pâtisserie waltz",liquors:"Crystal nocturne",riviera:"Coastal bossa",tobacco:"Western guitar"
};
type Engine={context:AudioContext;master:GainNode;timer:ReturnType<typeof setInterval>;dispose:()=>void};

/** An original, lightweight generative score. Playback always starts with a tap. */
export function MuseumAudio({destination}:{destination:MuseumDestination}){
  const [playing,setPlaying]=useState(false),[starting,setStarting]=useState(false),[failed,setFailed]=useState(false);
  const engine=useRef<Engine|null>(null),scene=useRef(destination),pending=useRef(false),mounted=useRef(true);
  const control=useRef<HTMLDivElement>(null);
  scene.current=destination;
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;engine.current?.dispose();engine.current=null;};},[]);
  const stop=()=>{engine.current?.dispose();engine.current=null;setPlaying(false);};
  const start=async()=>{
    if(pending.current||engine.current)return;
    pending.current=true;setStarting(true);let context:AudioContext|undefined;
    try{
      const Audio=window.AudioContext??(window as typeof window&{webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
      if(!Audio)throw new Error("Audio unavailable");
      context=new Audio();await context.resume();
      if(!mounted.current){void context.close();return;}
      const ctx=context,master=ctx.createGain(),limiter=ctx.createDynamicsCompressor();
      master.gain.setValueAtTime(0,ctx.currentTime);master.gain.linearRampToValueAtTime(scene.current==="amber"?.7:.5,ctx.currentTime+1.2);
      const meter=ctx.createAnalyser();meter.fftSize=256;const levelSamples=new Float32Array(256);
      limiter.threshold.value=-18;limiter.ratio.value=4;master.connect(limiter).connect(meter).connect(ctx.destination);
      let musicBus=ctx.createGain();musicBus.connect(master);
      const buses=new Set<GainNode>([musicBus]);
      const reverb=ctx.createConvolver(),wet=ctx.createGain();wet.gain.value=.24;
      const impulse=ctx.createBuffer(2,ctx.sampleRate*1.8,ctx.sampleRate);
      for(let c=0;c<2;c++){const data=impulse.getChannelData(c);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,3);}
      reverb.buffer=impulse;reverb.connect(wet).connect(master);musicBus.connect(reverb);
      const sources=new Set<AudioScheduledSourceNode>();
      const note=(midi:number,at:number,duration:number,volume:number,type:OscillatorType)=>{
        const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type;osc.frequency.value=440*Math.pow(2,(midi-69)/12);
        gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(volume,at+Math.min(.12,duration*.15));gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
        osc.connect(gain);gain.connect(musicBus);sources.add(osc);
        osc.onended=()=>{sources.delete(osc);osc.disconnect();gain.disconnect();};osc.start(at);osc.stop(at+duration+.03);
      };
      const noise=ctx.createBuffer(1,ctx.sampleRate*6,ctx.sampleRate),data=noise.getChannelData(0);let brown=0;
      for(let i=0;i<data.length;i++){brown=(brown+(Math.random()*2-1)*.03)/1.02;data[i]=brown*3;}
      // Original quartet arrangement: a ii–V–I–VI progression, swung phrasing,
      // reed harmonics with gentle vibrato, piano comping and an upright-like bass.
      const saxWave=ctx.createPeriodicWave(new Float32Array(9),new Float32Array([0,1,.62,.38,.22,.15,.09,.05,.025]));
      const sax=(midi:number,at:number,duration:number)=>{
        const osc=ctx.createOscillator(),gain=ctx.createGain(),tone=ctx.createBiquadFilter();
        const vibrato=ctx.createOscillator(),depth=ctx.createGain();
        osc.setPeriodicWave(saxWave);const hz=440*Math.pow(2,(midi-69)/12);
        osc.frequency.setValueAtTime(hz*.991,at);osc.frequency.exponentialRampToValueAtTime(hz,at+.08);
        tone.type="lowpass";tone.frequency.value=1800;tone.Q.value=.55;
        vibrato.frequency.value=5.1;depth.gain.setValueAtTime(0,at);depth.gain.linearRampToValueAtTime(6,at+.25);
        vibrato.connect(depth).connect(osc.detune);
        gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.095,at+.055);gain.gain.setTargetAtTime(.07,at+.12,.06);gain.gain.setTargetAtTime(.0001,at+duration*.67,.09);
        osc.connect(tone).connect(gain);gain.connect(musicBus);
        sources.add(osc);sources.add(vibrato);osc.onended=()=>{sources.delete(osc);sources.delete(vibrato);osc.disconnect();vibrato.disconnect();depth.disconnect();tone.disconnect();gain.disconnect();};
        osc.start(at);vibrato.start(at);osc.stop(at+duration+.45);vibrato.stop(at+duration+.45);
      };
      const brushBuffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.4),ctx.sampleRate);
      const brushData=brushBuffer.getChannelData(0);for(let i=0;i<brushData.length;i++)brushData[i]=Math.random()*2-1;
      const brush=(at:number,accent:boolean)=>{
        const hit=ctx.createBufferSource(),eq=ctx.createBiquadFilter(),gain=ctx.createGain();hit.buffer=brushBuffer;eq.type="highpass";eq.frequency.value=accent?2300:4200;
        gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(accent?.035:.015,at+.012);gain.gain.exponentialRampToValueAtTime(.0001,at+.24);
        hit.connect(eq).connect(gain).connect(musicBus);sources.add(hit);hit.onended=()=>{sources.delete(hit);hit.disconnect();eq.disconnect();gain.disconnect();};hit.start(at);hit.stop(at+.3);
      };
      const jazz=(step:number,at:number,beat:number)=>{
        const bar=Math.floor(step/4)%4,b=step%4;
        const chords=[[53,60,64,69],[53,59,64,69],[52,59,62,67],[55,61,64,70]];
        const bass=[[38,45,48,49],[43,47,50,47],[36,43,47,46],[45,49,52,49]];
        const phrases=[[69,72,76,74],[71,69,67,65],[67,71,74,76],[73,70,69,67]];
        note(bass[bar][b],at,beat*.88,.115,"sine");note(bass[bar][b]+12,at,beat*.35,.017,"triangle");
        if(b===0||b===2)chords[bar].forEach((m,i)=>{note(m,at+i*.009+(b===2?beat*.12:0),beat*1.5,.026,"triangle");note(m+12,at+i*.009,beat*.35,.006,"sine");});
        brush(at,b===1||b===3);if(b===1||b===3)brush(at+beat*.66,false);
        // Leave room between phrases so the melody can breathe.
        if(!(bar===2&&b===3))sax(phrases[bar][b],at+(b%2?beat*.07:0),beat*(b===3?.6:.86));
        if(b===1)sax(phrases[bar][b]+2,at+beat*.66,beat*.24);
      };
      const pluck=(midi:number,at:number,duration:number)=>{
        const osc=ctx.createOscillator(),overtone=ctx.createOscillator(),gain=ctx.createGain(),tone=ctx.createBiquadFilter();
        const hz=440*Math.pow(2,(midi-69)/12);osc.type="triangle";osc.frequency.value=hz;overtone.type="sine";overtone.frequency.value=hz*2.002;
        tone.type="lowpass";tone.frequency.setValueAtTime(2600,at);tone.frequency.exponentialRampToValueAtTime(520,at+duration);
        gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.09,at+.012);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
        osc.connect(tone);overtone.connect(tone);tone.connect(gain);gain.connect(musicBus);
        sources.add(osc);sources.add(overtone);osc.onended=()=>{sources.delete(osc);sources.delete(overtone);osc.disconnect();overtone.disconnect();tone.disconnect();gain.disconnect();};
        osc.start(at);overtone.start(at);osc.stop(at+duration+.03);overtone.stop(at+duration+.03);
      };
      // FM mallets and soft breath harmonics add distinct timbres without downloads.
      const bell=(midi:number,at:number,duration:number,volume=.065)=>{
        const carrier=ctx.createOscillator(),modulator=ctx.createOscillator(),depth=ctx.createGain(),gain=ctx.createGain();
        const hz=440*Math.pow(2,(midi-69)/12);carrier.frequency.value=hz;modulator.frequency.value=hz*2.76;
        depth.gain.setValueAtTime(hz*.65,at);depth.gain.exponentialRampToValueAtTime(.01,at+duration*.55);
        modulator.connect(depth).connect(carrier.frequency);gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(volume,at+.008);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
        carrier.connect(gain);gain.connect(musicBus);sources.add(carrier);sources.add(modulator);
        carrier.onended=()=>{sources.delete(carrier);sources.delete(modulator);carrier.disconnect();modulator.disconnect();depth.disconnect();gain.disconnect();};
        carrier.start(at);modulator.start(at);carrier.stop(at+duration+.03);modulator.stop(at+duration+.03);
      };
      const signature=(room:MuseumDestination,step:number,at:number,beat:number)=>{
        const score=scores[room],m=score.melody[step%8];
        if(room==="arrival"){
          if(step%8===0)score.chord.forEach((n,i)=>note(n,at+i*.18,beat*7.7,.031,"sine"));
          if(step%8===0||step%8===6)bell(m,at,beat*3,.034);
        }else if(room==="atrium"){
          if(step%6===0)note(38,at,beat*5.8,.045,"sine");
          bell([74,81,85,90,85,81][step%6],at,beat*2.8,.045);
          if(step%3===2)bell(93,at+beat*.5,beat*1.5,.012);
        }else if(room==="marines"){
          if(step%8===0)[33,45,52,59].forEach((n,i)=>note(n,at+i*.12,beat*7.6,.025,"sine"));
          if(step%3!==2)bell(m-12,at,beat*1.8,.08);
          if(step%4===3)bell(m-5,at+beat*.58,beat,.028);
        }else if(room==="gardens"){
          const chord=[[53,60,64,69],[55,62,65,69],[52,59,64,67],[53,60,64,69]][Math.floor(step/6)%4];
          pluck(chord[step%4]+12,at,beat*1.1);
          if(step%3===0)note(chord[0]-12,at,beat*2.8,.04,"sine");
          if(step%3===1){note(m,at+.08,beat*1.7,.04,"sine");note(m+12,at+.08,beat*1.3,.006,"sine");}
          if(step%18===11){note(100,at+.22,.12,.019,"sine");note(103,at+.4,.15,.014,"sine");}
        }else if(room==="sultans"){
          if(step%8===0)[40,47,52].forEach((n,i)=>note(n,at+i*.08,beat*7.5,.032,"triangle"));
          if(step%2===0){note(m,at,beat*1.8,.061,"triangle");note(m+12,at+.1,beat*1.4,.009,"sine");}
          else {pluck(m+12,at,beat*.8);pluck(m+7,at+beat*.5,beat*.5);}
          if(step%4===0)note(35,at,.23,.09,"sine");
          if(step%4===3)brush(at,false);
        }else if(room==="cedar"){
          const chord=[[48,55,59,64],[45,52,55,60],[50,57,60,65],[43,50,55,59]][Math.floor(step/4)%4];
          note(chord[0]-12+(step%4===2?7:0),at,beat*.72,.085,"sine");
          if(step%2===0)chord.slice(1).forEach((n,i)=>note(n,at+beat*.35+i*.01,beat*.6,.028,"triangle"));
          brush(at+beat*.5,false);if(step%4===1||step%4===3)brush(at,true);
          if(step%2===1)bell(m,at+beat*.18,beat*.8,.04);
        }
      };
      const caravan=(step:number,at:number,beat:number)=>{
        const phrase=[62,63,66,67,69,70,69,66,67,66,63,62,57,62,66,63];
        pluck(phrase[step%16],at,beat*1.2);
        if(step%4===1)pluck(phrase[(step+1)%16],at+beat*.64,beat*.44);
        if(step%8===0)[50,57].forEach((m,i)=>note(m,at+i*.04,beat*7.6,.034,"sine"));
        if(step%4===0||step%4===2){note(38,at,.19,.075,"sine");brush(at+.025,false);}
        if(step%4===3){note(62,at,.09,.024,"triangle");brush(at+.035,false);}
        // Sparse metallic caravan chimes in the distance, no sampled recording.
        if(step%24===11){note(88,at+.13,.9,.013,"sine");note(95,at+.16,.65,.007,"sine");}
      };
      // A light cafe waltz: rounded keys, walking bass and delicate ceramic-like overtones.
      const patisserie=(step:number,at:number,beat:number)=>{
        const bar=Math.floor(step/3)%4,b=step%3;
        const chords=[[53,60,64,69],[55,62,65,69],[52,59,62,67],[53,60,64,69]];
        const melody=[77,81,84,83,81,79,76,79,83,81,79,77];
        if(b===0)note(chords[bar][0]-12,at,beat*2.2,.08,"sine");
        if(b!==0)chords[bar].slice(1).forEach((m,i)=>note(m,at+i*.012,beat*.85,.024,"triangle"));
        note(melody[step%12],at,beat*1.3,.055,"sine");
        note(melody[step%12]+19,at+.004,beat*.23,.006,"sine");
        if(b===2)brush(at,false);
        if(step%36===19){note(94,at+.18,.3,.012,"sine");note(101,at+.2,.19,.004,"sine");}
      };
      const littleClink=()=>{if(scene.current!=="pastry"||ctx.state!=="running")return;const at=ctx.currentTime+.01;note(89,at,.6,.035,"sine");note(96,at+.1,.4,.018,"sine");};
      window.addEventListener("museum-pastry-discovery",littleClink);
      // A short procedural liquid foley buffer: a filtered stream with resonant
      // air bubbles, followed by the inharmonic ring of crystal and ice.
      const pourBuffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*1.65),ctx.sampleRate);
      const pourData=pourBuffer.getChannelData(0);let smoothNoise=0;
      for(let i=0;i<pourData.length;i++){
        const t=i/ctx.sampleRate,p=t/1.65;
        smoothNoise=smoothNoise*.72+(Math.random()*2-1)*.28;
        const bubbles=Math.sin(2*Math.PI*(560*t+22*Math.sin(t*19)))*Math.pow(Math.max(0,Math.sin(t*47)),8);
        pourData[i]=(smoothNoise*.5+bubbles*.16)*Math.pow(Math.sin(Math.PI*p),.65);
      }
      const crystal=(at:number)=>[84,91,98,103].forEach((m,i)=>note(m,at+i*.019,.75-i*.13,.027/(i+1),"sine"));
      const pour=(at:number)=>{
        const source=ctx.createBufferSource(),eq=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=pourBuffer;
        eq.type="bandpass";eq.frequency.setValueAtTime(1100,at);eq.frequency.linearRampToValueAtTime(720,at+1.5);eq.Q.value=.7;gain.gain.value=.3;
        source.connect(eq).connect(gain).connect(musicBus);sources.add(source);
        source.onended=()=>{sources.delete(source);source.disconnect();eq.disconnect();gain.disconnect();};source.start(at);source.stop(at+1.7);crystal(at+1.52);
      };
      const amberHour=(step:number,at:number,beat:number)=>{
        const chords=[[45,52,55,59],[48,55,59,62],[43,50,54,59],[45,52,55,59]],bar=Math.floor(step/4)%4;
        if(step%4===0){chords[bar].forEach((m,i)=>note(m,at+i*.045,beat*3.8,.025,"sine"));note(chords[bar][0]-12,at,beat*2.7,.07,"sine");}
        if(step%2===0){bell([71,74,76,74,71,67,69,66][Math.floor(step/2)%8],at+.06,beat*2.4,.055);brush(at+.15,false);}
        if(step%24===5)pour(at+.12);
      };
      let lastCrystal=-10;
      const swirlCrystal=()=>{if(scene.current!=="liquors"||ctx.state!=="running"||ctx.currentTime-lastCrystal<1)return;lastCrystal=ctx.currentTime;crystal(ctx.currentTime+.02);};
      window.addEventListener("museum-liquors-swirl",swirlCrystal);
      const coast=(step:number,at:number,beat:number)=>{
        const chords=[[50,57,61,66],[54,61,64,69],[55,62,66,69],[57,61,64,71]],bar=Math.floor(step/8)%4;
        if(step%8===0)chords[bar].forEach((m,i)=>note(m,at+i*.08,beat*7.7,.024,"sine"));
        if(step%2===0){const m=[78,81,85,83,81,78,76,73][Math.floor(step/2)%8];note(m,at,beat*2,.035,"sine");note(m+12,at+.02,beat*.7,.004,"sine");}
        if(step%4===1||step%4===3){pluck(chords[bar][1]+12,at+beat*.65,beat*.55);brush(at+beat*.7,false);}
        if(step%4===0||step%4===2)note(chords[bar][0]-12,at,beat*.85,.065,"sine");
        // Infrequent distant gull-like calls, synthesized with a soft descending glide.
        if(step%40===13){
          const call=ctx.createOscillator(),gain=ctx.createGain(),atCall=at+.2;call.type="sine";
          call.frequency.setValueAtTime(1160,atCall);call.frequency.exponentialRampToValueAtTime(1730,atCall+.14);call.frequency.exponentialRampToValueAtTime(930,atCall+.55);
          gain.gain.setValueAtTime(0,atCall);gain.gain.linearRampToValueAtTime(.008,atCall+.11);gain.gain.exponentialRampToValueAtTime(.0001,atCall+.6);
          call.connect(gain).connect(reverb);sources.add(call);call.onended=()=>{sources.delete(call);call.disconnect();gain.disconnect();};call.start(atCall);call.stop(atCall+.65);
        }
      };
      // Restrained western guitar voicings and irregular, close ember crackles.
      // Procedural sound keeps the gallery lightweight; no audio/video downloads.
      const crackle=(at:number,strength:number)=>{
        const source=ctx.createBufferSource(),eq=ctx.createBiquadFilter(),gain=ctx.createGain();
        source.buffer=brushBuffer;eq.type="bandpass";eq.frequency.value=1300+Math.random()*2100;eq.Q.value=.65;
        gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(strength,at+.003);gain.gain.exponentialRampToValueAtTime(.0001,at+.045+Math.random()*.065);
        source.connect(eq).connect(gain).connect(musicBus);sources.add(source);
        source.onended=()=>{sources.delete(source);source.disconnect();eq.disconnect();gain.disconnect();};source.start(at);source.stop(at+.15);
      };
      const western=(step:number,at:number,beat:number)=>{
        const chords=[[40,47,52,56],[45,52,57,61],[43,50,55,59],[40,47,52,56]],chord=chords[Math.floor(step/8)%4];
        if(step%4===0){note(chord[0]-12,at,beat*3.5,.047,"sine");chord.slice(1).forEach((m,i)=>note(m,at+i*.09,beat*3.8,.02,"triangle"));}
        if(step%2===0)pluck([64,68,71,68,66,64,59,61][Math.floor(step/2)%8],at,beat*1.7);
        const count=2+Math.floor(Math.random()*4);
        for(let i=0;i<count;i++)crackle(at+Math.random()*beat,.012+Math.random()*.023);
        if(step%16===11)brush(at+beat*.4,false);
      };
      let lastDraw=-10;
      const cigarDraw=()=>{if(scene.current!=="tobacco"||ctx.state!=="running"||ctx.currentTime-lastDraw<4)return;lastDraw=ctx.currentTime;for(let i=0;i<5;i++)crackle(ctx.currentTime+.025+i*.12,.025+Math.random()*.015);};
      window.addEventListener("museum-tobacco-draw",cigarDraw);
      let lastRipple=-10;
      const waterDrop=()=>{
        if(scene.current!=="riviera"||ctx.state!=="running"||ctx.currentTime-lastRipple<.5)return;
        const at=ctx.currentTime+.01;lastRipple=at;
        const osc=ctx.createOscillator(),gain=ctx.createGain();osc.frequency.setValueAtTime(760,at);osc.frequency.exponentialRampToValueAtTime(210,at+.23);
        gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.06,at+.012);gain.gain.exponentialRampToValueAtTime(.0001,at+.33);
        osc.connect(gain);gain.connect(musicBus);sources.add(osc);osc.onended=()=>{sources.delete(osc);osc.disconnect();gain.disconnect();};osc.start(at);osc.stop(at+.36);
      };
      window.addEventListener("museum-riviera-ripple",waterDrop);
      const air=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),airGain=ctx.createGain();air.buffer=noise;air.loop=true;filter.type="lowpass";filter.frequency.value=900;airGain.gain.value=0;
      air.connect(filter).connect(airGain).connect(master);air.start();sources.add(air);
      let step=0,next=ctx.currentTime+.06,lastScene=scene.current,disposed=false;
      const schedule=()=>{
        if(ctx.state!=="running")return;
        meter.getFloatTimeDomainData(levelSamples);
        const level=Math.sqrt(levelSamples.reduce((sum,n)=>sum+n*n,0)/levelSamples.length);
        if(control.current){control.current.dataset.level=level.toFixed(5);control.current.style.setProperty("--music-level",String(Math.min(1.5,.25+level*35)));}
        if(lastScene!==scene.current){
          const oldBus=musicBus,now=ctx.currentTime;oldBus.gain.cancelScheduledValues(now);oldBus.gain.setTargetAtTime(0,now,.16);
          musicBus=ctx.createGain();musicBus.gain.setValueAtTime(0,now);musicBus.gain.linearRampToValueAtTime(1,now+.65);musicBus.connect(master);musicBus.connect(reverb);buses.add(musicBus);
          setTimeout(()=>{oldBus.disconnect();buses.delete(oldBus);},1500);
          lastScene=scene.current;step=0;next=now+.08;master.gain.cancelScheduledValues(now);master.gain.setTargetAtTime(lastScene==="amber"?.7:.5,now,.3);
        }
        const score=scores[lastScene];
        airGain.gain.setTargetAtTime(lastScene==="tobacco"?.035+.014*Math.sin(ctx.currentTime*.31):lastScene==="riviera"?.18+.09*Math.sin(ctx.currentTime*.43)+.025*Math.sin(ctx.currentTime*.77):lastScene==="marines"?.4+.16*Math.sin(ctx.currentTime*.7):lastScene==="pastry"?.016+Math.pow(Math.max(0,Math.sin(ctx.currentTime*.18)),16)*.13:lastScene==="gardens"?.045:lastScene==="souk"?.11+.04*Math.sin(ctx.currentTime*.23):.012,ctx.currentTime,.6);
        while(next<ctx.currentTime+.3){
          const beat=60/score.tempo;
          if(lastScene==="tobacco"){western(step,next,beat);next+=beat;step++;continue;}
          if(lastScene==="amber"){jazz(step,next,beat);next+=beat;step++;continue;}
          if(lastScene==="riviera"){coast(step,next,beat);next+=beat;step++;continue;}
          if(lastScene==="liquors"){amberHour(step,next,beat);next+=beat;step++;continue;}
          if(lastScene==="pastry"){patisserie(step,next,beat);next+=beat;step++;continue;}
          if(lastScene==="souk"){caravan(step,next,beat);next+=beat;step++;continue;}
          signature(lastScene,step,next,beat);
          next+=beat;step++;
        }
      };
      schedule();const timer=setInterval(schedule,120);
      const visibility=()=>{if(disposed)return;if(document.hidden)void ctx.suspend();else void ctx.resume().catch(()=>{});};
      document.addEventListener("visibilitychange",visibility);
      const dispose=()=>{
        if(disposed)return;disposed=true;window.removeEventListener("museum-pastry-discovery",littleClink);window.removeEventListener("museum-liquors-swirl",swirlCrystal);window.removeEventListener("museum-riviera-ripple",waterDrop);window.removeEventListener("museum-tobacco-draw",cigarDraw);clearInterval(timer);document.removeEventListener("visibilitychange",visibility);
        const now=ctx.currentTime;master.gain.cancelScheduledValues(now);master.gain.setTargetAtTime(0,now,.08);
        setTimeout(()=>{sources.forEach(s=>{try{s.stop();}catch{}});sources.clear();buses.forEach(bus=>bus.disconnect());buses.clear();void ctx.close();},300);
      };
      engine.current={context:ctx,master,timer,dispose};setPlaying(true);setFailed(false);
    }catch{if(context)void context.close();if(mounted.current)setFailed(true);}
    finally{pending.current=false;if(mounted.current)setStarting(false);}
  };
  return <div ref={control} className="museum-music" data-playing={playing} data-score={destination}>
    <button type="button" className="music-toggle" aria-pressed={playing} disabled={starting}
      aria-label={playing?"Pause museum music":"Play museum music"} onClick={()=>playing?stop():void start()}
      title={playing?scores[destination].label:"Play music and environmental sound"}>
      {playing?<Volume2 size={17} aria-hidden="true"/>:<Music2 size={17} aria-hidden="true"/>}
      <span>{starting?"Starting…":playing?"Sound on":"Enable sound"}</span>
      {playing&&<span className="music-equalizer" aria-hidden="true"><i/><i/><i/></span>}
    </button>
    <span className="music-score-label" aria-live="polite">{identities[destination]}</span>
    {failed&&<span className="music-status" role="status">Sound unavailable. Tap to retry.</span>}
  </div>;
}
