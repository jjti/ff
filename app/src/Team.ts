import { IPlayer } from "./Player";

export type TeamPlayer = IPlayer | null;

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
