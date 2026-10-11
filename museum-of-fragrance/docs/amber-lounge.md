# Amber Lounge — gallery 05

A contemporary jazz club for sophisticated amber fragrances. Teal velvet couches,
polished brass saxophone, piano, double bass, candlelit tables and a luminous amber
ceiling sculpture provide visual identity. Cream editorial typography retains the
existing museum style. The room is fictional generated photographic imagery.

## Assets

One generated 1672 × 941 club scene, converted to WebP quality 91: 271,244 bytes.
One generated transparent dancing couple, 1024 × 1536 RGBA source, reduced to
600 × 900 WebP quality 90: 67,626 bytes. Total new runtime imagery: 338,870 bytes.
No video, frame sequence, new package or runtime media-generation dependency.
The couple is a photographic layer with subtle slow-dance sway and turn, not a
fully articulated character animation. The source has genuine transparent alpha.
The first image task was interrupted after the background finished; only the
missing couple was requested in recovery. No scene variants were generated.

## Environmental motion

Thirteen photographed lamps and candles have independently varying emission,
dimming cores and spill. Feathered stage light and floor light washes drift slowly.
96 fine dust motes on desktop (44 mobile) use different speeds, sizes and phases.
No indoor leaves, flashing strobes or large confetti. Architecture stays sharp.
The couple is registered to the photographed dance floor; mobile moves them right
of the text and preserves the saxophone at the edge of the scene.

Rendering is capped at about 30 updates/second and stops when inactive, hidden or
paused. Resize registration runs even while paused. System reduced motion hides
ambient effects, leaves the couple still and substitutes a short fade for travel.

## Navigation and audio

Native gallery runway is now 672 pixels after the existing atrium journey. Cedar
retains its 528-pixel position; crossing 600 selects Amber at 672. One short
120-pixel wheel gesture from Cedar triggers the existing 0.95-second 3D transition.
The shared menu has seven destinations; Cedar also has a next-gallery button.
There is no scroll interception or lock.

The music control reads “Play jazz” / “Jazz on” in Amber. Playback begins with a
user tap, then continues and changes theme between galleries. An original 86 BPM
Web Audio quartet arrangement uses ii–V–I–VI harmony, swung reed-style melody with
vibrato, piano-like comping, walking bass and brushed noise percussion. These are
synthesized instruments, not a recorded live band or commercial recording. Amber
uses a slightly higher master level, with a smooth transition and the existing
compressor. No downloaded audio is required.

## Verification

Desktop, 390 × 844 phone and 820 × 844 tablet inspected in the browser preview.
Phone and tablet document widths equal their scroll widths (375 and 805 pixels).
Mobile selector entered Amber and closed. Dancer/text overlap found on the first
phone view was fixed by moving the couple and narrowing the body copy.
One 120-pixel native scroll from Cedar selected Amber. Pause held environmental
time at 46.39 across samples. Playback reported playing=true and score=amber,
with nonzero measured RMS (0.00783 before the final moderate level increase).
This confirms an audio signal, not subjective listening on physical hardware.
The temporary responsive preview component was removed before the final build.
Physical-device frame rate, system reduced-motion simulation and subjective
instrument timbre remain hardware QA tasks.
