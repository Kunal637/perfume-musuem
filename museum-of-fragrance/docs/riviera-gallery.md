# The Riviera

Gallery 09 follows The Liquors, introducing clean musky fragrances through a
bright Mediterranean terrace. White linen, pale limestone, azure sea, a turquoise
infinity pool, lemon foliage and a distant coastal town distinguish it from the
more dramatic marine gallery. Existing gallery travel and global controls remain.

## Assets and photographic foundation

Built-in ImageGen produced exactly three original assets: a 1672×941 terrace,
a transparent soaring gull and a transparent classic sailing yacht. These are
photorealistic generated images, not photographs of a specific real property.
Runtime WebPs total 385,722 bytes: `riviera-gallery.webp` (366,254),
`riviera-gull.webp` (5,988) and `riviera-yacht.webp` (13,480). The two sprites are
small optimized derivatives. No video, image sequence, package or image API
was added.

## Living layers

The background remains a sharp native image. Two transparent canvases add:

- Separately masked sea and pool displacement using photographic strips, with
  different wave frequencies and amplitudes. Coastline and stone stay fixed.
- Ninety-five small sea reflections and faint drifting pool caustics.
- Travelling folds within the left linen curtain, plus bounded movement of the
  right canopy. On phone and tablet the curtain is projected at the left edge
  rather than disappearing outside the cover crop.
- A slow yacht passage with restrained rocking, reflected silhouette and wake.
- Five gliding gulls on desktop, three on phone, with independent trajectories.
- Fine airborne particles and slow changes in the sunlight overlay.

The pool is a keyboard-accessible transparent button clipped to the actual water
polygon. A pointer tap creates perspective-flattened ripples at that location;
keyboard activation uses an interior point. Ripples are bounded to eight recent
interactions. An accessible status acknowledges the interaction. When motion is
paused, the status instead acknowledges a quiet moment by the water.

Clocks survive pause/resume, stop for inactive/paused scenes and skip hidden
pages. Canvas drawing is capped near 30fps, with pixel density capped at 1.5.
Reduced-motion styling suppresses animated layers and simplifies the transition.
The whole photograph is never blurred or displaced.

## Sound and navigation

The optional coastal score uses soft extended chords, sparse keys, light brushes,
gently modulated surf-like noise and occasional distant gull-like tones. A pool
tap adds a short water-drop tone only when Music is already enabled. These sounds
are synthesized, not field recordings. Other gallery scores are preserved.

The Liquors stays at 1104px beyond the atrium journey; Riviera is at 1248px, with
its threshold at 1176px. The existing 0.95-second perspective transition requires
only a short native scroll. All eleven destinations remain directly accessible.

## Verification

- Supported production build passes.
- Desktop composition checked, including readable exhibition copy and aligned
  pool, curtain, yacht and sea effects.
- Phone 390×844 and tablet 820×844 inspected in same-origin responsive frames.
  Their client/scroll widths matched at 375/375 and 805/805; no horizontal overflow.
- Phone menu exposes all eleven destinations and closes when Riviera is chosen.
- Pool taps on desktop and phone produced the accessible ripple acknowledgement.
- The Riviera score played with a nonzero RMS signal of 0.00731. This establishes
  synthesis, not listening quality on physical speakers.
- Native motion pause held the Riviera clock at 145.48 across samples while
  Riviera remained active. Resume was exercised through the same control.
- A native 120-unit wheel gesture from The Liquors reached Riviera.
- No application errors appeared in inspected browser logs, excluding unrelated
  extension metadata errors.
- Reduced-motion behavior was reviewed in code. Real-device performance and
  system-preference testing remain hardware QA tasks.
- The temporary responsive preview harness was removed before publication.
