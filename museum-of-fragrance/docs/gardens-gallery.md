# The Gardens and museum music

This records the Gardens release. The Sultans release subsequently extends the
gallery registry and changes the mobile chooser; see `sultans-gallery.md`.

The second gallery presents green and white floral unisex fragrances through a
photographic Victorian conservatory garden. White hydrangeas and roses, emerald
topiary, brass and glass, pale stone, and restrained fuchsia and lavender flowers
extend the museum's bright, physically grounded visual direction.

## Living environment

The native photographic image stays sharp while two feathered foreground flower
regions sway separately. Warm sunlight travels and changes intensity. Eighteen
photographic dandelion seeds drift through three depth levels; four photographic
butterflies follow independent curved paths with folding wings. Fine airborne
pollen completes the atmosphere. Mobile reduces sprites and pollen and preserves
the conservatory in its image crop. No video or additional rendering library is
used. Animation is paused when inactive, hidden, manually paused, or when the
system requests reduced motion. Reduced motion also replaces 3D travel with a fade.

Three ImageGen assets were generated once each and converted to WebP:

- `gardens-gallery.webp`: 1672 × 941, 502,098 bytes. A royal garden and glass
  conservatory, architecture to the right, white flowers and emerald planting.
- `garden-seed.webp`: 128 × 128 RGBA, 5,366 bytes. Isolated ivory dandelion seed.
- `garden-butterfly.webp`: 192 × 192 RGBA, 16,842 bytes. Open ivory butterfly with
  lavender and cobalt markings. Both sprite assets have genuine alpha.

The new imagery adds 524,306 bytes. All active museum images now total about
1.97 MB. The garden is generated photorealistic imagery, not a real location or
native 4K source. Foreground motion does not increase its intrinsic resolution.

## Travel

The opening's original approach distance and easing remain. A total 288 px of
native scroll follows the atrium, with Marines at 96 px and Gardens at 288 px.
Thresholds at 20 and 192 px trigger complete 0.95 second CSS perspective changes.
No wheel or touch interception, gesture lock, or long gallery runway is added.
Navigation includes all four destinations, and Marines now has a Gardens button.

## Music

The previous very quiet Atmosphere control is replaced by a prominent Music
on/off button. One tap enables an original generative musical score across the
whole journey. Arrival, atrium, Marines and Gardens have distinct chords,
melodies and tempos. Marine surf blends out as the destination changes; Gardens
adds delicate plucked notes and high birdlike accents. Reverberation is generated
locally. No audio file, third-party streaming service, or backend is required.

Playback is opt-in, remains enabled through navigation, and suspends in a hidden
tab. Scheduling and audio resources are cleaned up on stop/unmount. A live signal
meter drives the music indicator; an accessible retry message covers failure.

## Verification

- Desktop, 390 × 844 phone and 820 × 844 tablet preview frames were inspected.
  No horizontal overflow, missing garden images or app errors were observed.
- A 120 px scroll from the atrium reaches Marines; a second reaches Gardens.
  Reverse travel returns to Marines. Direct navigation and next-gallery buttons
  remain available. Native input magnitude can vary by device.
- Garden motion pause held its clock at 27.94 across separate samples while
  active; resuming restored motion.
- Music started and stopped through its visible accessible control, stayed on
  across destinations, and switched score state. Analyser output was nonzero
  (including RMS 0.02005 in Gardens), verifying actual audio signal generation.
  Loudspeaker/headphone timbre and real-device performance still require human
  hardware QA; this preview cannot establish perceived listening quality.
- Reduced motion is implemented but not emulated in this preview browser.
- Temporary responsive preview source is removed before production packaging.
