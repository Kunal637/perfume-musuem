"use client";

import {FilmGallery,type FilmSpec} from "./film-gallery";

// The Sultans: 120 frames (public/sultans-frames), from an ornate bottle and tea glass, through crimson silk, into the palace hall and lounge.
const SPEC:FilmSpec={
  sectionId:"the-sultans",className:"sultans-gallery",titleId:"sultans-title",dir:"/sultans-frames",count:120,
  label:"Gallery 03",heading:"THE SULTANS",sub:"Sandalwood, amber, resins and oud.",
  lineA:"Fit for a sultan.",caps:"Sandalwood \u00a0·\u00a0 Amber \u00a0·\u00a0 Resin \u00a0·\u00a0 Oud",lineEnd:"Take your seat.",
  loading:"Entering the palace",ranges:[[-.05,.17],[.3,.52],[.58,.76],[.86,1.01]],
};

export function SultansGallery({active,paused}:{active:boolean;paused:boolean}){
  return <FilmGallery spec={SPEC} active={active} paused={paused}/>;
}
