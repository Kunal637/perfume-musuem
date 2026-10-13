"use client";

import {FilmGallery,type FilmSpec} from "./film-gallery";

// The Marines: 298 frames (public/marines-frames, 1600x900): a bottle with a ship's-wheel cap, through its emblem,
// an underwater vortex, a stormy sea and tall ship, onto the deck and into the captain's cabin.
const SPEC:FilmSpec={
  sectionId:"the-marines",className:"marines-gallery",titleId:"marines-title",dir:"/marines-frames",count:298,preload:true,
  label:"Gallery 01",heading:"THE MARINES",sub:"Aquatic fragrances for those who belong to the sea.",
  lineA:"Into the deep.",caps:"Salt \u00a0·\u00a0 Sea spray \u00a0·\u00a0 Driftwood \u00a0·\u00a0 Storm",lineEnd:"Chart your course.",
  loading:"Setting sail",ranges:[[-.05,.17],[.24,.44],[.5,.7],[.84,1.01]],
};

export function MarinesGallery({active,paused}:{active:boolean;paused:boolean}){
  return <FilmGallery spec={SPEC} active={active} paused={paused}/>;
}
