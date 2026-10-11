# Living photographic opening

The opening uses generated photorealistic imagery, not photographs of an actual
museum. The established scroll distance and approach easing remain; separate
depth projections and a doorway camera projection extend the scroll controller.
The opening is now extended by The Marines, The Gardens, The Sultans, the
Cedar Room, Amber Lounge, The Souk, The Pastry Room, The Liquors and The Riviera; see `marines-gallery.md`, `gardens-gallery.md`,
`sultans-gallery.md`, `cedar-gallery.md`, `amber-lounge.md`, `souk-gallery.md`, `pastry-gallery.md`, `liquors-gallery.md` and `riviera-gallery.md`.

## Rendering

`depth-scene.tsx` separates the clean landscape, sky, museum silhouette, ground,
entrance detail and transparent foreground branches. Their camera projections
produce different travel speeds. A closer, independently detailed entrance
plate replaces the enlarged wide view before the visitor passes through the
door. The rectangular opening follows the expanding doorway, replacing the
previous full-scene double exposure. The lobby keeps rigid architectural edges.

Native image elements preserve source texture resolution. There is no full-screen
WebGL rasterization, video, frame sequence, new dependency or runtime image API.
The seven runtime image assets total 986,456 bytes (about 0.99 MB);
duplicate layer references share the same browser requests/cache. The original
photographic plates are 1672×941; the additional entrance detail is also
1672×941, and the transparent branch is 1536×1024. These are not native 4K
assets, and arbitrary zoom cannot preserve unlimited detail. The separate
entrance view improves detail where it matters during the approach.

## Motion

- Continuous wind bends foreground branches in CSS 3D and displaces localized
  photographic grass patches. Sky drift stops before the mountain silhouette.
- Exterior bulbs have a registered blackout core, emission and spill. Irregular
  independent cycles switch the light off and relight it; glow alone is no
  longer the only change. Entrance lettering also dims and relights.
- `depth-atmosphere.tsx` draws only fog and dust on a transparent Canvas 2D
  surface. A small procedural density field is cached at startup. Photographic
  leaves traverse 3D trajectories and tumble independently of scrolling.
- Exterior finishes now use separately edited wide and entrance images with
  satin zinc roofs, honed stone piers and more orderly paving. Framing and
  lighting registration remain compatible with the existing camera system.
  Film grain is reduced to keep these surfaces clean.
- Eight leaves and two ivory petals drift outside (six sprites on mobile).
  All foliage fades out at the entrance; no interior foliage is rendered.
- The atrium has a separate pool of 72 fine dust motes (40 on mobile), moving
  with slow convection and catching warm light. Central text stays clear.
- Six ceiling lights and three exhibit washes vary independently every few
  seconds. Soft 0.75–0.9 second ramps and a 0.5 intensity floor prevent sharp
  flashing or blackouts. A translucent warm core dims the photographed bulb
  itself, so movement is not limited to a faint glow overlay. Display glass
  and floor reflections respond to light intensity and drift independently.
- Rear and side window cloud textures drift within feathered masks that exclude
  the architecture, trees and mountain edges. They reuse the existing lobby
  image, with no new image download, video or dependency.
- Animation clocks use elapsed time, pause when hidden or disabled, and retain
  their position on pause/resume. Mobile reduces fog and foreground leaf count.
  System reduced-motion preferences suppress ambient motion and simplify travel.

## Verification

- Production build passes; all seven runtime image assets resolve.
- Desktop arrival, approach, entrance detail, doorway and lobby inspected.
- Phone (390×844) and tablet (820×844) tested in same-origin frames. No horizontal
  document overflow; phone welcome copy and controls remain visible.
- Observed exterior lamp intensities reach 0.025 (off), then return above 0.88
  (on) while idle. Branch and flying-leaf transforms change without scrolling.
- Pause held the environmental clock at exactly the same value across samples.
- Refined revision: checked desktop arrival, approach, doorway and atrium;
  checked 390×844 phone and 820×844 tablet layouts with no horizontal overflow.
  The pause clock remained 42.91 across samples, then resumed.
- Atrium revision: full-scroll screenshot confirms no floating foliage; all ten
  exterior sprites have zero opacity. Window-cloud translation changed from
  8.09px to 11.71px while idle. Nine independent indoor light values verified.
- Visibility correction: deployment of the previous revision was confirmed, but
  its motion had insufficient visual contrast. Window drift now reaches 1.53
  pixels/second at the center of its cycle (previous maximum 0.324). Indoor
  dust is brighter, moves faster, and includes a few nearer motes up to 3.05px
  radius. Glass highlights and floor reflections now visibly travel rather
  than only changing opacity. Desktop screenshots and computed transforms
  confirm motion, with no foliage visible indoors. The camera is unchanged.
- No application errors observed; browser-extension metadata errors are unrelated.
- The previous standalone TypeScript check reported missing Cloudflare runtime
  declarations outside the museum code. The supported production build passes.
- Real hardware frame-rate, memory and system reduced-motion testing remain
  deployment QA tasks; the cloud preview does not establish those measurements.

Original images are retained for recovery. Temporary responsive-test UI and the
previous photographic-motion implementation are removed from the shipping code.

## Refined asset provenance

Built-in ImageGen edited the original wide and close entrance targets separately.
Prompt constraints preserved camera, framing, silhouette, window, door and lamp
positions, mountains and sky; changed finishes to clean satin zinc, honed pale
limestone and neatly jointed grey paving; retained natural texture and blank
signs. A separate prompt generated one translucent curled ivory botanical petal
with faint veins on genuine transparent alpha. Selected outputs are installed as
`public/images/museum-exterior-refined.webp`,
`public/images/museum-entrance-refined.webp`, and
`public/images/ivory-petal.webp`. WebP conversion only; petal is trimmed and
downsampled to 128×115. No video or additional runtime library was added.
