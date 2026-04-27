import type { GameDefinition } from "../types.js";

export const palworld: GameDefinition = {
  identity: { id: "palworld", name: "Palworld" },
  query: {
    protocol: "gamedig",
    gamedigType: "palworld",
    defaultPort: 27015,
  },
  playerIdType: { account: "steam", field: "id" },
  statusFields: [
    { key: "players", label: "Players", source: { type: "player-count" } },
  ],
  pod: {
    startup: "/home/steam/server/start.sh",
    dockerImages: {
      "Latest": "thijsvanloef/palworld-server-docker:latest",
    },
    defaultDockerImageKey: "Latest",
    variables: [
      {
        key: "maxPlayers", label: "Max Players",
        type: "number", envKey: "PLAYERS", default: "16",
        required: true, userEditable: true, userViewable: true, requiresRestart: true,
        rules: ["required", "integer", "min:1", "max:32"],
      },
      {
        key: "serverPassword", label: "Server Password",
        description: "Leave blank for a public server",
        type: "password", envKey: "SERVER_PASSWORD",
        required: false, userEditable: true, userViewable: true, requiresRestart: true,
        rules: ["string", "max:64"],
      },
      {
        key: "adminPassword", label: "Admin Password",
        description: "Used to authenticate RCON and in-game admin commands",
        type: "password", envKey: "ADMIN_PASSWORD",
        required: false, userEditable: true, userViewable: true, requiresRestart: true,
        rules: ["string", "max:64"],
      },
      {
        key: "publicListing", label: "List on Community Servers",
        type: "checkbox", envKey: "COMMUNITY",
        default: "false", trueValue: "true", falseValue: "false",
        required: true, userEditable: true, userViewable: true, requiresRestart: true,
        rules: ["required", "in:true,false"],
      },
      {
        key: "multithreading", label: "Enable Multithreading",
        description: "Improves performance on multi-core CPUs",
        type: "checkbox", envKey: "MULTITHREADING",
        default: "true", trueValue: "true", falseValue: "false",
        required: true, userEditable: true, userViewable: true, requiresRestart: true,
        rules: ["required", "in:true,false"],
      },
      {
        key: "publicIp", label: "Public IP",
        description: "Server's public IP (required for community listing)",
        type: "text", envKey: "PUBLIC_IP",
        required: false, userEditable: true, userViewable: true, requiresRestart: true,
        rules: ["string", "max:64"],
      },
      {
        key: "publicPort", label: "Public Port",
        type: "number", envKey: "PUBLIC_PORT", default: "8211",
        required: true, userEditable: false, userViewable: true, requiresRestart: true,
        rules: ["required", "integer", "min:1", "max:65535"],
      },
    ],
    ports: [
      { hostPort: 8211,  containerPort: 8211,  protocol: "udp" },
      { hostPort: 27015, containerPort: 27015, protocol: "udp" },
    ],
    volumes: [{ name: "data", containerPath: "/palworld" }],
    resources: { defaultMemoryMb: 16384, defaultCpu: 4 },
  },
  admin: {
    whitelist: null,
    ban: {
      ban:   { type: "stdin-command", command: "BanPlayer {player}" },
      unban: { type: "stdin-command", command: "UnBanPlayer {player}" },
    },
    kick:      { kick: { type: "stdin-command", command: "KickPlayer {player}" } },
    broadcast: { send: { type: "stdin-command", command: "Broadcast {message}" } },
  },
};
