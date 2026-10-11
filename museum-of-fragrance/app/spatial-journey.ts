"use client";
import {useEffect,useRef,type RefObject} from "react";
import type {MuseumDestination} from "./museum-audio";

const route=["arrival","atrium","marines","gardens","sultans","cedar","amber","souk","pastry","liquors","riviera","tobacco"];
const selectors:Record<string,string>={arrival:".exterior-world",atrium:".lobby-world",marines:".marines-gallery",gardens:".gardens-gallery",sultans:".sultans-gallery",cedar:".cedar-gallery",amber:".amber-gallery",souk:".souk-gallery",pastry:".pastry-gallery",liquors:".liquors-gallery",riviera:".riviera-gallery",tobacco:".tobacco-gallery"};

/** Native scroll selects rooms; a level camera crosses each short threshold. */
export function useSpatialJourney(root:RefObject<HTMLElement|null>,destination:MuseumDestination,reduced:boolean){
 const previous=useRef<MuseumDestination>(destination);
 useEffect(()=>{
  const scene=root.current,old=previous.current;previous.current=destination;
  if(!scene||old===destination||reduced)return;
  // Arrival and atrium are already joined by the scroll-scrubbed threshold.
  // Replaying a timed departure here would resurrect the faded exterior.
  if([old,destination].every(room=>room==="arrival"||room==="atrium"))return;
  const from=scene.querySelector<HTMLElement>(selectors[old]??".lobby-world"),to=scene.querySelector<HTMLElement>(selectors[destination]??".lobby-world");
  if(!from||!to||from===to)return;
  const index=route.indexOf(destination),direction=index>route.indexOf(old)?1:-1;
  const mobile=window.matchMedia("(max-width: 760px)").matches;
  // Use the same level, overlapping dissolve in either direction.
  const scale=mobile?.025:.035;
  const duration=mobile?600:760;
  const options={duration,easing:"cubic-bezier(.22,.72,.23,1)",fill:"none" as FillMode};
  scene.dataset.passage=direction>0?"forward":"backward";
  from.style.zIndex="14";to.style.zIndex="15";
  const outgoing=from.animate([
   {opacity:1,visibility:"visible",transform:"scale(1)"},
   {opacity:1,visibility:"visible",offset:.68,transform:"scale(.99)"},
   {opacity:0,visibility:"visible",transform:"scale(.985)"}
  ],options);
  const incoming=to.animate([
   {opacity:0,visibility:"visible",transform:`scale(${1+scale})`},
   {opacity:1,visibility:"visible",offset:.72,transform:"scale(1)"},
   {opacity:1,visibility:"visible",transform:"scale(1)"}
  ],options);
  // Near atmosphere crosses faster than the photograph. Keep material masks
  // attached to their photo; move only independent particles and exhibition copy.
  const layers:Animation[]=[];
  const air=to.querySelector<HTMLElement>('canvas[class$="-atmosphere"],canvas.garden-pollen');
  if(air)layers.push(air.animate([
   {scale:direction>0?"1.18":".92",translate:`${direction*1.5}% 0`},
   {scale:"1",translate:"0 0"}
  ],options));
  const copy=to.querySelector<HTMLElement>('div[class$="-copy"]');
  if(copy)layers.push(copy.animate([
   {opacity:0,translate:`0 ${direction*14}px`,offset:0},
   {opacity:0,translate:`0 ${direction*10}px`,offset:.15},
   {opacity:1,translate:"0 0"}
  ],options));
  const reset=()=>{from.style.removeProperty("z-index");to.style.removeProperty("z-index");delete scene.dataset.passage;};
  void incoming.finished.then(reset).catch(()=>{});
  return()=>{outgoing.cancel();incoming.cancel();layers.forEach(animation=>animation.cancel());reset();};
 },[destination,reduced,root]);
}
