"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ExteriorDepthScene, InteriorDepthScene } from "./depth-scene";
import { DepthAtmosphere } from "./depth-atmosphere";
import { MarinesGallery } from "./marines-gallery";
import { GardensGallery } from "./gardens-gallery";
import { SultansGallery } from "./sultans-gallery";
import { CedarGallery } from "./cedar-gallery";
import { AmberGallery } from "./amber-gallery";
import { SoukGallery } from "./souk-gallery";
import { PastryGallery } from "./pastry-gallery";
import { LiquorsGallery } from "./liquors-gallery";
import { RivieraGallery } from "./riviera-gallery";
import { TobaccoGallery } from "./tobacco-gallery";
import { GalleryVerticalEnd, X } from "lucide-react";
import {useSpatialJourney} from "./spatial-journey";
import {RoomResponseControl} from "./room-response";
import { MuseumAudio, type MuseumDestination } from "./museum-audio";

type Destination = MuseumDestination;
const destinations: {id:Destination;label:string;number:string}[] = [
  {id:"arrival",label:"Arrival",number:"00"},
  {id:"atrium",label:"The atrium",number:"A"},
  {id:"marines",label:"The Marines",number:"01"},
  {id:"gardens",label:"The Gardens",number:"02"},
  {id:"sultans",label:"The Sultans",number:"03"},
  {id:"cedar",label:"Cedar Room",number:"04"},
  {id:"amber",label:"Amber Lounge",number:"05"},
  {id:"souk",label:"The Souk",number:"06"},
  {id:"pastry",label:"The Pastry Room",number:"07"},
  {id:"liquors",label:"The Liquors",number:"08"},
  {id:"riviera",label:"The Riviera",number:"09"},
  {id:"tobacco",label:"The Tobacco Shop",number:"10"},
];
const galleries = destinations.filter(item=>item.number!=="00"&&item.number!=="A");
const GALLERY_COUNT = galleries.length;
const GALLERY_SCROLL_VIEWPORTS = 60; // Ten times the previous six-viewport walkthrough per room.
const GALLERY_WAYPOINTS = 24;
const galleryBeatLabels = [
  "Arrive", "Orient", "Look closer", "Follow", "Notice", "Explore",
  "Discover", "Trace", "Pause", "Linger", "Reflect", "Depart",
  "Turn inward", "Look beyond", "Draw near", "Follow the light",
  "Find a detail", "Stay awhile", "Explore deeper", "Take it in",
  "At the threshold", "Before you go", "One last look", "Carry it with you",
];
const galleryFrames:Record<string,{title:string;detail:string}[]> = {
  marines:[
    {title:"The blue threshold",detail:"Enter among salt air and open water."},
    {title:"The sea wall",detail:"Let the stone arch frame the Mediterranean."},
    {title:"Currents in the glass",detail:"Follow the tide as it moves along the gallery."},
    {title:"A quiet horizon",detail:"Pause where the sea meets the sky."},
    {title:"Salt on the breeze",detail:"Watch the fine sea spray catch the light above the water."},
    {title:"The far shore",detail:"Let the distant coastline emerge beyond the open blue."},
    {title:"A glint on the swell",detail:"Follow a brief trail of sunlight across the moving surface."},
    {title:"Between two waves",detail:"Notice how the near water travels faster than the horizon."},
    {title:"The arch in reflection",detail:"Look back toward the stone frame reflected in the sea."},
    {title:"Mineral air",detail:"Stay with the cool, bright meeting of salt and sky."},
    {title:"The tide slows",detail:"The spray settles as the room opens onto the horizon."},
    {title:"Leaving by the water",detail:"Carry the sea's last shimmer with you into the next room."},
    {title:"The arch draws near",detail:"Let the stone edge frame a closer view of the restless water."},
    {title:"A blue passage",detail:"Follow the darker current as it moves beneath the bright surface."},
    {title:"Foam at the edge",detail:"A thin line of white water gathers and dissolves along the shore."},
    {title:"The horizon opens",detail:"Look beyond the headland to the open Mediterranean."},
    {title:"Salt in the air",detail:"Fine spray hangs briefly above the nearest wave."},
    {title:"A passing glimmer",detail:"A small point of sunlight crosses the moving sea."},
    {title:"The sea wall's shadow",detail:"Notice how the stone edge cools the colour of the water."},
    {title:"A wave comes forward",detail:"Near water swells toward you while the far shore stays still."},
    {title:"The archway behind",detail:"Take in the framed view once more before following the coast."},
    {title:"Blue upon blue",detail:"Let the deeper water blend into the pale line of the sky."},
    {title:"The last spray",detail:"A final sea-breeze moment lifts above the waves."},
    {title:"Beyond the headland",detail:"The coastline recedes and leaves a wide, open view."},
  ],
  gardens:[
    {title:"The conservatory",detail:"Step into a room alive with green."},
    {title:"The garden path",detail:"Follow the path between the formal beds."},
    {title:"Among the blooms",detail:"Follow the light through leaves and petals."},
    {title:"Light over the water",detail:"Let the garden settle around you."},
    {title:"The clipped hedges",detail:"Notice how the straight paths bring order to the garden."},
    {title:"A drifting petal",detail:"Follow one falling petal as it crosses the flower beds."},
    {title:"The glasshouse light",detail:"Look toward the conservatory as the sunlight shifts."},
    {title:"Seeds in the air",detail:"Tiny seeds and pollen drift above the planted borders."},
    {title:"A visitor among the flowers",detail:"Watch for a butterfly moving between the blooms."},
    {title:"The garden opens",detail:"Let your gaze travel from the shaded path to the distant view."},
    {title:"Still water",detail:"Pause at the reflective pool beneath the garden light."},
    {title:"A final bloom",detail:"Take one last look across the colour before you leave."},
    {title:"A path between beds",detail:"Follow the clipped borders as they guide you deeper into the garden."},
    {title:"Petals turn in light",detail:"Watch the flower heads catch a brief change in the sunlight."},
    {title:"The glasshouse panes",detail:"Look up to the conservatory roof, bright against the garden."},
    {title:"A butterfly passes",detail:"A small visitor crosses from the shaded path toward the blooms."},
    {title:"Pollen in the sun",detail:"Fine golden motes drift above the leaves and planting."},
    {title:"A glimpse through leaves",detail:"The garden view opens and closes between the branches."},
    {title:"Colour along the path",detail:"Notice the changing flowers as the walkway draws your eye onward."},
    {title:"The pool's far edge",detail:"Follow the reflected light along the waterline."},
    {title:"A petal comes to rest",detail:"One falling petal settles the pace of the garden."},
    {title:"A brighter clearing",detail:"Step into the open patch of light between the planted beds."},
    {title:"The conservatory recedes",detail:"Look back at the glasshouse framed by the garden."},
    {title:"Green beyond the gate",detail:"Carry the garden's calm with you as the path turns onward."},
  ],
  sultans:[
    {title:"Lantern arrival",detail:"Enter beneath the warm, suspended light."},
    {title:"The salon",detail:"Take in the room's rich, layered interior."},
    {title:"Silk and incense",detail:"Move through the room's suspended atmosphere."},
    {title:"The Bosphorus",detail:"Stay a moment beside the water."},
    {title:"The lantern ceiling",detail:"Trace the warm pools of light from one hanging lantern to the next."},
    {title:"Pattern in the salon",detail:"Let the repeated geometry lead your eye through the room."},
    {title:"Incense in the light",detail:"Watch a quiet wisp of incense pass through the amber glow."},
    {title:"A glimmer on the water",detail:"Look beyond the salon for a moving reflection on the Bosphorus."},
    {title:"The room's rich details",detail:"Notice how warm metal, patterned surfaces and shadow layer together."},
    {title:"The distant shore",detail:"Follow the water outward toward the far edge of the view."},
    {title:"Lantern afterglow",detail:"Pause as the gentle light shifts across the room."},
    {title:"The salon recedes",detail:"Take the warmth of the lanterns with you as you move on."},
    {title:"Beneath the brasswork",detail:"Move your gaze under the lanterns to the room's fine metal details."},
    {title:"A pattern repeats",detail:"Follow a repeating motif across the salon's layered surfaces."},
    {title:"Incense finds the light",detail:"A delicate wisp becomes visible as it crosses the warm glow."},
    {title:"A quiet alcove",detail:"Notice the softer, more intimate corner beyond the main salon."},
    {title:"The waterline",detail:"Follow a moving reflection along the distant edge of the Bosphorus."},
    {title:"Lanterns in sequence",detail:"Let the suspended lights lead you deeper into the room."},
    {title:"Silk in the shadows",detail:"Look for the subtle shift between the warm fabric and dark wood."},
    {title:"A distant crossing",detail:"A small ripple passes across the water beyond the salon."},
    {title:"The salon's centre",detail:"Pause where the lantern glow gathers most warmly."},
    {title:"A view through the room",detail:"See how the layered furnishings frame the distant water."},
    {title:"The last incense trail",detail:"Watch the atmosphere soften before the next gallery."},
    {title:"Warmth on the threshold",detail:"Leave the lantern light behind, one quiet detail at a time."},
  ],
  cedar:[
    {title:"A tailored arrival",detail:"Find the calm of polished wood and citrus."},
    {title:"The cedar gallery",detail:"Notice the geometry of the tailored interior."},
    {title:"Citrus and cedar",detail:"Light drifts across the room's clean lines."},
    {title:"The terrace pool",detail:"Finish with a quiet ripple of water."},
    {title:"Polished grain",detail:"Follow the long, clean lines of the cedar finish."},
    {title:"A bright citrus note",detail:"Look for a warm glint moving across the display."},
    {title:"The quiet cabinet",detail:"Pause at the carefully arranged bottles and tailored details."},
    {title:"A ripple outside",detail:"Watch the terrace water move while the room stays still."},
    {title:"Glass and wood",detail:"Notice the contrast between crisp reflections and warm grain."},
    {title:"A small reflection",detail:"Follow a ripple of light across the pool's edge."},
    {title:"The room in balance",detail:"Take in the calm line from the interior out to the terrace."},
    {title:"Cedar in the distance",detail:"Leave the bright pool behind as the room opens onward."},
    {title:"A clean-lined display",detail:"Notice the deliberate spacing between the bottles and woodwork."},
    {title:"Citrus catches the sun",detail:"A brief highlight travels across the brighter side of the room."},
    {title:"The cabinet's edge",detail:"Follow the crisp boundary between the cedar display and the terrace."},
    {title:"Ripples under glass",detail:"Reflections move across the pool while the architecture remains still."},
    {title:"A polished detail",detail:"Look closely for a small glint among the carefully arranged objects."},
    {title:"The terrace beyond",detail:"Let your eye travel from the warm room out to the cool water."},
    {title:"Light on the cedar",detail:"A soft change of daylight traces the grain of the wood."},
    {title:"A ripple returns",detail:"A second small wave crosses the pool's bright surface."},
    {title:"The room's geometry",detail:"Take in the straight lines that keep the space calm and composed."},
    {title:"Citrus in the air",detail:"Follow the light back across the fresh, tailored interior."},
    {title:"A still moment",detail:"Pause between the polished display and the moving water."},
    {title:"Beyond the terrace",detail:"Carry the room's clean balance onward to the next gallery."},
  ],
  amber:[
    {title:"After-hours entrance",detail:"Settle into the lounge as the lamps glow."},
    {title:"The listening room",detail:"Take in the intimate glow of the lounge."},
    {title:"The amber light",detail:"Follow the stage light through the haze."},
    {title:"One last song",detail:"Stay for the room's final, warm note."},
    {title:"The first lamp",detail:"Notice the small pools of practical light around the lounge."},
    {title:"Velvet shadow",detail:"Let your eyes adjust to the softer corners of the listening room."},
    {title:"A beam across the stage",detail:"Follow the moving spotlight through the fine haze."},
    {title:"Dust in the glow",detail:"Tiny airborne particles appear briefly in the lamplight."},
    {title:"The room begins to play",detail:"Stay with the stage as the amber light slowly shifts."},
    {title:"Between songs",detail:"Notice how the lounge settles when the spotlight moves away."},
    {title:"A warm final note",detail:"Pause among the low lights before leaving the room."},
    {title:"After-hours",detail:"Carry the lounge's quiet warmth into the next gallery."},
    {title:"A table in lamplight",detail:"Notice how a small pool of light gathers around the lounge seating."},
    {title:"The stage edge",detail:"Follow the line where the performers' light meets the darker room."},
    {title:"A quieter corner",detail:"Look away from the stage and discover the room's softer edge."},
    {title:"The spotlight turns",detail:"A moving beam briefly reveals details in the gentle haze."},
    {title:"Amber against velvet",detail:"Notice the warm light resting on the lounge's deeper textures."},
    {title:"A breath between notes",detail:"The room settles for a moment as the light changes direction."},
    {title:"Dust above the seats",detail:"Small particles drift through the warm practical lights."},
    {title:"The stage from afar",detail:"Take in the intimate room from its quieter side."},
    {title:"One lamp remains",detail:"A steady practical glow holds the room as the stage dims."},
    {title:"The last chord",detail:"Follow the final sweep of light across the listening room."},
    {title:"A room after music",detail:"Stay with the warm afterglow before the passage onward."},
    {title:"Leaving after dark",detail:"Carry the lounge's last amber note into the next room."},
  ],
  souk:[
    {title:"Into the souk",detail:"Step beneath the shade of the market."},
    {title:"The covered arcade",detail:"Follow the market passage between stalls."},
    {title:"Spice and shadow",detail:"Trace the incense through the warm air."},
    {title:"Desert dusk",detail:"Let the room's evening light draw you onward."},
    {title:"The arcade entrance",detail:"Notice the shift from the bright threshold to the shaded passage."},
    {title:"Colour at the stalls",detail:"Let the market's layered displays draw your eye from side to side."},
    {title:"Incense on the breeze",detail:"Watch the fine trail of smoke travel through warm light."},
    {title:"Light between the arches",detail:"Follow the brighter strip of daylight farther into the arcade."},
    {title:"A glimmer of brass",detail:"Catch a brief highlight among the market's warm details."},
    {title:"Sand in the sun",detail:"Fine grains drift through the low desert light."},
    {title:"The last archway",detail:"Look toward the passage as it opens into evening."},
    {title:"Dusk beyond the souk",detail:"Leave the shaded market with the last glow of the day."},
    {title:"A stall in colour",detail:"Look closer at the layered goods beneath the arcade's shade."},
    {title:"A turn in the passage",detail:"Follow the covered walkway as it bends toward the next arch."},
    {title:"Light over the textiles",detail:"A warm highlight moves across the market's rich colours."},
    {title:"Incense above the stalls",detail:"Trace a thin plume rising into the shaded air."},
    {title:"The arcade's long view",detail:"Look through several arches to the brighter space beyond."},
    {title:"Sand crosses the light",detail:"A few fine grains catch the low light near the passage."},
    {title:"A brass detail",detail:"Find a glint among the warm metal and market textures."},
    {title:"A quieter stall",detail:"Pause at the edge of the busy market and notice its smaller details."},
    {title:"The final arch",detail:"Follow the last band of sunlight beneath the covered roof."},
    {title:"Shadows lengthen",detail:"The arcade deepens as the desert light begins to fade."},
    {title:"Evening beyond the stalls",detail:"Look through the passage toward the gathering dusk."},
    {title:"Leaving the market",detail:"Carry the spice and warmth of the souk with you."},
  ],
  pastry:[
    {title:"At the patisserie",detail:"Enter among glass, colour and confection."},
    {title:"The counter",detail:"Browse the display at the heart of the room."},
    {title:"Steam and sugar",detail:"Follow the rising warmth through the room."},
    {title:"A final indulgence",detail:"Take in the last little detail."},
    {title:"The display case",detail:"Look across the glass where the colourful confections catch the light."},
    {title:"A cup of warmth",detail:"Follow a thin curl of steam as it rises into the room."},
    {title:"A little surprise",detail:"Look closely around the counter for the room's playful discovery."},
    {title:"The patisserie glow",detail:"Notice the soft reflections along the polished glass."},
    {title:"Sugar in the air",detail:"Tiny sweet motes drift through the warm light."},
    {title:"Behind the counter",detail:"Let your gaze travel from the display toward the working room."},
    {title:"A final detail",detail:"Pause for one more small glint among the confections."},
    {title:"Leaving the patisserie",detail:"Carry a little sweetness with you as you move on."},
    {title:"A closer look at the glass",detail:"Follow a soft reflection along the display case."},
    {title:"A fresh cup",detail:"A new curl of steam rises above the counter."},
    {title:"Colour in the cabinet",detail:"Notice how the pastel display shifts as your view travels across it."},
    {title:"A playful movement",detail:"Look near the counter for the little rabbit's next surprise."},
    {title:"Sugar catches the light",detail:"Fine sweet motes briefly brighten in the warm air."},
    {title:"The counter's far end",detail:"Follow the line of the display to its quieter corner."},
    {title:"A spoonful of reflection",detail:"A small glint travels across the polished serving details."},
    {title:"Warmth from the kitchen",detail:"Steam drifts outward from the working side of the patisserie."},
    {title:"The sweetest detail",detail:"Take a moment to notice one small confection in the display."},
    {title:"A pause at the window",detail:"Let the bright daylight settle over the room's soft colours."},
    {title:"The last little surprise",detail:"Look once more for a playful detail before heading onward."},
    {title:"Leaving with a treat",detail:"Carry the patisserie's gentle colour into the next room."},
  ],
  liquors:[
    {title:"The tasting room",detail:"Step into a quiet study of oak and spirit."},
    {title:"The back bar",detail:"Take in the cabinet and its amber reflections."},
    {title:"A glint in the glass",detail:"Watch a trace of light cross the crystal."},
    {title:"Oak and amber",detail:"Let the deeper notes linger."},
    {title:"The cabinet's silhouette",detail:"Notice the dark outline of the back bar against the warm room."},
    {title:"Cut crystal",detail:"Follow the shifting highlight along the decanter's edge."},
    {title:"A slow swirl",detail:"A subtle turn of light makes the glass seem to catch the room."},
    {title:"Dust above the bar",detail:"Small motes appear and disappear in the amber light."},
    {title:"Onyx and reflection",detail:"Look for a soft reflection across the darker surfaces."},
    {title:"The tasting place",detail:"Pause where the cabinet and glass come into focus together."},
    {title:"The light settles",detail:"Let the bright glints give way to the room's deeper tones."},
    {title:"Oak afterglow",detail:"Take the warmth of the back bar with you into the next room."},
    {title:"A bottle in shadow",detail:"Look behind the brightest glass to the deeper cabinet tones."},
    {title:"Crystal edge-light",detail:"A slim highlight traces the cut edge of the decanter."},
    {title:"A slow turn of amber",detail:"Follow the warm reflection as it shifts across the glass."},
    {title:"The quiet back bar",detail:"Notice the ordered silhouettes gathered against the dark wood."},
    {title:"A glint travels",detail:"One small point of light moves across the crystal and disappears."},
    {title:"Onyx in the foreground",detail:"Look for a soft reflection along the room's dark stone."},
    {title:"Dust in the tasting light",detail:"A few motes drift through the cabinet's warm glow."},
    {title:"The decanter's shadow",detail:"Notice the shape cast by the glass against the back bar."},
    {title:"A second crystal glint",detail:"Another brief highlight appears as the room's light changes."},
    {title:"Oak and glass together",detail:"Take in the contrast between polished wood and clear crystal."},
    {title:"The light dims",detail:"Let the brightest reflections settle into deeper amber tones."},
    {title:"The last pour of light",detail:"Carry the back bar's quiet glow into the next gallery."},
  ],
  riviera:[
    {title:"The seaside terrace",detail:"Arrive where the garden meets the sea."},
    {title:"The garden arcade",detail:"Move beneath the shade of the terrace."},
    {title:"Across the pool",detail:"Follow the ripples into the distance."},
    {title:"Mediterranean light",detail:"Stay with the last glint on the water."},
    {title:"Shade to sun",detail:"Follow the terrace as it opens from leafy shade into bright light."},
    {title:"A sail in the distance",detail:"Look out across the sea for a small boat crossing the horizon."},
    {title:"Ripples at the edge",detail:"A light touch sends rings across the pool."},
    {title:"Gulls overhead",detail:"Watch the birds glide at different heights above the terrace."},
    {title:"Sun on the water",detail:"Small highlights travel across the sea and pool."},
    {title:"The garden's edge",detail:"Look back along the arcade where the plants meet the terrace."},
    {title:"A moment of stillness",detail:"Pause while the pool's ripples widen and disappear."},
    {title:"Coastal afterlight",detail:"Leave with the last bright line where sea meets sky."},
    {title:"The arcade opens",detail:"Follow the shaded garden passage toward the open terrace."},
    {title:"A sail crosses the bay",detail:"A small boat glides across the distant Mediterranean."},
    {title:"Ripples touch the light",detail:"Watch a passing ring widen across the sunlit pool."},
    {title:"A gull banks overhead",detail:"One bird changes course above the garden and sea."},
    {title:"The pool's reflection",detail:"Follow the bright sky mirrored at the water's edge."},
    {title:"Garden meets terrace",detail:"Notice the transition from leafy shade to stone and open air."},
    {title:"Wake on the horizon",detail:"A faint trail follows the distant boat across the bay."},
    {title:"Sunlight moves west",detail:"The warm reflection shifts toward the far side of the pool."},
    {title:"A quiet terrace corner",detail:"Pause where the garden shelters the edge of the water."},
    {title:"The last gull",detail:"Watch the final glide across the bright sky."},
    {title:"Sea beyond the pool",detail:"Look past the terrace water to the open horizon."},
    {title:"Leaving in coastal light",detail:"Take the Mediterranean brightness with you as you move on."},
  ],
  tobacco:[
    {title:"A leather-lined room",detail:"Settle into the warm, close interior."},
    {title:"The fireside seat",detail:"Pause beside the worn leather and dark wood."},
    {title:"Under the cigar glow",detail:"Watch the amber light breathe in the haze."},
    {title:"Smoke in the lamplight",detail:"Let the room's final note linger."},
    {title:"The leather grain",detail:"Notice the worn texture that gives the room its lived-in character."},
    {title:"A practical lamp",detail:"Follow the warm glow as it breathes against the dark wood."},
    {title:"Smoke begins to curl",detail:"A fine thread of smoke rises slowly through the lamplight."},
    {title:"Dust in the firelight",detail:"Tiny motes drift at different depths around the fireside."},
    {title:"An ember wakes",detail:"Look for a brief glow at the cigar tip in the shadowed room."},
    {title:"The quiet seat",detail:"Pause beside the leather chair and take in its small details."},
    {title:"A final curl",detail:"Watch the haze soften as it moves toward the ceiling."},
    {title:"The last room",detail:"Leave the warm lamplight behind, with its story still lingering."},
    {title:"Leather in low light",detail:"Follow the quiet highlights along the worn chair and its edges."},
    {title:"The lamp's warm circle",detail:"Notice how one practical light gathers the room around it."},
    {title:"Smoke above the chair",detail:"A thin smoke ribbon rises slowly through the shadow."},
    {title:"Motes in the lamplight",detail:"Tiny particles drift at different depths across the warm room."},
    {title:"An ember brightens",detail:"A brief glow warms the cigar tip before fading back."},
    {title:"Dark wood detail",detail:"Look past the chair to the fine grain in the room's darker surfaces."},
    {title:"The seat by the fire",detail:"Pause at the worn leather and take in the quiet fireside."},
    {title:"Smoke finds a beam",detail:"The haze catches a thin line of light as it curls upward."},
    {title:"A glint on the table",detail:"A small reflection flashes across the objects beside the chair."},
    {title:"The room exhales",detail:"Watch the smoke thin and drift toward the ceiling."},
    {title:"One ember remains",detail:"A final warm point glows against the room's deeper shadows."},
    {title:"The story lingers",detail:"Take the last quiet look before the museum passage opens."},
  ],
};
const galleryStories:Record<string,{exhibit:string;title:string;detail:string}> = {
  marines:{exhibit:"The sea arch",title:"A room shaped by the tide",detail:"Stone, salt and open water set the pace here. Follow the changing blue from the distant horizon to the restless surface, then pause where the two meet."},
  gardens:{exhibit:"The conservatory",title:"A garden held in light",detail:"Formal paths bring order to a room full of living colour. Look from the shaded walk toward the bright glasshouse, where each bed feels like a new chapter."},
  sultans:{exhibit:"The lantern salon",title:"Warmth in every corner",detail:"Layered patterns, suspended lamps and the suggestion of incense make this salon feel collected over time. Let your eye travel from the lantern glow toward the water beyond."},
  cedar:{exhibit:"The cedar cabinet",title:"A study in contrasts",detail:"Crisp light meets warm wood in this tailored room. Notice how the still geometry of the display gives way to a small, shifting reflection at the terrace pool."},
  amber:{exhibit:"The listening room",title:"A last song after dark",detail:"The lounge is arranged for a slower hour: warm lamps, velvet shadows and a stage just coming alive. Follow the light, then stay for the quiet after the music."},
  souk:{exhibit:"The shaded arcade",title:"A passage through the market",detail:"The covered passage gathers spice, shadow and late-afternoon light. Look past the nearest stall and let the repeated arches lead your eye toward the desert dusk."},
  pastry:{exhibit:"The patisserie counter",title:"A little theatre of sweetness",detail:"Glass, polished surfaces and soft colour turn the counter into a tiny stage. Look for the rising warmth and small surprises tucked among the confections."},
  liquors:{exhibit:"The crystal decanter",title:"Light, held in glass",detail:"Dark oak gives the room its calm; cut crystal catches the light and sends it back in brief flashes. Follow one glint across the cabinet, then let the amber tones settle."},
  riviera:{exhibit:"The terrace pool",title:"A pause beside the water",detail:"The garden arcade opens onto a bright strip of Mediterranean blue. Notice the shift from cool shade to sunlit water, and the small ripples travelling across the pool."},
  tobacco:{exhibit:"The fireside chair",title:"A room made for lingering",detail:"Worn leather and dark wood hold the warmth of a private club. Watch the lamp glow through the haze, then take in the small details gathered around the fireside seat."},
};
const galleryCameraPaths:Record<string,[number,number,number][]> = {
  marines:[[0,0,1.04],[-3,0,1.095],[3,-.8,1.13],[0,0,1.055]],
  gardens:[[0,0,1.04],[3,.8,1.095],[5,-.8,1.13],[1,0,1.055]],
  sultans:[[0,0,1.04],[-3,0,1.095],[-4,.8,1.13],[1,0,1.055]],
  cedar:[[0,0,1.04],[3,0,1.095],[4,-.8,1.13],[-1,0,1.055]],
  amber:[[0,0,1.04],[-3,0,1.095],[-5,.8,1.13],[1,0,1.055]],
  souk:[[0,0,1.04],[3,0,1.095],[4,.8,1.13],[-1,0,1.055]],
  pastry:[[0,0,1.04],[-2,0,1.095],[-3,.8,1.13],[1,0,1.055]],
  liquors:[[0,0,1.04],[3,0,1.095],[5,-.8,1.13],[-1,0,1.055]],
  riviera:[[0,0,1.04],[-3,0,1.095],[-4,.8,1.13],[1,0,1.055]],
  tobacco:[[0,0,1.04],[3,0,1.095],[4,-.8,1.13],[-1,0,1.055]],
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const easeInOut = (value: number) => {
  const x = clamp(value);
  return x * x * (3 - 2 * x);
};

const sampleCameraPath = (path: [number, number, number][], progress: number) => {
  const segmentPosition = clamp(progress) * (path.length - 1);
  const segment = Math.min(path.length - 2, Math.floor(segmentPosition));
  const t = segmentPosition - segment;
  const before = path[Math.max(0, segment - 1)];
  const start = path[segment];
  const end = path[segment + 1];
  const after = path[Math.min(path.length - 1, segment + 2)];
  const interpolate = (index: number) => {
    const t2 = t * t;
    const t3 = t2 * t;
    return 0.5 * (
      2 * start[index] +
      (-before[index] + end[index]) * t +
      (2 * before[index] - 5 * start[index] + 4 * end[index] - after[index]) * t2 +
      (-before[index] + 3 * start[index] - 3 * end[index] + after[index]) * t3
    );
  };
  return [interpolate(0), interpolate(1), interpolate(2)] as const;
};

function useMuseumJourney(ref: React.RefObject<HTMLElement | null>,onDestination:(destination:Destination)=>void,onWalkthroughStage:(stage:number,destination:Destination)=>void,motionDisabled:boolean) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    let frame = 0;
    let pointerFrame = 0;
    let previousJourneyPercent = -1;
    let lastDestination:Destination|null = null;
    let previousStoryStage = -1;
    let previousStoryDestination: Destination | null = null;
    const progressBar = root.querySelector<HTMLElement>(".journey-progress-bar");

    const render = () => {
      const rect = root.getBoundingClientRect();
      const galleryStep = window.innerHeight*GALLERY_SCROLL_VIEWPORTS;
      const galleryRunway = galleryStep * GALLERY_COUNT;
      const distance = Math.max(1, root.offsetHeight - window.innerHeight - galleryRunway);
      const scrollPosition = -rect.top;
      const progress = clamp(scrollPosition / distance);
      const journeyProgress = clamp(-rect.top / Math.max(1,root.offsetHeight-window.innerHeight));
      const journeyPercent = Math.round(journeyProgress*100);
      if(progressBar&&journeyPercent!==previousJourneyPercent){
        progressBar.setAttribute("aria-valuenow",String(journeyPercent));
        progressBar.setAttribute("aria-valuetext",`${journeyPercent}% of the museum visit`);
        previousJourneyPercent=journeyPercent;
      }
      const galleryOffset = scrollPosition - distance;
      const inGalleryRunway = galleryOffset > 0;
      const galleryIndex = Math.min(GALLERY_COUNT-1,Math.max(0,Math.floor(galleryOffset/galleryStep)));
      const roomProgress = inGalleryRunway ? clamp((galleryOffset-galleryIndex*galleryStep)/galleryStep) : 0;
      const destination = inGalleryRunway ? galleries[galleryIndex].id : progress>.72 ? "atrium" : "arrival";
      const walkthroughStage = Math.min(GALLERY_WAYPOINTS-1,Math.floor(roomProgress*GALLERY_WAYPOINTS));
      if (
        inGalleryRunway &&
        (destination !== previousStoryDestination || walkthroughStage !== previousStoryStage) &&
        !motionDisabled
      ) {
        window.dispatchEvent(new CustomEvent("museum-room-moment",{detail:{room:destination,waypoint:walkthroughStage}}));
      }
      if(inGalleryRunway&&(destination!==previousStoryDestination||walkthroughStage!==previousStoryStage)){
        onWalkthroughStage(walkthroughStage,destination);
      }
      previousStoryDestination = inGalleryRunway ? destination : null;
      previousStoryStage = inGalleryRunway ? walkthroughStage : -1;
      root.style.setProperty("--room-progress",roomProgress.toFixed(4));
      root.style.setProperty("--room-copy-opacity",Math.max(0,1-Math.max(0,roomProgress-.2)*10).toFixed(4));
      const cameraPath=galleryCameraPaths[destination]??galleryCameraPaths.marines;
      const [cameraX,cameraY,cameraScale]=sampleCameraPath(cameraPath,roomProgress);
      root.style.setProperty("--room-frame-progress",roomProgress.toFixed(4));
      root.style.setProperty("--walk-camera-x",motionDisabled?"0px":`${(cameraX*window.innerWidth/100).toFixed(2)}px`);
      root.style.setProperty("--walk-camera-y",motionDisabled?"0px":`${(cameraY*window.innerHeight/100).toFixed(2)}px`);
      root.style.setProperty("--walk-camera-scale",motionDisabled?"1":cameraScale.toFixed(4));
      root.style.setProperty("--walk-atmosphere-scale",motionDisabled?"1":(1+(cameraScale-1)*1.6).toFixed(4));
      root.style.setProperty("--walk-light-x",motionDisabled?"0px":`${((roomProgress-.5)*window.innerWidth*1.5).toFixed(2)}px`);
      root.style.setProperty("--walk-light-opacity",motionDisabled?"0":(Math.sin(Math.PI*roomProgress)*.42).toFixed(4));
      if(destination!==lastDestination){
        lastDestination=destination;
        onDestination(destination);
      }
      const approach = easeInOut(clamp(progress / .74));
      const portal = easeInOut(clamp((progress - 0.5) / 0.24));
      const inside = easeInOut(clamp((progress - .38) / .38));
      const copy = easeInOut(clamp((progress - .64) / .22));
      const threshold = Math.sin(clamp((progress - 0.53) / 0.24) * Math.PI);
      const doorwayScale = 1 / (1 - portal * .9);

      root.style.setProperty("--scroll", progress.toFixed(4));
      root.style.setProperty("--journey-progress",journeyProgress.toFixed(4));
      root.style.setProperty("--entry-interior",easeInOut((progress-.35)/.38).toFixed(4));
      root.style.setProperty("--entry-exterior",(1-easeInOut((progress-.5)/.25)).toFixed(4));
      root.style.setProperty("--approach", approach.toFixed(4));
      root.style.setProperty("--inside", inside.toFixed(4));
      root.style.setProperty("--portal", portal.toFixed(4));
      root.style.setProperty("--detail", easeInOut((progress-.435)/.035).toFixed(4));
      root.style.setProperty("--background-scale", (1+approach*.16).toFixed(4));
      root.style.setProperty("--ground-scale", (1+approach*1.18).toFixed(4));
      root.style.setProperty("--canopy-x", `${(approach*window.innerWidth*.27).toFixed(2)}px`);
      root.style.setProperty("--doorway-scale", doorwayScale.toFixed(4));
      root.style.setProperty("--interior-presence", easeInOut((progress-.50)/.025).toFixed(4));
      root.style.setProperty("--portal-top", `${Math.max(0,47-12*doorwayScale).toFixed(3)}%`);
      root.style.setProperty("--portal-side", `${Math.max(0,50-8*doorwayScale).toFixed(3)}%`);
      root.style.setProperty("--portal-bottom", `${Math.max(0,53-12*doorwayScale).toFixed(3)}%`);
      root.style.setProperty("--exterior-presence", (1-easeInOut((progress-.735)/.03)).toFixed(4));
      root.style.setProperty("--exterior-scale", (1 + approach * 1.04).toFixed(4));
      root.style.setProperty("--exterior-y", `${(-approach * 4.8).toFixed(2)}vh`);
      root.style.setProperty("--foreground-scale", (1 + approach * 1.72).toFixed(4));
      root.style.setProperty("--foreground-y", `${(approach * 15).toFixed(2)}vh`);
      root.style.setProperty("--portal-radius", `${(portal * 142).toFixed(2)}%`);
      root.style.setProperty("--lobby-scale", (1.07 - inside * 0.07).toFixed(4));
      root.style.setProperty("--lobby-opacity", clamp(portal * 1.35).toFixed(4));
      root.style.setProperty("--copy-opacity", copy.toFixed(4));
      root.style.setProperty("--copy-y", `${((1 - copy) * 3.5).toFixed(2)}rem`);
      root.style.setProperty("--exterior-ui-opacity", clamp(1 - progress * 3.2).toFixed(4));
      root.style.setProperty("--ambient-opacity", clamp(1 - inside * 0.75).toFixed(4));
      root.style.setProperty("--threshold-opacity", threshold.toFixed(4));
      root.style.setProperty("--lobby-drift", `${((1 - inside) * 1.6).toFixed(2)}vh`);
      root.style.setProperty("--scene-brightness", (0.88 + approach * 0.12).toFixed(3));
      frame = 0;
    };

    const requestRender = () => {
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch" || pointerFrame) return;
      pointerFrame = window.requestAnimationFrame(() => {
        const x = (event.clientX / window.innerWidth - 0.5) * 2;
        const y = (event.clientY / window.innerHeight - 0.5) * 2;
        root.style.setProperty("--look-x", `${(x * -7).toFixed(2)}px`);
        root.style.setProperty("--look-y", `${(y * -4).toFixed(2)}px`);
        pointerFrame = 0;
      });
    };

    render();
    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", requestRender, { passive: true });
    window.addEventListener("pointermove", move, { passive: true });

    return () => {
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", requestRender);
      window.removeEventListener("pointermove", move);
      if (frame) window.cancelAnimationFrame(frame);
      if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
    };
  }, [ref,onDestination,onWalkthroughStage,motionDisabled]);
}

