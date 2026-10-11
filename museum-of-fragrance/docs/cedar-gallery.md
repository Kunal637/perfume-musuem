# Cedar Room — gallery 04

A sunlit contemporary cedar retreat for woody citrus, woody aromatics and woody
fresh fragrances. The billiard table, tailored wardrobe, speaker, cigar and cutter,
watch, sauna, pool and grand touring car create recognizable visual details.
This is generated photographic imagery of a fictional environment, not a photograph
of an actual property or a product endorsement. No fragrance inventory backend.

## Image provenance and performance

One ImageGen scene, 1672 × 940 pixels, converted to WebP at quality 90. Runtime
asset `public/images/cedar-gallery.webp` is 288,910 bytes. The same image is cached
and reused for local water refraction and cloud motion. No video, frame sequence,
new dependency, external audio download or runtime image API. Full-image native
rendering retains sharp architecture; effects use separate Canvas 2D surfaces.

## Motion and navigation

Pool pixels move within two source-registered polygons excluding the glazing.
Fourteen low-opacity ripple highlights cross the water. Five display/pilot lights
vary independently without blackouts. Accessory reflections glint occasionally;
fine smoke originates at the photographed cigar tip. There are 76 depth-varying
dust motes on desktop and 36 on mobile. Slow cloud and daylight motion complements
the continuous water movement. No indoor leaves or confetti.

The environment shares pointer parallax with the existing galleries. Work pauses
when inactive, when the page is hidden, or when Pause motion is selected. Ambient
canvas work is capped at approximately 30 updates per second. Reduced-motion CSS
hides ambient layers and substitutes a short fade for the 3D transition.

The existing native-scroll system now has a 528-pixel gallery runway. Cedar is at
528 after the atrium; The Sultans remains at 384. Crossing 456 triggers Cedar,
so a 120-pixel wheel gesture from The Sultans enters it. There is no wheel event
interception or scroll lock. The shared selector now has six destinations; mobile
uses its existing accessible menu. The Sultans next-gallery button enters Cedar.

Opt-in Web Audio adds “Cedar in daylight”: a C-major-seventh-based 76 BPM theme
with warm sustained chords, bright sine melody and light syncopated accents. The
existing music button, volume envelope, reverb and scene switching remain.

## Verification

- Desktop composition inspected in the preview, including water, smoke and dust.
- Phone 390 × 844 and tablet 820 × 844 inspected in same-origin frames. Document
  widths were 375 and 805 respectively, with equal scroll widths: no horizontal
  overflow. Phone selector entered Cedar and closed correctly.
- One 120-pixel native wheel gesture from The Sultans selected Cedar.
- Pause held Cedar environment time at 29.61 across samples; resume succeeded.
- Music reported playing=true, score=cedar, measured signal RMS 0.01943. This
  verifies an audio signal, not subjective listening quality on physical hardware.
- No application errors observed; browser extension metadata errors are unrelated.
- Temporary responsive preview component removed before production build.
- System reduced-motion behavior is code-reviewed; physical-device frame rate,
  memory and subjective soundscape quality remain hardware QA tasks.
