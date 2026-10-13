"use client";

import {FilmGallery,type FilmSpec} from "./film-gallery";

// The Cedar Room: 298 frames (public/cedar-frames, 1600x900): a bottle on wood, through its emblem, an underwater passage,
// cedar grain and an opening door, into a gentleman's dressing room lined with fragrances.
const SPEC:FilmSpec={
  sectionId:"cedar-room",className:"cedar-gallery",titleId:"cedar-title",dir:"/cedar-frames",count:298,
  label:"Gallery 04",heading:"THE CEDAR ROOM",sub:"Citrus, aromatic freshness and refined woods.",
  lineA:"Beneath the surface.",caps:"Cedar \u00a0·\u00a0 Citrus \u00a0·\u00a0 Leather \u00a0·\u00a0 Smoke",lineEnd:"Every scent has its place.",
  loading:"Opening the door",ranges:[[-.05,.17],[.24,.46],[.66,.82],[.86,1.01]],
};

export function CedarGallery({active,paused}:{active:boolean;paused:boolean}){
  return <FilmGallery spec={SPEC} active={active} paused={paused}/>;
}