function MuseumMark() {
  return (
    <div className="museum-mark" aria-label="Museum of Fragrance">
      <span aria-hidden="true" className="museum-mark__seal">
        <i>M</i><b>F</b>
      </span>
      <span className="museum-mark__name">Museum <i>of</i> Fragrance</span>
    </div>
  );
}

export function MuseumEntrance() {
  const journeyRef = useRef<HTMLElement>(null);
  const finaleRef = useRef<HTMLDialogElement>(null);
  const storyToggleRef = useRef<HTMLButtonElement>(null);
  const noticeTimer = useRef<number | null>(null);
  const noticeSequence = useRef(0);
  const visitedRef = useRef<Destination[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [destination,setDestination]=useState<Destination>("arrival");
  const [walkthroughStage,setWalkthroughStage]=useState(0);
  const [storyDestination,setStoryDestination]=useState<Destination|null>(null);
  const [walkthroughNotice,setWalkthroughNotice]=useState<{id:number;destination:Destination;stage:number}|null>(null);
  const [visitedGalleries,setVisitedGalleries]=useState<Destination[]>([]);
  const [finaleOpen,setFinaleOpen]=useState(false);
  const [passageActive,setPassageActive]=useState(false);
  const marine=destination==="marines",gardens=destination==="gardens",sultans=destination==="sultans",cedar=destination==="cedar",amber=destination==="amber",souk=destination==="souk",pastry=destination==="pastry",liquors=destination==="liquors",riviera=destination==="riviera",tobacco=destination==="tobacco",inGallery=marine||gardens||sultans||cedar||amber||souk||pastry||liquors||riviera||tobacco;
  const [menuOpen,setMenuOpen]=useState(false);
  const menuToggle=useRef<HTMLButtonElement>(null);
  const destinationRef=useRef<Destination>(destination);
  const previousDestination=useRef<Destination>(destination);
  const current=destinations.find(item=>item.id===destination)!;
  const next=destination==="atrium"?destinations[2]:marine?destinations[3]:gardens?destinations[4]:sultans?destinations[5]:cedar?destinations[6]:amber?destinations[7]:souk?destinations[8]:pastry?destinations[9]:liquors?destinations[10]:riviera?destinations[11]:null;
  const galleryNumber=inGallery?destinations.indexOf(current)-1:0;
  const roomFrame=inGallery?galleryFrames[destination]?.[walkthroughStage]:undefined;
  const roomStory=inGallery?galleryStories[destination]:undefined;
  const storyOpen=storyDestination===destination;
  const motionPaused = paused || reduced;
  const recordVisit=useCallback((room:Destination)=>{
    if(!galleries.some(gallery=>gallery.id===room)||visitedRef.current.includes(room))return;
    visitedRef.current=[...visitedRef.current,room];
    setVisitedGalleries(visitedRef.current);
  },[]);
  const updateWalkthroughStage=useCallback((stage:number,room:Destination)=>{
    if(!galleries.some(gallery=>gallery.id===room))return;
    setWalkthroughStage(stage);
    setWalkthroughNotice({id:++noticeSequence.current,destination:room,stage});
    if(noticeTimer.current!==null)window.clearTimeout(noticeTimer.current);
    noticeTimer.current=window.setTimeout(()=>setWalkthroughNotice(null),1800);
  },[]);
  const updateDestination=useCallback((next:Destination)=>{
    if(destinationRef.current!==next){
      destinationRef.current=next;
      setStoryDestination(null);
      recordVisit(next);
    }
    setDestination(next);
  },[recordVisit]);
  useMuseumJourney(journeyRef,updateDestination,updateWalkthroughStage,motionPaused);
  useSpatialJourney(journeyRef,destination,reduced);
  useEffect(()=>{
    const previous=previousDestination.current;
    previousDestination.current=destination;
    if(motionPaused)return;
    const previousIndex=galleries.findIndex(item=>item.id===previous);
    const currentIndex=galleries.findIndex(item=>item.id===destination);
    if(previousIndex<0||currentIndex<0||previousIndex===currentIndex)return;
    setPassageActive(true);
    const timer=window.setTimeout(()=>setPassageActive(false),720);
    return()=>window.clearTimeout(timer);
  },[destination,motionPaused]);
  const navigate=(target:Destination)=>{
    const root=journeyRef.current;if(!root)return;
    const galleryStep=window.innerHeight*GALLERY_SCROLL_VIEWPORTS;
    const galleryRunway=galleryStep*GALLERY_COUNT;
    const entranceEnd=root.offsetTop+root.offsetHeight-window.innerHeight-galleryRunway;
    const galleryIndex=galleries.findIndex(item=>item.id===target);
    const top=target==="arrival"?root.offsetTop:target==="atrium"?entranceEnd:entranceEnd+Math.max(0,galleryIndex)*galleryStep+1;
    window.scrollTo({top,behavior:"instant"});
    destinationRef.current=target;
    recordVisit(target);
    setDestination(target);
    setWalkthroughStage(0);
    setStoryDestination(null);
    setMenuOpen(false);
    if(target==="arrival"){
      if(noticeTimer.current!==null)window.clearTimeout(noticeTimer.current);
      setWalkthroughNotice(null);
      requestAnimationFrame(()=>root.querySelector<HTMLElement>(".scroll-invitation")?.focus({preventScroll:true}));
    }
    if(menuOpen)menuToggle.current?.focus({preventScroll:true});
  };

  useEffect(()=>{
    const dialog=finaleRef.current;
    if(!dialog)return;
    if(finaleOpen&&!dialog.open)dialog.showModal();
    else if(!finaleOpen&&dialog.open)dialog.close();
  },[finaleOpen]);

  useEffect(()=>()=>{if(noticeTimer.current!==null)window.clearTimeout(noticeTimer.current);},[]);

  const restartVisit=()=>{
    setFinaleOpen(false);
    visitedRef.current=[];
    setVisitedGalleries([]);
    navigate("arrival");
  };

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change",sync);
    return () => media.removeEventListener("change",sync);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      const navigation=journeyRef.current?.querySelector<HTMLElement>("#gallery-navigation button[aria-current='location']")
        ??journeyRef.current?.querySelector<HTMLElement>("#gallery-navigation button");
      navigation?.focus({preventScroll:true});
    }
  }, [menuOpen]);

  useEffect(() => {
    if(!inGallery||motionPaused)return;
    let timer=0;
    let cancelled=false;
    const inviteMotion=()=>{
      if(cancelled)return;
      if(!document.hidden)window.dispatchEvent(new CustomEvent("museum-room-moment",{detail:destination}));
      timer=window.setTimeout(inviteMotion,24000);
    };
    timer=window.setTimeout(inviteMotion,6500);
    return()=>{cancelled=true;window.clearTimeout(timer);};
  },[destination,inGallery,motionPaused]);

  useEffect(() => {
    const image = journeyRef.current?.querySelector<HTMLImageElement>(".arrival-photo");
    if (!image) return;

    const reveal = () => setLoaded(true);
    if (image.complete && image.naturalWidth > 0) {
      void image.decode().catch(() => undefined).finally(reveal);
    } else {
      image.addEventListener("load", reveal, { once: true });
    }

    return () => image.removeEventListener("load", reveal);
  }, []);

  return (
    <main className="museum-experience">
      <a className="skip-link" href="#museum-welcome" onClick={event => {
        event.preventDefault();
        const root = journeyRef.current;
        if (!root) return;
        navigate("atrium");
        root.querySelector<HTMLElement>("#museum-welcome")?.focus({preventScroll:true});
      }}>Skip to museum welcome</a>

      <section
        className={`museum-journey depth-journey gallery-journey${loaded ? " is-loaded" : ""}${motionPaused ? " motion-paused" : ""}${inGallery?" showing-gallery":""}${marine?" showing-marines":""}${gardens?" showing-gardens":""}${sultans?" showing-sultans":""}${cedar?" showing-cedar":""}${amber?" showing-amber":""}${souk?" showing-souk":""}${pastry?" showing-pastry":""}${liquors?" showing-liquors":""}${riviera?" showing-riviera":""}${tobacco?" showing-tobacco":""}`}
        data-destination={destination}
        ref={journeyRef}
        aria-label="Museum of Fragrance galleries"
      >
        <div className="museum-viewport">
          <div className="journey-progress-bar" role="progressbar" aria-label="Museum visit progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0} aria-valuetext="0% of the museum visit"><i /></div>
          {walkthroughNotice&&<div className="museum-progress-notice" key={walkthroughNotice.id} role="status">
            <span>{current.number!=="00"&&current.number!=="A"?`Gallery ${current.number} · `:""}{current.label}</span>
            <i aria-hidden="true"/>
            <span>{galleryBeatLabels[walkthroughNotice.stage]} · {String(walkthroughNotice.stage+1).padStart(2,"0")} / {String(GALLERY_WAYPOINTS).padStart(2,"0")}</span>
          </div>}
          <div className="loading-curtain" aria-hidden="true">
            <span className="loading-curtain__monogram">MF</span>
          </div>

          <div className="exterior-world" aria-hidden="true">
            <ExteriorDepthScene paused={motionPaused||inGallery} onReady={() => setLoaded(true)} />
            <div className="exterior-color" />
          </div>

          <div className="lobby-world" aria-hidden="true">
            <InteriorDepthScene paused={motionPaused||inGallery} />
            <div className="lobby-color" />
          </div>

          <DepthAtmosphere paused={motionPaused||inGallery} />
          <MarinesGallery active={marine} paused={motionPaused}/>
          <GardensGallery active={gardens} paused={motionPaused}/>
          <SultansGallery active={sultans} paused={motionPaused}/>
          <CedarGallery active={cedar} paused={motionPaused}/>
          <AmberGallery active={amber} paused={motionPaused}/>
          <SoukGallery active={souk} paused={motionPaused}/>
          <PastryGallery active={pastry} paused={motionPaused}/>
          <LiquorsGallery active={liquors} paused={motionPaused}/>
          <RivieraGallery active={riviera} paused={motionPaused}/>
          <TobaccoGallery active={tobacco} paused={motionPaused}/>

          <div className={`museum-passage${passageActive?" is-active":""}`} aria-hidden="true"/>
          <header className="museum-header">
            <MuseumMark />
            <div className="museum-header__side">
              <span className="edition-label">{inGallery?`Collection · ${current.number} / 10`:destination==="atrium"?"The grand atrium · 10 galleries":"Museum entrance · Permanent collection"}</span>
              <button type="button" className="motion-control" aria-pressed={motionPaused}
                disabled={reduced} onClick={() => setPaused(value => !value)}
                aria-label={reduced ? "Environmental motion disabled by your system preference" : paused ? "Resume environmental motion" : "Pause environmental motion"}>
                {motionPaused ? "Motion paused" : "Pause motion"}
              </button>
              <MuseumAudio destination={destination}/>
            </div>
          </header>

          <p className="museum-announcement" aria-live="polite" aria-atomic="true">
            {inGallery
              ? `${current.label}, gallery ${galleryNumber} of 10`
              : destination==="atrium"
                ? "The grand atrium. Ten fragrance galleries are open to explore."
                : "Museum entrance. Continue scrolling to enter the grand atrium."}
          </p>

          <div className="arrival-caption" aria-hidden="true">
            <span>Arrival</span><i /><span>Above the cloudline</span>
          </div>

          <div className="welcome-signage" id="museum-welcome" tabIndex={-1} aria-hidden={inGallery}>
            <span className="welcome-signage__eyebrow">The grand atrium · Gallery level</span>
            <h1><span>Welcome to the</span><em>Museum of Fragrance</em></h1>
            <div className="welcome-signage__rule" aria-hidden="true"><i /><b>MF</b><i /></div>
            <p>Continue through the atrium to explore ten fragrance galleries.</p>
            <span className="welcome-signage__reflection" aria-hidden="true">Museum of Fragrance</span>
          </div>

          <button ref={menuToggle} type="button" className="gallery-menu-toggle" aria-expanded={menuOpen} aria-controls="gallery-navigation" onClick={()=>setMenuOpen(value=>!value)} aria-label={menuOpen?"Close gallery menu":"Open gallery menu"}>
            {menuOpen?<X size={17} aria-hidden="true"/>:<GalleryVerticalEnd size={17} aria-hidden="true"/>}<span>Galleries</span><i/>{current.label}
          </button>
          {menuOpen&&<button className="gallery-menu-backdrop" type="button" aria-label="Close gallery menu" onClick={()=>{setMenuOpen(false);menuToggle.current?.focus({preventScroll:true});}}/>}
          <nav id="gallery-navigation" className={`gallery-rail${menuOpen?" is-open":""}`} aria-label="Museum galleries" onKeyDown={event=>{if(event.key==="Escape"){setMenuOpen(false);menuToggle.current?.focus({preventScroll:true});}}}>
            {destinations.map(item=><button type="button" key={item.id}
              aria-current={destination===item.id?"location":undefined}
              onClick={()=>navigate(item.id)}><span className="gallery-rail__number" aria-hidden="true">{item.number}</span><span>{item.label}</span></button>)}
          </nav>
          <RoomResponseControl room={destination} paused={motionPaused}/>
          {inGallery&&roomStory&&<button ref={storyToggleRef} className="gallery-discovery-toggle" type="button" aria-expanded={storyOpen} aria-controls="gallery-room-story" onClick={()=>setStoryDestination(storyOpen?null:destination)}>{storyOpen?"Close discovery":"Discover this room"}</button>}
          {inGallery&&roomStory&&<aside className="gallery-room-story" id="gallery-room-story" aria-labelledby="gallery-room-story-title" hidden={!storyOpen} onKeyDown={event=>{
            if(event.key==="Escape"){
              setStoryDestination(null);
              storyToggleRef.current?.focus({preventScroll:true});
            }
          }}>
            <button className="gallery-room-story__close" type="button" aria-label="Close room discovery" onClick={()=>{
              setStoryDestination(null);
              window.requestAnimationFrame(()=>storyToggleRef.current?.focus({preventScroll:true}));
            }}><X size={16} aria-hidden="true"/></button>
            <span>{roomStory.exhibit}</span>
            <h2 id="gallery-room-story-title">{roomStory.title}</h2>
            <p>{roomStory.detail}</p>
            {roomFrame&&<div className="gallery-room-story__waypoint"><span>Along your walk</span><b>{roomFrame.title}</b><p>{roomFrame.detail}</p></div>}
          </aside>}
          {tobacco&&walkthroughStage===GALLERY_WAYPOINTS-1&&<button className="gallery-finale-trigger" type="button" onClick={()=>setFinaleOpen(true)}>Complete your visit<span aria-hidden="true">↗</span></button>}
          <dialog ref={finaleRef} className="gallery-finale" aria-labelledby="gallery-finale-title" onClose={()=>setFinaleOpen(false)} onKeyDown={event=>{
            if(event.key==="Escape"){
              event.preventDefault();
              setFinaleOpen(false);
            }
          }}>
            <span className="gallery-finale__eyebrow">Museum of Fragrance · Visit complete</span>
            <h2 id="gallery-finale-title">Carry the journey with you.</h2>
            <p>You explored {visitedGalleries.length} of {GALLERY_COUNT} galleries. Choose a room for one last look, or begin again.</p>
            <div className="gallery-finale__rooms" aria-label="Revisit a gallery">
              {galleries.filter(item=>visitedGalleries.includes(item.id)).map(item=><button type="button" key={item.id} onClick={()=>{
                setFinaleOpen(false);
                navigate(item.id);
              }}><span>{item.number}</span>{item.label}</button>)}
            </div>
            <div className="gallery-finale__actions">
              <button type="button" className="gallery-finale__restart" onClick={restartVisit}>Begin again</button>
              <button type="button" className="gallery-finale__close" autoFocus onClick={()=>setFinaleOpen(false)}>Close</button>
            </div>
          </dialog>
          {next&&destination==="atrium"&&<button className="enter-marines" type="button" aria-label={`Begin the collection: ${next.label}`} onClick={()=>navigate(next.id)}><span>Begin the collection</span> {next.label} <span aria-hidden="true">↗</span></button>}

          <div className="journey-progress" aria-hidden="true">
            <span>Exterior</span><div className="journey-progress__track"><i /></div><span>Atrium</span>
          </div>

          {destination==="arrival"&&<button className="scroll-invitation" type="button" aria-label="Enter the grand atrium" onClick={()=>navigate("atrium")}>
            <span>Enter</span><i><b /></i><span>Scroll or tap</span>
          </button>}

          <div className="film-grain" aria-hidden="true" />
          <div className="frame-vignette" aria-hidden="true" />
        </div>
      </section>
    </main>
  );
}
