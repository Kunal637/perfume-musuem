# Living museum revision

This revision supersedes the character/cameo and motion details in the individual gallery notes.

## Physical motion correction

The user rejected broad photographic sway. The revised rooms now keep the photographic foundation fixed: no foliage, fabric, human or sky displacement patches, and no cursor-driven camera drift. Water alone is refracted inside carefully inset pool/sea masks. Marines and Tobacco remain the approved references and their components, imagery and established motion are unchanged. Independent steam, smoke, light emissions, glints, particles, butterflies, seeds, falling petals, gulls and the Riviera yacht provide depth and continuous activity. Three separate photographic petals now fall through the Gardens at different sizes and speeds; the flower beds and conservatory do not deform.

Redundant bartender, window-foliage, linen and tree-warp passes were also removed from the older room renderers. Empty material layers do not allocate a canvas or GPU context; smoke-only rooms use Canvas without a WebGL allocation.

## Experience

- Arrival uses a new clean limestone-and-reflection-pool photograph. Native entrance travel is 90vh (previously 440vh), with a single exterior-to-atrium threshold. Arrival/atrium never replay the timed gallery transition.
- Gallery changes use short, level perspective camera moves (680 ms desktop, 560 ms phone). Forward and backward movement share the same thresholds; particles and exhibition copy move independently of the photograph. No rotating walls, broad camera sway or travelling dark veil. Native scroll, reverse scrolling, direct navigation and reduced-motion access remain available, without wheel interception or gesture lock.
- Desktop navigation contracts to a numbered rail, revealing labels on hover or keyboard focus. Mobile retains the complete gallery menu.
- The Marines, Sultans and Souk cutout cameos and the Liquors crystal sticker have been removed. Souk's photographed inhabitants remain. Amber has photographed musicians and guests; Tobacco has a seated guest within the room photograph.

## Continuous environmental motion

`museum-materials.ts` registers material regions in normalized photograph coordinates. `living-materials.tsx` refracts only water in the revised rooms; Tobacco retains its approved isolated effects. A WebGL material pass has a feathered Canvas 2D fallback; neither uses video. Active-room material surfaces use a capped pixel ratio and 25–30 fps budget. Architecture and typography remain independent of material displacement.

| Room | Continuous layers |
| --- | --- |
| Arrival | Reflection pools, foreground atmosphere and practical lighting |
| Atrium | Light shafts, independent display lights, glass reflections and depth-layered dust; no leaves |
| Marines | Stronger refracted water, foam and sea spray |
| Gardens | Pool surface, butterflies, falling photographic petals, wind-driven seeds and pollen |
| Sultans | Bosphorus water, suspended lamps, practical lights and incense |
| Cedar | Both pool planes, cigar smoke, display lights, accessory glints and airborne dust |
| Amber | Stage haze, independent lamps, moving light cones and airborne dust |
| Souk | Incense, travelling sand and practical lights |
| Pastry | Cup/espresso steam, neon, independent lamps, automatic rabbit discovery and sugar puffs |
| Liquors | Decanter glints, independent lamps, onyx reflections and airborne dust |
| Riviera | Sea/pool currents, yacht and wake, gulls and airborne coastal particles |
| Tobacco | Cigar/ashtray smoke, cigar glow, subtle hand movement, sky, reflections and dust |

Pause freezes environmental clocks. Reduced-motion users receive sharp photographs without the material/particle effects or perspective camera arcs. Audio still requires a deliberate user gesture; existing destination scores and controls are retained.

## Validation

- Production build passed. Desktop walkthrough covered all twelve destinations, the material fallback and direct navigation.
- The review browser reports WebGL unavailable, so visual QA exercised Canvas. GPU behavior was code-reviewed but not visually verified here.
- Cloud-mask corrections prevent window mullions, columns or tree silhouettes being carried into open sky. Riviera keeps its water/yacht pass separate from the shared sky/foliage renderer.
- Pause held Tobacco's material clock at 30.94 across separate observations; resume advanced it. Music reported playing with nonzero output level.
- Phone (390 × 844) and tablet (820 × 844) composition and navigation checks passed. Tobacco was reframed to retain the guest’s face, and Pastry typography was separated from its animated rabbit. The temporary review page was removed.
- Standalone TypeScript checking reports existing Cloudflare ambient-type gaps (`cloudflare:workers`, `Fetcher`, `D1Database`), with no frontend diagnostics. The supported production build succeeds.

### Physical motion verification

A source-level check confirms that every revised material scene uses only water displacement, and that the Marines/Tobacco component sources plus Tobacco material settings match the approved previous version. In browser observations 22 seconds apart, the Gardens camera remained `none` while the environmental clock advanced and the three independent petal positions changed. Cedar’s camera also remained fixed with exactly two animated pool masks. Amber uses no photograph-displacement region.

