import type { GameDefinition } from "../types.js";

export const sevenDaysToDie: GameDefinition = {
  identity: { id: "7dtd", name: "7 Days to Die" },
  query: {
    protocol: "gamedig",
    gamedigType: "7d2d",
    defaultPort: 26900,
  },
  playerIdType: { account: "steam", field: "id" },
  statusFields: [
    { key: "players", label: "Players", source: { type: "player-count" } },
    { key: "gameDay", label: "Day",     source: { type: "extra", path: "gameDay" } },
  ],
  pod: {
    startup: "/home/sdtdserver/start.sh",
    dockerImages: {
      "Latest": "vinanrra/7dtd-server:latest",
    },
    defaultDockerImageKey: "Latest",
    variables: [
      {
        key: "serverVersion", label: "Server Version Branch",
        type: "select", envKey: "Version", default: "stable",
        options: [
          { label: "Stable",              value: "stable" },
          { label: "Latest Experimental", value: "latest_experimental" },
        ],
        required: true, userEditable: true, userViewable: true, requiresRestart: true,
        rules: ["required", "in:stable,latest_experimental"],
      },
      {
        key: "serverPassword", label: "Server Password",
        description: "Leave blank for no password",
        type: "password", envKey: "ServerPassword",
        required: false, userEditable: true, userViewable: true, requiresRestart: true,
        rules: ["string", "max:64"],
      },
      {
        key: "maxPlayers", label: "Max Players",
        type: "number", envKey: "ServerMaxPlayerCount", default: "8",
        required: true, userEditable: true, userViewable: true, requiresRestart: true,
        rules: ["required", "integer", "min:1", "max:64"],
      },
      {
        key: "startMode", label: "Start Mode",
        type: "text", envKey: "START_MODE", default: "1",
        required: true, userEditable: false, userViewable: true, requiresRestart: true,
        rules: ["required", "string"],
      },
      {
        key: "timeZone", label: "Time Zone",
        type: "text", envKey: "TimeZone", default: "UTC",
        required: true, userEditable: true, userViewable: true, requiresRestart: true,
        rules: ["required", "string", "max:64"],
      },
    ],
    ports: [
      { hostPort: 26900, containerPort: 26900, protocol: "tcp" },
      { hostPort: 26900, containerPort: 26900, protocol: "udp" },
      { hostPort: 26901, containerPort: 26901, protocol: "udp" },
      { hostPort: 26902, containerPort: 26902, protocol: "udp" },
    ],
    volumes: [{ name: "data", containerPath: "/home/sdtdserver" }],
    resources: { defaultMemoryMb: 8192, defaultCpu: 4 },
  },
  admin: {
    whitelist: null,
    ban: {
      ban:   { type: "stdin-command", command: "ban add {player}" },
      unban: { type: "stdin-command", command: "ban remove {player}" },
    },
    kick:      { kick: { type: "stdin-command", command: "kick {player}" } },
    broadcast: { send: { type: "stdin-command", command: "say \"{message}\"" } },
  },
};
