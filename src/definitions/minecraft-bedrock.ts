import type { GameDefinition } from "../types";
import { DIFFICULTY_OPTIONS } from "../constants";

export const minecraftBedrock: GameDefinition = {
  identity: { id: "minecraft-bedrock", name: "Minecraft Bedrock" },
  query: {
    protocol: "gamedig",
    gamedigType: "minecraftbe",
    defaultPort: 19132,
  },
  playerIdType: { account: "minecraft-bedrock", field: "xuid" },
  statusFields: [
    { key: "players", label: "Players", source: { type: "player-count" } },
    { key: "motd",    label: "MOTD",    source: { type: "motd" } },
    { key: "version", label: "Version", source: { type: "version" } },
  ],
  pod: {
    startup: "/start",
    dockerImages: {
      "Latest": "itzg/minecraft-bedrock-server:latest",
    },
    defaultDockerImageKey: "Latest",
    variables: [
      {
        key: "eula", label: "Accept Minecraft EULA",
        description: "You must accept the Minecraft EULA to run the server.",
        type: "checkbox", envKey: "EULA",
        default: "FALSE", trueValue: "TRUE", falseValue: "FALSE",
        required: true, userEditable: true, userViewable: true, requiresRestart: true,
        rules: ["required", "in:TRUE,FALSE"],
      },
      {
        key: "serverName", label: "Server Name",
        description: "Shown in the server list",
        type: "text", envKey: "SERVER_NAME", default: "Bedrock Server",
        required: true, userEditable: true, userViewable: true, requiresRestart: true,
        rules: ["required", "string", "max:64"],
      },
      {
        key: "gamemode", label: "Default Game Mode",
        type: "select", envKey: "GAMEMODE", default: "survival",
        options: [
          { label: "Survival",  value: "survival" },
          { label: "Creative",  value: "creative" },
          { label: "Adventure", value: "adventure" },
        ],
        required: true, userEditable: true, userViewable: true, requiresRestart: true,
        rules: ["required", "in:survival,creative,adventure"],
      },
      {
        key: "difficulty", label: "Difficulty",
        type: "select", envKey: "DIFFICULTY", default: "normal", options: DIFFICULTY_OPTIONS,
        required: true, userEditable: true, userViewable: true, requiresRestart: true,
        rules: ["required", "in:peaceful,easy,normal,hard"],
      },
      {
        key: "serverPort", label: "Server Port",
        type: "number", envKey: "SERVER_PORT", default: "19132",
        required: true, userEditable: true, userViewable: true, requiresRestart: true,
        rules: ["required", "integer", "min:1", "max:65535"],
      },
    ],
    ports: [{ hostPort: 19132, containerPort: 19132, protocol: "udp" }],
    volumes: [{ name: "data", containerPath: "/data" }],
    resources: { defaultMemoryMb: 2048, defaultCpu: 2 },
  },
  admin: {
    whitelist: {
      add:    { type: "stdin-command", command: "whitelist add {player}" },
      remove: { type: "stdin-command", command: "whitelist remove {player}" },
    },
    ban: {
      ban:   { type: "stdin-command", command: "kick {player} Banned" },
      unban: null,
    },
    kick:      { kick: { type: "stdin-command", command: "kick {player}" } },
    broadcast: { send: { type: "stdin-command", command: "say {message}" } },
  },
};
