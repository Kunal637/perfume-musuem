"use client";
import {useEffect,useRef,useState,type RefObject} from "react";
import {Wind} from "lucide-react";
import type {MuseumDestination} from "./museum-audio";

type AirResponse={x:number;y:number;until:number;strength:number};
export type RoomMoment={room:string;waypoint?:number};
export function getRoomMoment(event:Event):RoomMoment|null{
 const detail=(event as CustomEvent<unknown>).detail;
 if(typeof detail==="string")return {room:detail};
 if(typeof detail!=="object"||detail===null||!("room" in detail)||typeof detail.room!=="string")return null;
 const waypoint="waypoint" in detail&&typeof detail.waypoint==="number"&&Number.isFinite(detail.waypoint)?detail.waypoint:undefined;
 return {room:detail.room,waypoint};
}
const waypointHotspots:Partial<Record<MuseumDestination,readonly [number,number][]>>={
 marines:[[.2,.58],[.72,.62],[.48,.38],[.84,.46]],
 gardens:[[.24,.62],[.68,.48],[.46,.28],[.78,.7]],
 sultans:[[.72,.58],[.48,.32],[.24,.5],[.64,.74]],
 cedar:[[.62,.58],[.3,.62],[.76,.42],[.5,.28]],
 amber:[[.5,.32],[.76,.48],[.28,.62],[.64,.72]],
 souk:[[.24,.58],[.72,.54],[.48,.32],[.82,.7]],
 pastry:[[.28,.46],[.7,.58],[.5,.3],[.82,.72]],
 liquors:[[.68,.44],[.38,.62],[.52,.28],[.82,.66]],
 riviera:[[.34,.72],[.68,.76],[.5,.62],[.78,.68]],
 tobacco:[[.68,.58],[.38,.44],[.52,.28],[.8,.72]],
};
const actions:Partial<Record<MuseumDestination,string>>={marines:"Call a sea breeze",gardens:"Stir the garden breeze",sultans:"Stir the incense",cedar:"Send a ripple",amber:"Follow the spotlight",souk:"Stir the desert air",pastry:"A little sugar magic",liquors:"Swirl the crystal",riviera:"Touch the pool",tobacco:"Draw a curl of smoke"};
const hints:Partial<Record<MuseumDestination,string>>={marines:"A sea breeze stirs the spray",gardens:"Watch the garden catch the light",sultans:"The incense drifts between the lanterns",cedar:"A ripple crosses the terrace pool",amber:"Light moves through the lounge",souk:"Incense carries through the souk",pastry:"Look for a little sweet surprise",liquors:"Catch a glint along the crystal",riviera:"A ripple crosses the sunlit pool",tobacco:"Watch smoke curl around the ember"};

/** Input moves nearby atmosphere only, never the architectural photograph. */
export function useRoomResponse(root:RefObject<HTMLElement|null>,room:string,active:boolean,paused:boolean){
 const response=useRef<AirResponse>({x:-1000,y:-1000,until:0,strength:0});
 useEffect(()=>{
  const node=root.current;if(!node||!active||paused)return;
  const move=(event:PointerEvent)=>{
   if((event.target as Element).closest("button,a"))return;
   const rect=node.getBoundingClientRect();
   response.current={x:event.clientX-rect.left,y:event.clientY-rect.top,until:performance.now()+1400,strength:event.type==="pointerdown"?1:.45};
  };
  const activate=(event:Event)=>{
   if((event as CustomEvent).detail!==room)return;
   response.current={x:node.clientWidth*.68,y:node.clientHeight*.6,until:performance.now()+4500,strength:1};
  };
  const livingMoment=(event:Event)=>{
   const moment=getRoomMoment(event);if(moment?.room!==room)return;
   const hotspots=waypointHotspots[room as MuseumDestination];
   const hotspot=moment.waypoint===undefined?undefined:hotspots?.[moment.waypoint%hotspots.length];
   const [x,y]=hotspot??[.68,.6];
   const milestone=moment.waypoint!==undefined&&moment.waypoint%6===0;
   response.current={x:node.clientWidth*x,y:node.clientHeight*y,until:performance.now()+(milestone?4200:3200),strength:milestone ? .78 : .55};
  };
  node.addEventListener("pointermove",move,{passive:true});node.addEventListener("pointerdown",move,{passive:true});
  window.addEventListener("museum-room-interaction",activate);window.addEventListener("museum-room-moment",livingMoment);
  return()=>{node.removeEventListener("pointermove",move);node.removeEventListener("pointerdown",move);window.removeEventListener("museum-room-interaction",activate);window.removeEventListener("museum-room-moment",livingMoment);response.current.until=0;};
 },[root,room,active,paused]);return response;
}
export function responseStrength(response:AirResponse,now:number){return Math.min(1,Math.max(0,(response.until-now)/1400))*response.strength;}
export function driftPoint(x:number,y:number,response:AirResponse,now:number):[number,number]{
 const power=responseStrength(response,now);if(!power)return [x,y];
 const dx=x-response.x,dy=y-response.y,distance=Math.hypot(dx,dy),falloff=Math.max(0,1-distance/270),force=power*falloff*falloff*65;
 return [x+(dx-dy*.4)/Math.max(25,distance)*force,y+(dy+dx*.4)/Math.max(25,distance)*force];
}
export function RoomResponseControl({room,paused}:{room:MuseumDestination;paused:boolean}){
 const label=actions[room],hint=hints[room], [showHint,setShowHint]=useState(false);
 useEffect(()=>{
  setShowHint(false);
  if(paused||!hint)return;
  const timer=window.setTimeout(()=>setShowHint(true),5200);
  return()=>window.clearTimeout(timer);
 },[room,paused,hint]);
 if(!label)return null;
 return <button type="button" className={`room-response-control${showHint?" has-hint":""}`} data-hint={hint} aria-label={label} disabled={paused} title={paused?"Resume motion to explore this detail":label}
  onClick={()=>{window.dispatchEvent(new CustomEvent("museum-room-interaction",{detail:room}));
   setShowHint(false);
   if(room==="liquors")window.dispatchEvent(new Event("museum-liquors-swirl"));
   if(room==="pastry")window.dispatchEvent(new Event("museum-pastry-discovery"));
   if(room==="tobacco")window.dispatchEvent(new Event("museum-tobacco-draw"));
  }}><Wind size={16} aria-hidden="true"/><span className="room-response-control__label">{label}</span></button>;
}
