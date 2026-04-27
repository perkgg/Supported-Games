import type { GameDefinition } from "../types.js";

export const rust: GameDefinition = {
  identity: { id: "rust", name: "Rust" },
  query: {
    protocol: "gamedig",
    gamedigType: "rust",
    defaultPort: 28016, // query port; game port is 28015
  },
  playerIdType: { account: "steam", field: "id" },
  statusFields: [
    { key: "players",   label: "Players",    source: { type: "player-count" } },
    { key: "worldSize", label: "World Size", source: { type: "extra", path: "worldSize" } },
    { key: "worldSeed", label: "Seed",       source: { type: "extra", path: "worldSeed" } },
  ],
  pod: {
    startup: "/start",
    dockerImages: {
      "Latest":  "didstopia/rust-server:latest",
      "Staging": "didstopia/rust-server:staging",
    },
    defaultDockerImageKey: "Latest",
    variables: [
      {
        key: "startupArgs", label: "Startup Arguments",
        description: "Full server startup arguments passed to the Rust process",
        type: "textarea", envKey: "RUST_SERVER_STARTUP_ARGUMENTS",
        default: "-batchmode -load -logfile /rust/logs/rust.log +server.port 28015 +server.queryport 28016 +rcon.port 28017 +server.maxplayers 50",
        required: true, userEditable: true, userViewable: true, requiresRestart: true,
        rules: ["required", "string"],
      },
      {
        key: "updateBranch", label: "Update Branch",
        type: "select", envKey: "RUST_SERVER_UPDATE_BRANCH", default: "public",
        options: [
          { label: "Public (stable)", value: "public" },
          { label: "Staging",         value: "staging" },
        ],
        required: true, userEditable: true, userViewable: true, requiresRestart: true,
        rules: ["required", "in:public,staging"],
      },
      {
        key: "updateChecking", label: "Auto-update Checking",
        type: "checkbox", envKey: "RUST_SERVER_UPDATE_CHECKING",
        default: "0", trueValue: "1", falseValue: "0",
        required: true, userEditable: false, userViewable: true, requiresRestart: true,
        rules: ["required", "in:0,1"],
      },
    ],
    ports: [
      { hostPort: 28015, containerPort: 28015, protocol: "udp" },
      { hostPort: 28016, containerPort: 28016, protocol: "udp" },
    ],
    volumes: [{ name: "data", containerPath: "/rust" }],
    resources: { defaultMemoryMb: 6144, defaultCpu: 4 },
  },
  admin: {
    whitelist: null,
    ban: {
      ban:   { type: "stdin-command", command: "ban {player}" },
      unban: { type: "stdin-command", command: "unban {player}" },
    },
    kick:      { kick: { type: "stdin-command", command: "kick {player}" } },
    broadcast: { send: { type: "stdin-command", command: "say {message}" } },
  },
};
