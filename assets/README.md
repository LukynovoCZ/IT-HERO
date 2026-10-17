# IT HERO pixel art

Local generated artwork based on the approved visual concept. Reference photographs are not shipped with the game. No network requests are needed to load these assets.

- `characters.png`: transparent atlas, 1448 × 1086. Row 1: hero idle, walk, crouch, throw. Row 2: slim blonde secretary idle, scream, union idle, whistle. Row 3: manager idle, two stomp poses, secretary walk. The current game uses the poses selected in `makeTextures()`.
- `office.png`: 1942 × 809 office illustration. The game selects the lower floor with source rectangle `(0, 382, 1942, 355)` and repeats it for all nine playable floors. Doors, elevators, furniture collisions and signs are game objects.
- `exterior.png`: 1024 × 1536 title-screen building illustration.

Source rectangles in `game.js` isolate character poses and render them onto 64 × 80 textures with a shared baseline and preserved aspect ratio. Update those rectangles when replacing the atlas. Character body sizes and crouch offsets must stay consistent with the new textures. Nearest-neighbor rendering is enabled throughout.

- `support.png`: transparent 1536 × 1024 atlas of old IT helper (standing, crouching, offering) and blue-haired specialist (idle, flag swing, spray). Poses are normalized to 136 × 80 textures with a shared body anchor; source coordinates live in `supportPoses` in `game.js`. Food and projectile textures are generated in the game.

- `floors.png`: three stacked detailed room backdrops (openspace, individual offices, meeting corridor). `drawRoomBackdrop` splits each row into architecture and rear-furniture bands, scales rear furniture down, and adds floor-specific reception/meeting/archive/executive details. These are render-time frames; the original source illustration remains intact.
