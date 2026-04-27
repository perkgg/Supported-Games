declare module "gamedig" {
  export interface QueryOptions {
    type: string;
    host: string;
    port?: number;
    socketTimeout?: number;
    attemptTimeout?: number;
    maxAttempts?: number;
    givenPortOnly?: boolean;
    [key: string]: unknown;
  }
  export interface QueryState {
    name?: string;
    map?: string;
    password?: boolean;
    maxplayers?: number;
    numplayers?: number;
    players?: { name?: string }[];
    bots?: { name?: string }[];
    connect?: string;
    ping?: number;
    raw?: Record<string, unknown>;
    version?: string;
    [key: string]: unknown;
  }
  export const GameDig: {
    query(options: QueryOptions): Promise<QueryState>;
  };
  const _default: { GameDig: typeof GameDig };
  export default _default;
}
