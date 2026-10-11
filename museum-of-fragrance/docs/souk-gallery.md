# The Souk

Gallery 06 adds a bright desert marketplace after Amber Lounge for oud, bakhoor,
precious woods and resinous fragrances. Pale stone, apricot dunes and blue and
saffron textiles contrast with the preceding jazz club. The existing museum
controller, fast transitions, direct navigation and global controls are retained.

## Assets and rendering

Built-in ImageGen created a photorealistic 1672×941 marketplace plate and a
separate transparent adult figure in a blue robe and veil. These are generated
imagery, not photographs of an actual place. The plate includes a camel and
guide, market visitors, brass incense burner, resin trays and oud wood.

Runtime WebP assets are `souk-gallery.webp` (407,378 bytes) and `souk-muse.webp`
(70,996 bytes; 600×900), totaling 478,374 bytes. Native image elements retain
photographic detail. There is no video, image sequence, new dependency or
runtime image-generation request.

Two transparent canvases add localized fabric displacement and atmosphere.
Source-coordinate mapping tracks the image's object-fit crop at every viewport
size, keeping smoke, lamps and fabric registered to the photographed scene.
The blue curtain and upper awning move independently; architectural edges stay
stable. Five lamp glows vary asynchronously. Incense wisps rise from the burner,
fine sand drifts near the ground, and a second depth of dust floats across the
scene. The separate figure has restrained body sway and counter-shear in the robe.

Canvas work is capped near 30fps and skips inactive, hidden and paused scenes.
Mobile reduces particle counts. Reduced-motion styling removes environmental
animation and simplifies the entrance to a fade. No leaves appear in this room.

## Navigation and audio

All eight destinations remain directly accessible. The Souk sits 816px beyond
the atrium travel distance; Amber remains at 672px, with the Souk threshold at
744px. A short wheel gesture can trigger the existing 0.95-second perspective
transition without adding a long pinned section. The desktop rail is vertically
bounded; the phone menu uses its existing two-column layout.

The opt-in Music control selects an original synthesized desert theme, with
plucked melody, low drone, soft hand-drum-like rhythm, sparse chimes and wind.
This is procedural Web Audio, not a recording of an acoustic oud or camel.
Other gallery scores and the existing mute and motion controls are preserved.

## Verification

- The supported production build passes.
- Desktop composition inspected; title, camel, figure and full navigation visible.
- Phone 390×844 and tablet 820×844 inspected in same-origin responsive frames.
  Neither document had horizontal overflow. All eight mobile destinations were
  accessible; selecting The Souk closed the menu and entered the correct scene.
- A native 120-unit wheel gesture from Amber selected The Souk.
- Motion pause held the environment clock at 61.70 across samples, then resumed.
- Music selected the Souk score and produced a nonzero audio signal (RMS 0.01077).
  This verifies synthesis, not listening quality on physical speakers.
- Reduced-motion behavior was reviewed in code; real-device performance and
  system reduced-motion settings still require hardware QA.
- Temporary responsive test UI was removed from the shipping application.
