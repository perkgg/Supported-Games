# @workspace/games

A TypeScript registry of game server definitions, query protocols, pod configs, status fields, pod variable descriptors, and admin action descriptors for self-hosted game servers.

Used by [Perk](https://perk.gg) to drive server provisioning, status polling, and the settings UI. Designed so that adding a new game requires touching exactly one file.

## What's in the box

| Export | Import path | Environment |
|--------|-------------|-------------|
| `games` registry + all types + constants | `@workspace/games` | Universal (browser-safe) |
| `queryServer` | `@workspace/games/query` | Node.js only |

### `games` registry

```ts
import { games } from "@workspace/games";

// List all registered games
games.list();          // GameDefinition[]
games.listIds();       // string[]

// Look up by stable ID
games.get("minecraft-java");         // GameDefinition | undefined
games.getOrThrow("rust");            // GameDefinition (throws on unknown)
```

### `queryServer`

Queries a live game server and returns a normalised `QueryResult`. Dispatches to the right protocol based on the game's declared `query.protocol`.

```ts
import { queryServer } from "@workspace/games/query";

const result = await queryServer("minecraft-java", "mc.example.com", 25565);
// { online: true, currentPlayers: 4, maxPlayers: 20, motd: "Welcome!", icon: "data:image/png;base64,..." }

const result = await queryServer("rust", "rust.example.com", 28016);
// { online: true, currentPlayers: 12, maxPlayers: 50 }
```

## Supported games

| ID | Name | Query Protocol |
|----|------|---------------|
| `minecraft-java` | Minecraft Java | gamedig (`minecraft`) |
| `minecraft-bedrock` | Minecraft Bedrock | gamedig (`minecraftbe`) |
| `valheim` | Valheim | gamedig (`valheim`) |
| `rust` | Rust | gamedig (`rust`) |
| `palworld` | Palworld | gamedig (`palworld`) |
| `7dtd` | 7 Days to Die | gamedig (`7d2d`) |
| `terraria` | Terraria | gamedig (`terraria`) |
| `satisfactory` | Satisfactory | gamedig (`satisfactory`) |
| `custom` | Custom | none |

## Game definition shape

Each `GameDefinition` has five sections:

```ts
interface GameDefinition {
  identity: {
    id: string;    // stable slug: "minecraft-java"
    name: string;  // display name: "Minecraft Java"
  };
  query: {
    protocol: "gamedig" | "none";
    gamedigType?: string;  // required when protocol === "gamedig"
    defaultPort: number;
  };
  // Which account system and field identifies players in admin commands / player list.
  // null = not applicable (e.g. custom game with no admin support).
  playerIdType:
    | { account: "minecraft-java";    field: "uuid" | "username" }
    | { account: "minecraft-bedrock"; field: "xuid" | "uuid" | "username" }
    | { account: "steam";             field: "id" | "username" }
    | null;
  statusFields: StatusField[];  // what to render on the server card
  pod: Pod | null;              // managed server template (null = not supported)
  admin: AdminConfig | null;    // ban/kick/whitelist/broadcast methods
}
```

### `statusFields`

Drives what the UI renders in the server card. Fields are rendered in declaration order. Each field has a `source` that tells the UI where the value comes from:

| Source type | Description |
|-------------|-------------|
| `motd` | Message of the day string |
| `player-count` | Rendered as "12 / 20" |
| `player-list` | Array of `{ name, uuid? }` |
| `version` | Server software version string |
| `server-icon` | Base64 favicon image |
| `game-mode` | Current game mode string |
| `extra` | Dot-path into free-form JSON pushed by the game plugin (`path: "worldName"`) |

### `pod`

Pterodactyl-style pod template used for managed server provisioning. `null` means no managed Docker support.

```ts
interface Pod {
  startup: string;                         // shell command, ${VAR} tokens replaced at runtime
  dockerImages: Record<string, string>;    // label → full image ref
  defaultDockerImageKey: string;           // key from dockerImages
  variables: PodVariable[];               // env-var settings form
  ports: PortBinding[];
  volumes: VolumeMount[];
  resources: {
    defaultMemoryMb: number;
    defaultCpu: number;
  };
  install?: PodInstallScript;             // optional one-shot setup container
}
```

#### `pod.variables`

Rendered as a settings form in the server manager. Every variable maps directly to a Docker env var (`envKey`). Rendered in declaration order.

```ts
{
  key: "difficulty",
  label: "Difficulty",
  type: "select",
  default: "easy",
  options: DIFFICULTY_OPTIONS,
  envKey: "DIFFICULTY",
  required: true,
  userEditable: true,
  userViewable: true,
  requiresRestart: false,
  rules: ["required", "in:peaceful,easy,normal,hard"],
}
```

Field types: `text`, `password`, `number`, `select`, `checkbox`, `textarea`.

For `checkbox` fields, `trueValue` and `falseValue` are required:

```ts
{
  key: "eula",
  label: "Accept EULA",
  type: "checkbox",
  default: "FALSE",
  trueValue: "TRUE",
  falseValue: "FALSE",
  envKey: "EULA",
  required: true,
  userEditable: true,
  userViewable: true,
  requiresRestart: true,
  rules: ["required", "in:TRUE,FALSE"],
}
```

`rules` are Laravel-style validation strings applied on the API: `["required", "string", "max:255", "in:a,b"]`.

Shared option sets (e.g. `DIFFICULTY_OPTIONS`) are exported from the main package for reuse:

```ts
import { DIFFICULTY_OPTIONS } from "@workspace/games";
```

### `admin`

Describes how to execute ban/kick/whitelist/broadcast actions. The executor (your agent or API) switches on `AdminMethod.type`. Set an action to `null` when the game doesn't support it:

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
}
```

Set `admin: null` when the game has no admin interface at all.

| Method type | Description |
|-------------|-------------|
| `stdin-command` | Write command to the container's stdin |
| `file-mutation` | Append/remove a line in a file inside the container |
| `rcon-command` | Send via TCP RCON |

Interpolation tokens: `{player}`, `{message}`.

## Query protocols

| Protocol | Transport | Used by |
|----------|-----------|---------|
| `gamedig` | Varies (UDP/TCP per game) | Most games — wraps the gamedig library |
| `none` | — | Servers that push status directly; or games with no query support |

`gamedigType` must match a gamedig game type ID (e.g. `"minecraft"`, `"valheim"`, `"rust"`).

## Installation

```bash
# npm
npm install @workspace/games

# bun
bun add @workspace/games
```

Requires Node 18+ for the `@workspace/games/query` sub-export (uses `net` and `gamedig`).
The main `@workspace/games` export is browser-safe.

## TypeScript

The package ships TypeScript source directly (no build step). Configure your bundler or `tsconfig.json` to resolve the `exports` map.

```json
{
  "compilerOptions": {
    "moduleResolution": "Bundler"
  }
}
```
