import type { GameDefinition } from "../types.js";

export const terraria: GameDefinition = {
  identity: { id: "terraria", name: "Terraria" },
  query: {
    protocol: "gamedig",
    gamedigType: "terraria",
    defaultPort: 7777,
  },
  playerIdType: { account: "steam", field: "username" },
  statusFields: [
    { key: "players",   label: "Players", source: { type: "player-count" } },
    { key: "worldName", label: "World",   source: { type: "extra", path: "worldName" } },
  ],
  pod: {
    startup: "/start",
    dockerImages: {
      "Latest": "ryshe/terraria:latest",
    },
    defaultDockerImageKey: "Latest",
    variables: [
      {
        key: "worldPath", label: "World File Path",
        description: "Path to the world file inside the container",
        type: "text", envKey: "world",
        default: "/root/.local/share/Terraria/Worlds/world.wld",
        required: true, userEditable: true, userViewable: true, requiresRestart: true,
        rules: ["required", "string"],
      },
      {
        key: "serverPassword", label: "Server Password",
        description: "Leave blank for no password",
        type: "password", envKey: "password",
        required: false, userEditable: true, userViewable: true, requiresRestart: true,
        rules: ["string", "max:64"],
      },
      {
        key: "maxPlayers", label: "Max Players",
        type: "number", envKey: "maxplayers", default: "8",
        required: true, userEditable: true, userViewable: true, requiresRestart: true,
        rules: ["required", "integer", "min:1", "max:255"],
      },
      {
        key: "worldName", label: "World Name",
        description: "Name of a new world to generate (ignored if using an existing world file)",
        type: "text", envKey: "worldname",
        required: false, userEditable: true, userViewable: true, requiresRestart: true,
        rules: ["string", "max:64"],
      },
      {
        key: "difficulty", label: "World Difficulty",
        description: "Only applies when creating a new world",
        type: "select", envKey: "difficulty", default: "0",
        options: [
          { label: "Normal",  value: "0" },
          { label: "Expert",  value: "1" },
          { label: "Master",  value: "2" },
          { label: "Journey", value: "3" },
        ],
        required: true, userEditable: true, userViewable: true, requiresRestart: true,
        rules: ["required", "in:0,1,2,3"],
      },
    ],
    ports: [{ hostPort: 7777, containerPort: 7777, protocol: "tcp" }],
    volumes: [{ name: "data", containerPath: "/root/.local/share/Terraria/Worlds" }],
    resources: { defaultMemoryMb: 2048, defaultCpu: 1 },
  },
  admin: {
    whitelist: null,
    ban: {
      ban:   { type: "stdin-command", command: "ban {player}" },
      unban: null,
    },
    kick:      { kick: { type: "stdin-command", command: "kick {player}" } },
    broadcast: { send: { type: "stdin-command", command: "say {message}" } },
  },
};
