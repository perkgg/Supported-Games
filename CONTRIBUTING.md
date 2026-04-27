# Contributing to @workspace/games

Thanks for wanting to add a game. The design goal is zero-boilerplate contribution: adding a new game touches exactly one new file and one line in the registry.

## Adding a game

### 1. Create the definition file

Create `src/definitions/<your-game-id>.ts`. Use an existing definition as a reference — `minecraft-java.ts` is the most complete example, `custom.ts` is the minimal baseline.

```ts
// src/definitions/mygame.ts
import type { GameDefinition } from "../types.js";

export const myGame: GameDefinition = {
  identity: {
    id: "mygame",        // stable slug — never change after shipping
    name: "My Game",     // display name shown in the UI
  },
  query: {
    protocol: "gamedig",
    gamedigType: "mygame",   // gamedig type ID for this game
    defaultPort: 12345,
  },
  playerIdType: { account: "steam", field: "id" },  // see "Player ID type" below
  statusFields: [
    { key: "players", label: "Players", source: { type: "player-count" } },
  ],
  pod: {
    startup: "./start.sh",
    dockerImages: {
      "Latest": "example/mygame-server:latest",
    },
    defaultDockerImageKey: "Latest",
    variables: [
      // Optional — only add variables the game's Docker image actually supports
    ],
    ports: [{ hostPort: 12345, containerPort: 12345, protocol: "udp" }],
    volumes: [{ name: "data", containerPath: "/data" }],
    resources: { defaultMemoryMb: 2048, defaultCpu: 2 },
  },
  admin: null,  // or fill in ban/kick/whitelist/broadcast if supported
};
```

### 2. Register it

Open `src/registry.ts`. Import your definition and chain one `.register()` call:

```ts
import { myGame } from "./definitions/mygame";

games
  // ... existing entries ...
  .register(myGame);
```

That's it. The game now appears in all dropdowns, has its status polled via the declared protocol, and exposes pod defaults and admin actions to the platform.

### 3. Verify

```bash
bun run typecheck
```

No test runner required — TypeScript catches shape mismatches.

---

## Choosing a query protocol

Pick the protocol that matches how the game server exposes status:

| Protocol | When to use |
|----------|-------------|
| `gamedig` | Any game supported by the gamedig library (most Steam games, Minecraft, etc.) |
| `none` | Agent or plugin pushes status directly; or game has no query support |

