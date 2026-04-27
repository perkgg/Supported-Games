import type { GameDefinition } from "../types.js";

export const valheim: GameDefinition = {
  identity: { id: "valheim", name: "Valheim" },
  query: {
    protocol: "gamedig",
    gamedigType: "valheim",
    defaultPort: 2457,
  },
  playerIdType: { account: "steam", field: "id" },
  statusFields: [
    { key: "players", label: "Players", source: { type: "player-count" } },
  ],
  pod: {
    startup: "/usr/local/sbin/bootstrap_valheim.sh",
    dockerImages: {
      "Latest": "lloesche/valheim-server:latest",
    },
    defaultDockerImageKey: "Latest",
    variables: [
      {
        key: "serverName", label: "Server Name",
        description: "Shown in the in-game server browser",
        type: "text", envKey: "SERVER_NAME", default: "Valheim Server",
        required: true, userEditable: true, userViewable: true, requiresRestart: true,
        rules: ["required", "string", "max:64"],
      },
      {
        key: "worldName", label: "World Name",
        description: "Name of the world save file. Changing this starts a new world.",
        type: "text", envKey: "WORLD_NAME", default: "world",
        required: true, userEditable: true, userViewable: true, requiresRestart: true,
        rules: ["required", "string", "max:64"],
      },
      {
        key: "serverPassword", label: "Server Password",
        description: "Password players must enter to join. Minimum 5 characters.",
        type: "password", envKey: "SERVER_PASS", default: "changeme",
        required: true, userEditable: true, userViewable: true, requiresRestart: true,
        rules: ["required", "string", "min:5", "max:64"],
      },
      {
        key: "public", label: "Public Server",
        description: "List this server in the in-game server browser",
        type: "checkbox", envKey: "SERVER_PUBLIC",
        default: "1", trueValue: "1", falseValue: "0",
        required: true, userEditable: true, userViewable: true, requiresRestart: true,
        rules: ["required", "in:0,1"],
      },
    ],
    ports: [
      { hostPort: 2456, containerPort: 2456, protocol: "udp" },
      { hostPort: 2457, containerPort: 2457, protocol: "udp" },
    ],
    volumes: [
      { name: "config", containerPath: "/config" },
      { name: "opt",    containerPath: "/opt/valheim" },
    ],
    resources: { defaultMemoryMb: 4096, defaultCpu: 2 },
  },
  admin: {
    whitelist: {
      add:    { type: "file-mutation", containerPath: "/config/adminlist.txt", format: "newline-list" },
      remove: { type: "file-mutation", containerPath: "/config/adminlist.txt", format: "newline-list" },
    },
    ban: {
      ban:   { type: "file-mutation", containerPath: "/config/bannedlist.txt", format: "newline-list" },
      unban: { type: "file-mutation", containerPath: "/config/bannedlist.txt", format: "newline-list" },
    },
    kick:      null,
    broadcast: null,
  },
};
