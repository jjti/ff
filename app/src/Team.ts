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
  TE: number;
  DST: number;
  K: number;
  BENCH: number;
}

/**
 * A team comprised of players
 */
export interface ITeam {
  QB: NullablePlayer[];
  RB: NullablePlayer[];
  WR: NullablePlayer[];
  FLEX: NullablePlayer[];
  TE: NullablePlayer[];
  DST: NullablePlayer[];
  K: NullablePlayer[];
  BENCH: NullablePlayer[];
  StarterValue?: number;
}

/**
 * A pick, object describing which team the player was drafted to
 */
export interface IPick {
  player: NullablePlayer;
  team: number;
}
