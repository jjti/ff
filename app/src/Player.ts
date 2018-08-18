export type Position = "QB" | "RB" | "WR" | "FLEX" | "TE" | "DST" | "K" | "?";

export interface IPlayer {
  bye: number;
  name: string;
  pos: Position;
  team: string;
  vor: number;
  adp: number;
  pred: number;
  replace_value: number;
  experts: number;
  madden: number;
  href?: string;
}
