# The Liquors

Gallery 08 extends the museum after The Pastry Room. The scene is an immaculate
barrel-house bar with honey oak casks, disciplined rope details, glowing amber
onyx, crystal decanters, a bartender and two adult guests. Orange and copper
light is balanced by deep teal architecture. The existing opening and gallery
journey are retained, without adding catalogue or backend functionality.

## Asset provenance and rendering

Built-in ImageGen created exactly two original assets: a 1672×941 photographic
interior and a 1254×1254 transparent decanter/glass still life. They are generated
imagery, not photographs of an actual bar. Runtime WebP assets are
`liquors-gallery.webp` (337,670 bytes) and `liquors-crystal.webp` (170,868 bytes,
720×720), totaling 508,538 bytes. No video, image sequence, dependency or runtime
image-generation request was added.

The photographic foundation remains a native image. A source-coordinate canvas
adds thirteen independently varying lamp/shelf/candle glows, seven localized
bottle glints, and a perspective-masked light sweep along the onyx countertop.
A small jacket patch adds restrained breathing movement to the bartender without
moving his head or the surrounding bar. Fine warm dust drifts at separate depths
(76 particles on desktop, 35 on phone). Room light changes slowly.

The separate foreground crystal has its own highlight/ripple canvas, contact
shadow and small desktop pointer parallax. Clicking or keyboard-activating the
glass increases its liquid ripples and triggers an optional crystal clink. The
image and canvas travel together. Tablet placement keeps the glass below the
navigation rail; the mobile crop keeps it fully in view.

The animation clock survives pause/resume. Frame callbacks stop for inactive or
paused scenes and skip hidden documents. Drawing is capped near 30fps and ambient
canvas density at 1.5. Reduced-motion preferences suppress ambient effects and
simplify travel. No image-wide blur or displacement is applied.

## Sound and navigation

An original 66bpm lounge score combines rounded chords, restrained bass and soft
brushes. Procedural liquid foley adds a short filtered stream with resonant
bubbles approximately every 22 seconds, followed by crystal/ice-like chimes.
These are synthesized impressions, not whisky field recordings. Tapping the
foreground glass adds a rate-limited clink only when the shared Music control is
already enabled. Other gallery scores and opt-in playback are preserved.

The Pastry Room remains at 960px beyond the atrium journey. The Liquors is at
1104px, with its selection threshold at 1032px. The existing 0.95-second 3D
transition requires only a short additional native scroll. Ten destinations are
available directly in the rail/mobile menu. Shared header and next-gallery
controls now have explicit UI stacking above all gallery environments.

## Verification

- Supported production build passes.
- Desktop composition inspected with readable copy, restored header controls,
  barrels, bartender, illuminated shelves and foreground crystal visible.
- Phone 390×844 and tablet 820×844 checked in same-origin responsive frames;
  client/scroll widths were 375/375 and 805/805, with no horizontal overflow.
- Mobile menu exposes all ten destinations and closes when a gallery is selected.
- Native 120-unit wheel gesture from Pastry reached Liquors. The browser gesture
  tool reported a timeout, but the resulting destination confirmed completion.
- Crystal activation produced the accessible acknowledgement and an active
  Liquors score showed a nonzero audio RMS signal of 0.00814.
- Native motion pause kept Liquors active and its clock at 10.02 across samples.
- No application errors appeared in the inspected browser logs; unrelated
  extension metadata errors were excluded.
- Reduced-motion behavior was reviewed in code. Physical-device frame rate,
  system preference behavior and listening quality remain hardware QA tasks.
- The temporary responsive preview harness was removed before publication.
