import type { GameDefinition } from "./types";
import { minecraftJava } from "./definitions/minecraft-java";
import { minecraftBedrock } from "./definitions/minecraft-bedrock";
import { valheim } from "./definitions/valheim";
import { rust } from "./definitions/rust";
import { palworld } from "./definitions/palworld";
import { sevenDaysToDie } from "./definitions/7dtd";
import { terraria } from "./definitions/terraria";
import { satisfactory } from "./definitions/satisfactory";
import { custom } from "./definitions/custom";

class GameRegistry {
  private readonly map = new Map<string, GameDefinition>();

  register(def: GameDefinition): this {
    this.map.set(def.identity.id, def);
    return this;
  }

  get(id: string): GameDefinition | undefined {
    return this.map.get(id);
  }

  getOrThrow(id: string): GameDefinition {
    const def = this.map.get(id);
    if (!def) throw new Error(`Unknown game: "${id}"`);
    return def;
  }

  list(): GameDefinition[] {
    return Array.from(this.map.values());
  }

  listIds(): string[] {
    return Array.from(this.map.keys());
  }
}

export const games = new GameRegistry();

// To add a new game: create a definition file in ./definitions/ and add one
// .register() call here. That's it — the game appears in dropdowns,
// gets Docker defaults, and has its status polled automatically.
games
  .register(minecraftJava)
  .register(minecraftBedrock)
  .register(valheim)
  .register(rust)
  .register(palworld)
  .register(sevenDaysToDie)
  .register(terraria)
  .register(satisfactory)
  .register(custom);
