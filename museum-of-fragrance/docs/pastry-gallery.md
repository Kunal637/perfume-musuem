# The Pastry Room

Gallery 07 extends the museum after The Souk. The working name is The Pastry
Room; the user may confirm a different name later. Its gourmand palette combines
pistachio tile, butter yellow counters, pale blue upholstery, ivory and restrained
blush pink. The photorealistic retro patisserie retains architectural depth and
physical material detail, with chrome espresso equipment and glass confectionery
cases. It has no product catalogue or backend.

## Assets

Built-in ImageGen created exactly two original assets: a 1672×941 interior plate
and a transparent ivory rabbit-shaped marshmallow. These are generated images,
not photographs of a real bakery. WebP runtime assets are `pastry-gallery.webp`
(327,202 bytes) and `pastry-rabbit.webp` (31,648 bytes, 360×540), totaling 358,850
bytes. No video, frame sequence, new package or runtime generation API was added.

## Environmental motion and discovery

A transparent canvas maps effects to the image's source coordinates and cover
crop. Steam rises from the photographed espresso cup. Six opaline lamps vary
independently at gentle intensities; a real neon tube receives an asynchronous
emission overlay. Only outdoor foliage within a bounded part of the arched
window is displaced, preserving the architectural mullion. Light moves across
glass and floor surfaces. Sugar grains fall at several depths (92 desktop,
42 mobile). The photograph itself is not blurred or warped as a whole.

A small rabbit confection is positioned on a counter and occasionally tilts and
hops. Clicking or keyboard-activating it creates a sugar puff, an acknowledgement
and a soft two-note clink when Music is already enabled. It neither starts audio
automatically nor overrides motion preferences. On tablet it moves to the near
edge of the counter so the gallery rail does not conceal it.

The frame loop stops for inactive or paused scenes, skips hidden documents and
caps drawing near 30fps. Canvas pixel density is capped at 1.5. Resizing keeps
source coordinates aligned. System reduced motion disables ambient animation
and simplifies the gallery transition. The motion clock survives pause/resume.

## Navigation and audio

The existing 0.95-second perspective transition is retained. The Souk remains
at 816px beyond atrium travel, Pastry at 960px, with the new threshold at 888px.
A 120-unit native wheel gesture from The Souk enters the new gallery. All nine
destinations are accessible directly from the existing desktop rail/mobile menu.

An original procedural cafe waltz combines rounded keyboard tones, restrained
bass, soft brushes, ceramic-like chimes and occasional airy espresso-like noise.
These are synthesized impressions, not field recordings or acoustic instrument
samples. Audio stays opt-in through the shared Music control; other scores remain.

## Verification

- Supported production build passes.
- Desktop scene visually checked with title, legible ivory exhibition label,
  confectionery counter, rabbit and complete navigation.
- Phone 390×844 and tablet 820×844 checked in same-origin responsive frames;
  no horizontal overflow (client/scroll widths 375/375 and 805/805 respectively).
- Mobile menu exposes all nine destinations; selecting Pastry closes it.
- Rabbit click produced the accessible discovery message.
- Pastry audio was playing with a nonzero RMS signal (0.00999); this verifies
  generation, not acoustic quality on real speakers.
- Native phone motion control retained the Pastry destination and froze its
  clock at 10.85 across samples; resume was checked through the control.
- Short native scroll from The Souk selected Pastry.
- Reduced-motion styling was reviewed in code. Real-device performance and
  system setting checks remain hardware QA tasks.
- Temporary responsive harness was removed before publishing.
