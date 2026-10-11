# The Sultans

The third fragrance gallery is an imagined contemporary Ottoman-Persian palace
loggia overlooking an Istanbul-inspired skyline. Amber lanterns, carved stone,
brass, a ruby Persian carpet and a glass shield-and-sword display frame a cool
waterfront at sunset. The collection is presented as sandalwood, amber, resins
and oud: rich fragrances with lasting presence.

## Motion and sound

- Three photographic hanging lanterns sway and change brightness independently.
  Four registered light cores also modulate the lamps in the main photograph.
  Warm intensity floors prevent harsh flashing or blackouts.
- A narrow clipped region of photographed water ripples independently; skyline,
  boats, stone and carpet remain still. The left textile edge sways through a
  feathered mask. Warm surface reflections drift in brightness.
- Fine golden dust and restrained incense convection give the foreground depth.
  There are no indoor leaves. A burgundy-clad editorial nobleman appears between
  seconds 6 and 21 of a 46-second cycle. Mobile uses fewer particles and a smaller
  cameo to keep copy readable.
- The existing opt-in music control gains a warmer low-register score, plucked
  accents and a sparse bass pulse. This is an original synthesized atmosphere,
  not a recording or a claim of historically authentic Ottoman/Persian music.
- Paused, inactive and hidden scenes stop their clocks. System reduced motion
  removes ambient animation and uses a brief fade in place of spatial travel.

## Navigation

The original opening camera remains intact. The three gallery anchors are now
96, 240 and 384 px past the atrium, with thresholds at 20, 192 and 312 px. Short
native scrolls trigger full 0.95-second perspective transitions. No wheel or
touch interception is added. Desktop keeps the persistent destination rail;
mobile now uses a persistent Galleries button opening five readable choices.
Selecting a destination or pressing Escape closes the mobile chooser and returns
focus to its button. The Gardens has a next-gallery link to The Sultans.

The stage uses `overflow: clip` to prevent transformed offscreen scenery from
creating an inner scroll area. This fixes the tablet framing issue found during
QA, where control focus shifted the contents upward and exposed empty space.

## Asset provenance

Built-in ImageGen generated three assets once each: a palace waterfront at dusk,
a transparent brass lantern, and a transparent contemporary nobleman with a
sheathed ceremonial sword. These are generated photorealistic assets; the palace
is not an identified real location and the skyline is not a geographic survey.

- `sultans-gallery.webp`: 1672 × 941; 416,820 bytes.
- `sultan-lantern.webp`: 280 × 821 RGBA; 45,124 bytes. Side margins cropped from
  the generated asset while preserving the chain and complete lantern.
- `sultan-nobleman.webp`: 700 × 1050 RGBA; 93,952 bytes.

The new assets total 555,896 bytes. No video, audio download, new dependency,
product backend or later gallery was added. Native image detail remains bounded
by source resolution; the backdrop is not a native 4K photograph.

## Verification

- Desktop, 390 × 844 phone and 820 × 844 tablet layouts inspected. All new image
  assets load; phone/tablet document width equals viewport width without overflow.
- One 120 px scroll from Gardens reaches Sultans; reverse travel returns to
  Gardens. Direct destination buttons, mobile chooser and Escape were exercised.
- Pause held the scene clock at 38.26 and a lamp at intensity 0.712 / swing
  0.256 degrees across separate samples. Resuming restored motion.
- The music engine selected the Sultans score while remaining enabled, with
  measured analyser RMS 0.02074 confirming generated audio output.
- No application errors observed; browser-extension metadata errors are unrelated.
- Fixed the viewport inner-scroll issue, verified scrollTop resets to zero and
  full tablet framing returns. Temporary responsive harness removed from source.
- Reduced motion and actual loudspeaker timbre / hardware performance remain
  device QA tasks; preview checks do not establish those measurements.
