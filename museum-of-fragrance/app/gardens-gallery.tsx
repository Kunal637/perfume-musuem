"use client";

import {FilmGallery,type FilmSpec} from "./film-gallery";

// The Gardens: 298 frames (public/gardens-frames, 1280x720): a crystal bottle with a white rose, through its emblem,
// liquid full of petals, into a white-rose garden with a fountain, and out along the path.
const SPEC:FilmSpec={
  sectionId:"the-gardens",className:"gardens-gallery",titleId:"gardens-title",dir:"/gardens-frames",count:298,
  label:"Gallery 02",heading:"THE GARDENS",sub:"Leafy greens. Luminous white florals.",
  lineA:"Petals on the air.",caps:"White rose \u00a0·\u00a0 Jasmine \u00a0·\u00a0 Fern \u00a0·\u00a0 Morning dew",lineEnd:"Listen to the water.",
  loading:"Entering the garden",ranges:[[-.05,.17],[.31,.46],[.52,.7],[.88,1.01]],
};

export function GardensGallery({active,paused}:{active:boolean;paused:boolean}){
  return <FilmGallery spec={SPEC} active={active} paused={paused}/>;
}
