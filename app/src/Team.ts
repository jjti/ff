import { IPlayer } from "./Player";

export type TeamPlayer = IPlayer | null;

export interface IRoster {
  QB: number;
  RB: number;
  WR: number;
  Flex: number;
  TE: number;
  DST: number;
  K: number;
  Bench: number;
}

export interface ITeam {
  QB: TeamPlayer;
  RBs: TeamPlayer[];
  WRs: TeamPlayer[];
  Flex: TeamPlayer;
  TE: TeamPlayer;
  DST: TeamPlayer;
  K: TeamPlayer;
  Bench: TeamPlayer[];
  StarterValue?: number;
}
