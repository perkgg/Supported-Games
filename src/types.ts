// ─── Player Identity ───────────────────────────────────────────────────────────
// Describes which account system and which field within it the game uses to
// identify players in admin commands and the player list.

export type PlayerIdType =
  | { account: "minecraft-java";    field: "uuid" | "username" }
  | { account: "minecraft-bedrock"; field: "xuid" | "uuid" | "username" }
  | { account: "steam";             field: "id" | "username" };

// ─── Identity ──────────────────────────────────────────────────────────────────

export interface GameIdentity {
  /** Stable slug used as a database key. Never change after publishing.
   *  Examples: "minecraft-java", "rust", "7dtd" */
  id: string;
  /** Human-readable display name shown in pickers and labels. */
  name: string;
}

// ─── Query Protocol ────────────────────────────────────────────────────────────
// Single dispatcher in query.ts switches on `protocol`. `gamedig` covers
// 100+ games via the gamedig library; `none` means status comes from
// elsewhere (agent / advanced push).

export type QueryProtocol = "gamedig" | "none";

export interface QueryConfig {
  protocol: QueryProtocol;
  /** gamedig type id (e.g. "minecraft", "valheim", "rust"). Required when protocol === "gamedig". */
  gamedigType?: string;
  /** Used when GameServer.port is null; also shown in UI as the suggested port. */
  defaultPort: number;
}

// ─── Status Fields ─────────────────────────────────────────────────────────────

export type StatusFieldSource =
  | { type: "motd" }
  | { type: "player-count" }
  | { type: "player-list" }
  | { type: "version" }
  | { type: "server-icon" }
  | { type: "game-mode" }
  | { type: "extra"; path: string };

export interface StatusField {
  key: string;
  label: string;
  source: StatusFieldSource;
}

// ─── Pod Variables ─────────────────────────────────────────────────────────────
// Pelican/Pterodactyl-style variables. Each variable maps to a Docker env var
// and renders as a form field. Rules are validated on the API.

export type PodVariableType =
  | "text"
  | "password"
  | "number"
  | "select"
  | "textarea"
  | "checkbox";

export interface PodVariableOption {
  label: string;
  value: string;
}

interface PodVariableBase {
  /** Unique form key. */
  key: string;
  label: string;
  description?: string;
  type: PodVariableType;
  /** Docker env var name written into the container, e.g. "EULA", "DIFFICULTY". */
  envKey: string;
  /** Default value (always string — cast at render). */
  default?: string;
  options?: PodVariableOption[];
  required: boolean;
  /** Shown in the UI form. */
  userEditable: boolean;
  /** Visible (read-only if !userEditable). */
  userViewable: boolean;
  /** Whether changes need a container restart. */
  requiresRestart: boolean;
  /** Validation rule list, Laravel-style: ['string','max:255','in:a,b'] */
  rules: string[];
}

export interface CheckboxPodVariable extends PodVariableBase {
  type: "checkbox";
  trueValue: string;
  falseValue: string;
}

export interface NonCheckboxPodVariable extends PodVariableBase {
  type: Exclude<PodVariableType, "checkbox">;
}

export type PodVariable = CheckboxPodVariable | NonCheckboxPodVariable;

// ─── Docker bindings ───────────────────────────────────────────────────────────

export interface PortBinding {
  hostPort: number;
  containerPort: number;
  protocol: "tcp" | "udp";
}

export interface VolumeMount {
  /** Label, e.g. "data", "config". */
  name: string;
  /** Absolute path inside the container. */
  containerPath: string;
}

// ─── Pod ───────────────────────────────────────────────────────────────────────
// Pterodactyl-pod-shaped template. The startup command is interpolated against
// resolved env vars at the agent before being passed to the container. The
// `dockerImages` map lets users pick image variants (e.g. Java 21 vs 17).

export interface PodInstallScript {
  /** Image to run the install one-shot in (often alpine, debian:bookworm-slim, etc). */
  image: string;
  /** Container entrypoint, e.g. "bash" or "/bin/ash". */
  entrypoint: string;
  /** Shell script body. Has access to pod env vars. */
  script: string;
}

export interface Pod {
  /** Shell-style startup command. Tokens like ${VAR} are replaced from env at runtime. */
  startup: string;
  /** Image variants — keys shown in UI, values are full image refs. */
  dockerImages: Record<string, string>;
  /** Key from dockerImages used when no override is set. */
  defaultDockerImageKey: string;
  /** Form fields rendered for managed-server config. */
  variables: PodVariable[];
  /** Default port bindings. */
  ports: PortBinding[];
  /** Default volume mounts. */
  volumes: VolumeMount[];
  /** Resource hints. */
  resources: {
    defaultMemoryMb: number;
    defaultCpu: number;
  };
  /** Optional one-shot install/setup container, run before first start. */
  install?: PodInstallScript;
}

// ─── Admin Actions ─────────────────────────────────────────────────────────────

export type AdminMethod =
  | { type: "stdin-command"; command: string }
  | { type: "rcon-command"; command: string }
  | { type: "file-mutation"; containerPath: string; format: "newline-list" | "json" };

export interface AdminConfig {
  whitelist?: { add: AdminMethod; remove: AdminMethod } | null;
  ban?: { ban: AdminMethod; unban: AdminMethod | null } | null;
  kick?: { kick: AdminMethod } | null;
  broadcast?: { send: AdminMethod } | null;
}

// ─── Query Result ──────────────────────────────────────────────────────────────

export interface QueryResult {
  online: boolean;
  currentPlayers?: number;
  maxPlayers?: number;
  motd?: string;
  /** Base64 data URL — Minecraft Java favicon. */
  icon?: string;
  version?: string;
  map?: string;
  latencyMs?: number;
}

// ─── Game Definition ───────────────────────────────────────────────────────────

export interface GameDefinition {
  identity: GameIdentity;
  query: QueryConfig;
  /** How players are identified in admin commands and the player list. null = unknown / not applicable. */
  playerIdType: PlayerIdType | null;
  /**
   * Status fields rendered on the server card, in declaration order.
   */
  statusFields: StatusField[];
  /**
   * Pod-style template for managed-server provisioning.
   * null means no managed Docker support (e.g. "custom").
   */
  pod: Pod | null;
  /**
   * Admin actions exposed to perk-agent.
   * null = no admin actions for this game.
   */
  admin: AdminConfig | null;
}
