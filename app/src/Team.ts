import { IPlayer } from "./Player";

export type TeamPlayer = IPlayer | null;

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
  Bench: number;
}

/**
 * A team comprised of players
 */
export interface ITeam {
  QB: TeamPlayer[];
  RB: TeamPlayer[];
  WR: TeamPlayer[];
  FLEX: TeamPlayer[];
  TE: TeamPlayer[];
  DST: TeamPlayer[];
  K: TeamPlayer[];
  Bench: TeamPlayer[];
  StarterValue?: number;
}
