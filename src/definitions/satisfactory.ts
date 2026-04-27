import type { GameDefinition } from "../types.js";

export const satisfactory: GameDefinition = {
  identity: { id: "satisfactory", name: "Satisfactory" },
  query: {
    protocol: "gamedig",
    gamedigType: "satisfactory",
    defaultPort: 15777,
  },
  playerIdType: { account: "steam", field: "id" },
  statusFields: [
    { key: "players",  label: "Players",        source: { type: "player-count" } },
    { key: "sessions", label: "Active Session", source: { type: "extra", path: "sessionName" } },
  ],
  pod: {
    startup: "/start",
    dockerImages: {
      "Latest": "wolveix/satisfactory-server:latest",
    },
    defaultDockerImageKey: "Latest",
    variables: [
      {
        key: "maxPlayers", label: "Max Players",
        type: "number", envKey: "MAXPLAYERS", default: "4",
        required: true, userEditable: true, userViewable: true, requiresRestart: true,
        rules: ["required", "integer", "min:1", "max:32"],
      },
      {
        key: "useBeta", label: "Use Experimental Branch",
        type: "checkbox", envKey: "STEAMBETA",
        default: "false", trueValue: "true", falseValue: "false",
        required: true, userEditable: true, userViewable: true, requiresRestart: true,
        rules: ["required", "in:true,false"],
      },
    ],
    ports: [
      { hostPort: 7777,  containerPort: 7777,  protocol: "udp" },
      { hostPort: 15000, containerPort: 15000, protocol: "udp" },
      { hostPort: 15777, containerPort: 15777, protocol: "udp" },
    ],
    volumes: [{ name: "data", containerPath: "/config" }],
    resources: { defaultMemoryMb: 8192, defaultCpu: 4 },
  },
  admin: null,
};
