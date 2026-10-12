# Film galleries: the Souk and the Sultans

Both galleries share `app/film-gallery.tsx` and `app/film-gallery.css`; `souk-gallery.tsx` and `sultans-gallery.tsx` only supply a spec (frame folder, frame count, text, and the scroll ranges of the four text moments). The Souk is a pre-rendered frame sequence (96 WebP frames, ~4.4 MB, `public/souk-frames/001.webp` to `096.webp`)
drawn to a canvas and scrubbed by scroll. It runs from a bottle on stone, through its emblem and the amber liquid,
into the lantern-lit market and out to the desert arch.

- The Sultans film is 120 frames in `public/sultans-frames/` (ornate bottle and tea glass, crimson silk, palace hall, candlelit lounge).
- To add another film gallery: put numbered frames (`001.webp`...) in `public/<name>-frames/`, create a small wrapper with a `FilmSpec`, and keep the gallery class's position/transition rule in its own CSS file.
- Progress comes from `--room-progress` (set by `museum-entrance.tsx` across the room's 8-screen runway), eased with a light lerp.
- Frames load coarse-to-fine (every 8th, then 4th, 2nd, rest) with six parallel requests, and are cached at module level.
- Four text moments (title, "A world within.", the note list, "Step into the market.") fade in and out at fixed fractions of progress.
- To replace the film, export new frames at the same count (or change `FRAME_COUNT`) and overwrite `public/souk-frames/`.
- The old photograph, silk, sand and bakhoor layers and the "Stir the desert air" control were removed.

# Room entrance (all other galleries)

`app/room-portal.tsx` gives each of the other nine galleries a three.js bottle entrance with its own liquid colours, label,
light and floating ingredient (sea-salt crystals, petals, oud shards, cedar shards, amber resin, saffron, sugar crystals,
glass crystals, citrus slices, tobacco leaves). The dive runs over the first ~11% of each room's scroll. Controls: drag to spin,
tilt, auto-spin, glow, reset, and gyro on phones. Styles in `app/room-portal.css`. Only the active room mounts a WebGL context.
