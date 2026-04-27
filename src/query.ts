// Node.js sub-export — only import this from server-side code.
// Web: import from "@workspace/games"
// API / perk-agent: import from "@workspace/games/query"

/// <reference path="./gamedig.d.ts" />
import { GameDig } from "gamedig";
import { games } from "./registry";
import type { QueryResult } from "./types";

export type { QueryResult };

const GAMEDIG_TIMEOUT_MS = 5_000;

// ─── gamedig ───────────────────────────────────────────────────────────────────

interface GamedigPlayer { name?: string }
interface GamedigRaw {
  favicon?: string;
  vanilla?: { raw?: { version?: { name?: string } } };
  version?: string | { name?: string };
}
interface GamedigState {
  name?: string;
  map?: string;
  password?: boolean;
  maxplayers?: number;
  numplayers?: number;
  players?: GamedigPlayer[];
  bots?: GamedigPlayer[];
  connect?: string;
  ping?: number;
  raw?: GamedigRaw;
  version?: string;
}

async function queryGamedig(type: string, host: string, port: number): Promise<QueryResult> {
  try {
    const state = await GameDig.query({
      type,
      host,
      port,
      socketTimeout: GAMEDIG_TIMEOUT_MS,
      attemptTimeout: GAMEDIG_TIMEOUT_MS,
    }) as GamedigState;

    const version =
      typeof state.version === "string" ? state.version :
      state.raw?.vanilla?.raw?.version?.name ??
      (typeof state.raw?.version === "string" ? state.raw.version : state.raw?.version?.name);

    return {
      online: true,
      currentPlayers: state.numplayers ?? state.players?.length,
      maxPlayers: state.maxplayers,
      motd: state.name,
      icon: state.raw?.favicon,
      version,
      map: state.map,
      latencyMs: state.ping,
    };
  } catch {
    return { online: false };
  }
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export async function queryServer(gameType: string, host: string, port: number): Promise<QueryResult> {
  const cfg = games.get(gameType)?.query;

  switch (cfg?.protocol) {
    case "gamedig":
      if (!cfg.gamedigType) return { online: false };
      return queryGamedig(cfg.gamedigType, host, port);
    case "none":
    default:
      return { online: false };
  }
}
