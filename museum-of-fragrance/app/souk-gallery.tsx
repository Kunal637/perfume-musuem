"use client";

import {FilmGallery,type FilmSpec} from "./film-gallery";

// The Souk: 96 frames (public/souk-frames), from a bottle on stone, through its emblem and the amber liquid, into the market.
const SPEC:FilmSpec={
  sectionId:"the-souk",className:"souk-gallery",titleId:"souk-title",dir:"/souk-frames",count:96,
  label:"Gallery 06",heading:"THE SOUK",sub:"Where the desert whispers in amber.",
  lineA:"A world within.",caps:"Spice \u00a0·\u00a0 Oud \u00a0·\u00a0 Sand \u00a0·\u00a0 Lantern light",lineEnd:"Step into the market.",
  loading:"Entering the souk",ranges:[[-.05,.17],[.26,.5],[.56,.76],[.84,1.01]],
};

export function SoukGallery({active,paused}:{active:boolean;paused:boolean}){
  return <FilmGallery spec={SPEC} active={active} paused={paused}/>;
}
