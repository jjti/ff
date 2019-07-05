/**
 * Scoring system for a league.
 * Eg of ESPNs: https://support.espn.com/hc/en-us/articles/360003914032-Scoring-Formats
 * Corresponds to stat columns in each IPlayer.
 */
export interface IScoring {
  passYds: number;
  passTds: number;
  passInts: number;
  receptions: number;
  receptionYds: number;
  receptionTds: number;
  rushYds: number;
  rushTds: number;
  fumbles: number;
  twoPts: number;
  kickExtraPoints: number;
  kick019: number;
  kick2029: number;
  kick3039: number;
  kick4049: number;
  kick50: number;
  dfInts: number;
  dfTds: number;
  dfSacks: number;
  dfPointsAllowedPerGame: number;
  dfFumbles: number;
  dfSafeties: number;
}