Find the gamedig type ID at [github.com/gamedig/node-gamedig](https://github.com/gamedig/node-gamedig/blob/master/GAMES_LIST.md). Set it as `gamedigType`. Most Steam games use the **query port** (often game port + 1).

---

## Player ID type

`playerIdType` tells the platform which account system and which field within it to use when passing `{player}` to admin commands or displaying player identities.

| Account | Fields | When to use |
|---------|--------|-------------|
| `minecraft-java` | `uuid`, `username` | Minecraft Java Edition servers |
| `minecraft-bedrock` | `xuid`, `uuid`, `username` | Minecraft Bedrock / Xbox platform servers |
| `steam` | `id`, `username` | Steam games (Valheim, Rust, Palworld, 7DTD, Satisfactory, …) |

Set `playerIdType: null` when the game has no player identity concept (e.g. `custom`).

```ts
playerIdType: { account: "steam", field: "id" }
playerIdType: { account: "minecraft-java", field: "uuid" }
playerIdType: { account: "minecraft-bedrock", field: "xuid" }
```

---

## Pod variables

`pod.variables` renders as a settings form in the server manager. Use it for Docker env vars that admins commonly change.

```ts
variables: [
  {
    key: "maxPlayers",         // unique form key
    label: "Max Players",
    type: "number",
    default: "16",
    envKey: "MAX_PLAYERS",     // Docker env var name
    required: true,
    userEditable: true,
    userViewable: true,
    requiresRestart: true,     // set false only if the image applies the var live
    rules: ["required", "integer", "min:1", "max:100"],
  },
]
```

**Checkbox fields** require `trueValue` and `falseValue`:

```ts
{
  key: "pvp",
  label: "PVP",
  type: "checkbox",
  default: "true",
  trueValue: "true",
  falseValue: "false",
  envKey: "PVP",
  required: true,
  userEditable: true,
  userViewable: true,
  requiresRestart: false,
  rules: ["required", "in:true,false"],
}
```

**`rules`** are Laravel-style validation strings applied on the API. Common rules: `"required"`, `"string"`, `"integer"`, `"min:N"`, `"max:N"`, `"in:a,b,c"`, `"regex:/pattern/"`.

**`userEditable` / `userViewable`**: set `userEditable: false` for variables that should be read-only in the UI (e.g. internal JVM flags). Set both to `false` for hidden system variables.

**Shared option sets** — import from `constants.ts` rather than duplicating:

```ts
import { DIFFICULTY_OPTIONS } from "../constants.js";

{ key: "difficulty", type: "select", options: DIFFICULTY_OPTIONS, envKey: "DIFFICULTY", rules: ["required", "in:peaceful,easy,normal,hard"] }
```

Add new shared constants to `src/constants.ts` when the same options appear in two or more definitions.

---

## Admin actions

Fill in `admin` if the game supports any of: ban, kick, whitelist, broadcast. Set unsupported actions to `null` rather than omitting the whole object when the game supports a subset:

```ts
admin: {
  whitelist: {
    add:    { type: "stdin-command", command: "whitelist add {player}" },
    remove: { type: "stdin-command", command: "whitelist remove {player}" },
  },
  ban: {
    ban:   { type: "stdin-command", command: "ban {player}" },
    unban: { type: "stdin-command", command: "pardon {player}" },
  },
  kick:      { kick: { type: "stdin-command", command: "kick {player}" } },
  broadcast: { send: { type: "stdin-command", command: "say {message}" } },
},
```

Set `admin: null` when the game exposes no admin interface at all.

Available `AdminMethod` types:
- `stdin-command` — write a line to the container's stdin
- `file-mutation` — append/remove a line from a file inside the container (e.g. Valheim's `bannedlist.txt`)
- `rcon-command` — send via TCP RCON

Interpolation tokens: `{player}`, `{message}`.

If `unban` is not supported by the game, set it to `null`:
```ts
ban: {
  ban:   { type: "stdin-command", command: "ban {player}" },
  unban: null,
}
```

---

## Status fields

Status fields tell the UI what to display on the server card. Declare only what the game actually provides:

```ts
statusFields: [
  { key: "players",   label: "Players", source: { type: "player-count" } },
  { key: "motd",      label: "MOTD",    source: { type: "motd" } },
  // Game plugin can push extra data via the ADVANCED endpoint:
  { key: "worldName", label: "World",   source: { type: "extra", path: "worldName" } },
],
```

Fields render in declaration order. The `key` must be unique within the definition.

---

## Pod config

`pod` can be `null` for games without managed Docker support (e.g. the `custom` fallback).

When filling it in:
- `startup` — shell command run at container start; use `${ENV_VAR}` tokens for interpolation
- `dockerImages` — map of human-readable labels to full image refs; use multiple entries for version variants
- `defaultDockerImageKey` — must match one of the keys in `dockerImages`
- `variables` — see [Pod variables](#pod-variables) above
- List all ports the server binds, including query/RCON ports
- Set `resources.defaultMemoryMb` and `resources.defaultCpu` conservatively — users can raise them
- `install` — optional one-shot setup container run before first start (provide `image`, `entrypoint`, `script`)

---

## Stable IDs

The `identity.id` slug is stored in the database and must never change after a game ships. If a game is renamed, change `identity.name` only. Add a note in the PR if you're unsure.

---

## What not to add

- **Query logic** — if the game is supported by gamedig, no new code needed. Only add query code if the game requires a genuinely new protocol not covered by gamedig.
- **Game-specific business logic** — this package is pure data. Validation, Docker orchestration, and admin execution live in the platform that consumes the registry.
- **Optional fields as required** — only set `required: true` if the server refuses to start without the field (e.g. Minecraft EULA).
