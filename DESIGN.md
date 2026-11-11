# Pulse public discovery

Reference: Party & Event Invitation App, Victoria Grinevich, Dribbble 26517512. Light discovery, violet accent, image-led event cards and mobile shortcuts. Adapted to the actual Pulse inventory; no invented attendance, avatars, reviews or prices.

Direction: playful. Canvas #FCFBFE, ink #24212D, accent #7750DB, lilac #F0EAFA. 20px card radius. Trebuchet MS display and Segoe UI body use installed fonts. Existing icon family retained to keep product consistency. Primary signature: scroll-linked layered photo tickets, scoped GSAP context, reverted on unmount, disabled with reduced motion. No operating-screen animations or changes.

Data: reuse usePublicEvents; filter private events and distinguish upcoming and past based on end/start time. Saved events are device-local. Source metrics remain public-track-record snapshot. No backend writes from discovery. Images: use registered assets or official event artwork; text artwork when no media exists, never substitute stock photos presented as real event photography.
