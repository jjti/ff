export type Position =
  | "QB"
  | "RB"
  | "WR"
  | "FLEX"
  | "TE"
  | "DST"
  | "K"
  | "BENCH"
  | "?";

export interface IPlayer {
  bye: number;
  name: string;
  pos: Position;
  team: string;
  predictionPPR: number;
  predictionSTN: number;
  adp?: number; // one of adp8, adp10, adp12, or adp14
  adp8PPR: number;
  adp10PPR: number;
  adp12PPR: number;
  adp14PPR: number;
  adp8STN: number;
  adp10STN: number;
  adp12STN: number;
  adp14STN: number;
  madden: number;
  vor?: number;
  href?: string;
}
