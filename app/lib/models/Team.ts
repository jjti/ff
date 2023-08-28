import { IPlayer } from './Player';

export type NullablePlayer = IPlayer | null;

/**
 * Number of players at each position
 */
export interface IRoster {
  QB: number;
  RB: number;
  WR: number;
  FLEX: number;
  SUPERFLEX: number;
  TE: number;
  DST: number;
  K: number;
  BENCH: number;
}

/**
 * A team comprised of players
 */
export interface ITeam {
  name: string;
  QB: NullablePlayer[];
  RB: NullablePlayer[];
  WR: NullablePlayer[];
  FLEX: NullablePlayer[];
  SUPERFLEX: NullablePlayer[];
  TE: NullablePlayer[];
  DST: NullablePlayer[];
  K: NullablePlayer[];
  BENCH: NullablePlayer[];
}

/**
 * A pick, object describing which team the player was drafted to
 */
export interface IPick {
  player: NullablePlayer;
  team: number;
  pickNumber?: number;
}
