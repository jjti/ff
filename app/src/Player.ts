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
  prediction: number;
  adp?: number; // one of adp8, adp10, adp12, or adp14
  adp8: number;
  adp10: number;
  adp12: number;
  adp14: number;
  madden: number;
  vor?: number;
  href?: string;
}
