export type Position =
  | 'QB'
  | 'RB'
  | 'WR'
  | 'FLEX'
  | 'TE'
  | 'DST'
  | 'K'
  | 'BENCH'
  | '?';

export interface IPlayer {
  bye: number;
  name: string;
  pos: Position;
  team: string;
  predictionPPR: number;
  predictionSTN: number;

  /**
   * one of adp8, adp10, adp12, or adp14
   */
  adp?: number;
  adp8PPR: number;
  adp10PPR: number;
  adp12PPR: number;
  adp14PPR: number;
  adp8STN: number;
  adp10STN: number;
  adp12STN: number;
  adp14STN: number;
  madden: number;

  /**
   * Player's value over other players in the same position
   *
   * Is a function of the number of teams and number of players
   * in that position drafted within the first 10 rounds
   */
  vor?: number;

  /**
   * First initial and last name of each player. Not set on initial
   * load (with forecast payload), but is computed once
   *
   * Used because (based on Reddit feedback) it makes it easier to
   * draft players
   */
  tableName?: string;
  href?: string;
}
