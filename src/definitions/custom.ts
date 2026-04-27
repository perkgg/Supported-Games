import type { GameDefinition } from "../types.js";

export const custom: GameDefinition = {
  identity: { id: "custom", name: "Custom" },
  query: { protocol: "none", defaultPort: 25565 },
  playerIdType: null,
  statusFields: [],
  pod: null,
  admin: null,
};
