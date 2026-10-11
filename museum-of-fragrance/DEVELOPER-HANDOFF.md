# Museum of Fragrance — developer handoff

This is the complete editable source for published version 19, exported 2 October 2026.
Source commit: 5647f7bcacb4e8003610de33c9423804674cdc95
Reference site: https://museum-of-fragrance.secretgalax.chatgpt.site

## Start here

Use Node.js 22.13.0 or newer and npm. The supplied package scripts use Bash/Linux tooling; WSL2 on Windows or Linux is the most direct match to the build environment.

Unzip, open the museum-of-fragrance folder in your editor, then run:

    npm ci
    npm run dev

Open the local URL printed by Vite. On Windows use the WSL terminal for these commands. For a direct cross-platform development command that avoids the shell environment assignment in package.json:

    npx vite

Build using the supplied Linux wrapper:

    npm run build

Or invoke the locally installed build tool directly when GNU timeout is unavailable:

    npx vinext build

The current visual frontend needs no API keys or database. Keep package-lock.json and the pinned stack while getting the first local run working. The included README.md describes the original starter; this handoff guide and docs/museum-living-revision.md describe the museum.

## Stack and source map

- React 19, TypeScript, Vinext, Vite 8; a Cloudflare Workers-oriented starter.
- app/page.tsx: frontend entry.
- app/museum-entrance.tsx: room order, native scroll thresholds, gallery navigation and controls.
- app/spatial-journey.ts: short, interruptible perspective transitions.
- app/depth-scene.tsx and app/depth-atmosphere.tsx: exterior and atrium photography, lights and atmosphere.
- app/*-gallery.tsx and matching CSS: individual galleries.
- app/living-museum.css: final presentation overrides, imported after individual gallery styles.
- app/museum-materials.ts: photograph-registered water masks and smoke configurations.
- app/living-materials.tsx: active-room WebGL material rendering with a Canvas fallback.
- app/room-response.tsx: local pointer/touch responses and accessible room actions.
- app/museum-audio.tsx: original procedural Web Audio music, room arrangements, environmental sound, crossfades and the sound button. Music is generated in the browser; there are no missing MP3 files.
- public/images/: all scene photographs, current/preserved variants and transparent assets.
- public/fonts/: local type assets, if present.
- docs/: gallery design/implementation notes and recorded verification limits.
- vite.config.ts, worker/, build/: existing runtime and deployment integration.

## Preserve these design decisions

- Photographic architecture stays steady and sharp. Animate water, smoke, particles, lights and individual foreground objects independently; avoid broad image sway or warping.
- Keep native scrolling and one-click room access. Avoid scroll locking or long animation runways.
- Preserve the approved Marines and Tobacco scene treatments.
- All motion must respect pause, reduced-motion preferences and background-tab visibility.
- Audio starts only after a user gesture. Each room has its own arrangement and fades into the next.
- Registration coordinates use a 1600 x 900 normalized plate in museum-materials.ts; some original gallery canvases use their own source-image dimensions. If a photo is reframed, update its masks, lighting coordinates and mobile crop together.

## Current scope

The exterior, atrium and ten fragrance galleries are implemented. This is an immersive frontend, not a product catalogue, checkout, inventory system or completed backend. The starter contains optional auth/database scaffolding; it is not used by the museum page.

The source is editable in any normal Git workflow. You can initialize a new private repository and push this export to your chosen Git host. Git history and repository credentials are deliberately not included.

## Hosting

The existing .openai/hosting.json identifies the original ChatGPT Site; it is not an access credential. It is included because the Vite configuration imports it. Do not delete it without updating that import. The archive does not grant deployment permissions to the original site.

For another host, adapt the Vinext/Cloudflare configuration to that host or port the frontend components/assets to your chosen React framework. This is not a static index.html bundle; use a compatible build/runtime. No hosting migration has been performed in this export.

## Verification and known limits

The exported commit passed the supported production build and targeted checks for transition direction/cleanup/reduced motion, bounded input response, and distinct nonempty score arrangements in all twelve destinations. The latest pastry recolour was visually inspected. The latest update did not receive a fresh live-browser walkthrough or an audio listening review; test desktop/mobile composition and listen to every score before another release.

A standalone TypeScript check currently reports pre-existing Cloudflare ambient-type gaps (cloudflare:workers, Fetcher and D1Database). Generate/configure the appropriate worker types for the deployment environment. The existing supported production build succeeds.

Dependencies, generated build output, caches and secrets are omitted. npm ci recreates dependencies; build commands recreate the output.
