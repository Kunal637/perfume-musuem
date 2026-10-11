export type MaterialRegion={quad:number[];kind:number;strength:number;feather?:number};
export type Flow={x:number;y:number;width:number;height:number;opacity:number;speed?:number};
export type MaterialScene={photo:string;position?:number;mobilePosition?:number;tabletPosition?:number;regions:MaterialRegion[];flows?:Flow[]};
// Coordinates use the photograph's 1600 × 900 composition, before object-fit cropping.
// 0 water, 1 hanging fabric, 2 foliage, 3 sky, 4 reflected light, 5 human gesture.
const rect=(x:number,y:number,w:number,h:number,kind:number,strength:number,feather=12):MaterialRegion=>({quad:[x,y,x+w,y,x+w,y+h,x,y+h],kind,strength,feather});
const quad=(points:number[],kind:number,strength:number,feather=5):MaterialRegion=>({quad:points,kind,strength,feather});
export const materialScenes:Record<string,MaterialScene>={
  // Only water is refracted in the revised rooms. Solid scenery is never warped.
  // The approved Tobacco composition and its established motion are retained.
  arrival:{photo:"/images/museum-exterior-clean.webp",regions:[quad([528,572,676,572,414,782,257,714],0,2.5),quad([930,572,1080,572,1251,681,1200,782],0,2.5)]},
  atrium:{photo:"/images/museum-lobby-photo.webp",regions:[]},
  gardens:{photo:"/images/gardens-gallery.webp",mobilePosition:.62,regions:[quad([227,623,479,623,473,664,229,671],0,2)]},
  sultans:{photo:"/images/sultans-gallery.webp",mobilePosition:.58,regions:[quad([90,496,865,489,865,511,90,555],0,2.8)],flows:[{x:117,y:735,width:150,height:290,opacity:.32},{x:970,y:600,width:100,height:175,opacity:.16}]},
  cedar:{photo:"/images/cedar-gallery.webp",mobilePosition:.59,regions:[quad([716,409,1046,419,1046,468,716,425],0,3,2),quad([1083,423,1155,434,1145,452,1083,466],0,2.5,2)],flows:[{x:433,y:653,width:100,height:180,opacity:.42}]},
  amber:{photo:"/images/amber-lounge-living.webp",position:1,mobilePosition:.82,regions:[],flows:[{x:1140,y:447,width:470,height:305,opacity:.17,speed:.10},{x:1240,y:400,width:350,height:300,opacity:.18,speed:.09}]},
  souk:{photo:"/images/souk-gallery.webp",mobilePosition:.65,regions:[],flows:[{x:232,y:548,width:240,height:350,opacity:.66,speed:.17},{x:1130,y:735,width:360,height:65,opacity:.14,speed:.13}]},
  pastry:{photo:"/images/pastry-vivid.webp",mobilePosition:.65,regions:[],flows:[{x:188,y:527,width:100,height:195,opacity:.56,speed:.14},{x:116,y:432,width:95,height:155,opacity:.35,speed:.16}]},
  liquors:{photo:"/images/liquors-gallery.webp",mobilePosition:.64,regions:[]},
  riviera:{photo:"/images/riviera-gallery.webp",mobilePosition:.55,regions:[]},
  tobacco:{photo:"/images/tobacco-shop-living.webp",mobilePosition:.82,tabletPosition:.82,regions:[rect(940,396,145,135,5,2.5),rect(1399,15,201,215,3,1),quad([632,656,1183,654,1550,900,306,900],4,1)],flows:[{x:399,y:688,width:155,height:260,opacity:.50,speed:.12},{x:1038,y:423,width:130,height:230,opacity:.47,speed:.15}]},
};
