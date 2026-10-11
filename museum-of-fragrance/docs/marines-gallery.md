# The Marines

This documents the first gallery release. The Gardens revision extends its
navigation runway and replaces the original ambient-only audio control; see
`gardens-gallery.md` for the current travel and music behavior.

The first fragrance gallery extends the existing photographic opening. The
arrival and atrium camera progression is preserved. An additional 96 px of
native scroll follows the atrium; crossing its threshold triggers a 0.95 second
perspective transition. Reverse scrolling returns to the atrium. No wheel or
touch gesture is intercepted. Persistent navigation also jumps directly to
Arrival, The atrium or The Marines. Future destinations can extend this registry.

## Visuals and motion

- Photorealistic cobalt sea and pale stone museum architecture form the native
  image foundation. The scene does not enlarge the photograph during idle motion.
- A WebGL shader displaces only the water, with restrained moving highlights.
  The architecture remains crisp. A Canvas 2D photographic-strip fallback keeps
  the sea moving when WebGL is unavailable or its context is lost.
- Two independent transparent wave layers and procedural spray give foreground
  depth. The captain enters and fades during a brief interval every 34 seconds.
- Mobile uses fewer spray particles, one foreground wave, a smaller cameo and a
  crop that preserves the museum architecture. Both water renderers use exactly
  the same crop as the underlying image.
- The existing user-activated sound control now blends in synthesized ocean
  noise and a slow swell in this gallery. No audio or video download is required.
- Environmental clocks pause when the scene is inactive, the tab is hidden, or
  motion is paused. System reduced motion presents the still photograph, retains
  direct navigation and replaces spatial travel with a short fade.

## Assets

Built-in ImageGen created a sunny Mediterranean marine museum with monumental
but plausible pale stone arches, an isolated transparent turquoise wave, and an
eccentric fashion-campaign captain in a navy coat, ivory trousers and red scarf.
These are generated photorealistic images, not photographs of a real museum.
The selected outputs were converted to WebP with no image-generation runtime.

The three assets total 461,664 bytes, bringing all active museum image assets to
1,448,120 bytes. The marine backdrop is 1672 × 941. It is not a native 4K image.
No video, frame sequence, new dependency, product backend or later gallery was
added. Components are separated into gallery presentation and water rendering.

## Verification

- Production build passed after implementation and final responsive corrections.
- Desktop composition, direct destination buttons, one 120 px forward scroll
  from the atrium and reverse travel were checked in the browser preview.
- Phone (390 × 844 frame) and tablet (820 × 844 frame) have no horizontal document
  overflow. All marine images load. Mobile cameo was reduced and moved below
  the description after visual inspection; the photographic crop was corrected.
- Sound enabled and disabled successfully through its accessible control.
- Motion pause held gallery time at 32.19 and fallback water time at 9.06 across
  separate samples. Both resume through the existing motion control.
- The preview browser lacks WebGL, so the Canvas 2D water fallback was directly
  exercised. WebGL shader rendering, real-device frame rates and audio timbre
  still require hardware QA. Reduced motion is implemented but was not emulated
  in this browser. No performance benchmark is implied by the visual checks.
- Temporary responsive preview harness removed from shipping source.