The revised Gardens also passed a 390 × 844 phone check with a fixed photograph and three separate petal elements.

The follow-up level-camera revision passed a simulated hook check for forward/reverse direction, phone timing, interruption cleanup, reduced motion, and avoiding a duplicate entrance transition. Fresh visual browser QA was unavailable for this follow-up because the required control-browser capability is absent; the earlier photographic-motion checks above remain the last visual observations.

## Gallery character and interaction revision

- Stronger short perspective passages now open through an expanding architectural aperture. Near atmosphere crosses faster than the photograph; type settles separately. Timing is 760 ms desktop / 600 ms phone. Native scroll remains uninterrupted and every room is available directly.
- All ten fragrance galleries have a room-specific, keyboard-accessible interaction. Gardens, Sultans, Cedar, Amber, Souk, Pastry and Liquors respond to local pointer/touch movement; Marines moves nearby sea spray and swell, Riviera sends a pool ripple, and Tobacco draws nearby motes toward the ember and briefly brightens it. Architecture remains fixed. Pause and reduced-motion disable these actions.
- Lingering in an active fragrance gallery now prompts a room-specific detail after five seconds and briefly stirs that room's existing atmosphere after six and a half seconds, then at a relaxed interval. Ambient moments use a separate visual-only event from deliberate visitor actions, so they do not trigger interaction sounds. They stop on room change, pause, reduced motion or page teardown.
- Each fragrance gallery now occupies sixty full viewports of native scroll (ten times the previous six-viewport visit), giving visitors a deliberately slow, extended walkthrough. Twenty-four room-specific waypoints reveal new details about every two-and-a-half viewport-heights, paired with unique arrival / orient / look closer / follow / notice / explore / discover / trace / pause / linger / reflect / depart and extended room-exploration beats. Crossing each waypoint gently stirs that room's existing atmosphere without interaction audio. The original title stays fully legible through the opening fifth of the room, then fades as the visitor moves into the room detail. Pause/reduced-motion keeps the title and footer visible. A continuous, room-specific curved camera path carries the environmental photograph through a gradual push-in and pan, while foreground atmosphere moves at a deeper parallax and a reflected-light sweep follows the visitor through the room. Frame captions settle in with a soft blur-to-clear transition. The next-gallery control appears only at the final waypoint. No extra photographs are added. Direct gallery-menu navigation remains available.
- Faster separate convection layers, stronger stage haze/light and clearer airborne detail improve idle activity. The approved Marines and Tobacco visual components remain unchanged.
- Pastry uses `public/images/pastry-vivid.webp`, converted from a single built-in imagegen colour edit. Prompt: preserve exact architecture, composition and every object position; recolour with luminous mint tiles, peach walls, butter-yellow counters, powder-blue seating and pastel confectionery; retain photographic daylight and textures, add no objects or text. Both the photo and steam registry reference the same asset. The original is retained.
- Twelve destinations now have separate musical arrangements. Arrival: cinematic ambient; Atrium: glass harmonics; Marines: tidal marimba; Gardens: harp-like waltz; Sultans: modal strings/reed; Cedar: lounge groove; Amber: jazz quartet; Souk: caravan percussion; Pastry: café waltz; Liquors: crystal nocturne; Riviera: coastal bossa; Tobacco: western guitar. These are original procedural scores, not recorded performances. A visible sound identity accompanies the enable/pause control. Room gain buses crossfade while the shared ambience changes smoothly.
- Automated checks exercised all twelve arrangements for distinct nonempty event sequences and finite note values, bounded/expiring input response, forward/reverse perspective, interruption cleanup, mobile timing and reduced-motion bypass. TypeScript reports only the pre-existing Cloudflare ambient-type gaps. The new pastry asset was visually inspected. Live browser/audio listening QA remains unavailable in this session.
- Twenty-four room-specific waypoints now extend the in-room walkthrough, each revealing a new detail every two-and-a-half viewport-heights across the sixty-viewport room. Crossing a waypoint gently stirs that room's existing atmosphere at a rotating set of room-specific visual hotspots, with a stronger cue every sixth stop; the Riviera also sends a ripple from a changing point in its pool. These visual-only responses do not play interaction audio. The large walkthrough card is replaced by a thin, screen-reader-labeled museum progress bar, a brief gallery/waypoint arrival notice, and a separate room-discovery control that reveals the room story and current waypoint detail. At the end of the final gallery, visitors can open a keyboard-accessible completion dialog, revisit rooms they entered, or restart the visit. Inactive and paused room canvas loops are suspended rather than drawing offscreen; museum music remains opt-in. Gallery-to-gallery changes use an overlapping, full-frame scale dissolve and a restrained warm doorway-light passage, avoiding an exposed dark gap while the next room arrives. Passage motion is disabled for reduced-motion visitors.
