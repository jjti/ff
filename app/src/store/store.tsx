import { applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";

import { IPlayer } from "../Player";
import { IRoster, ITeam } from "../Team";
import reducers from "./reducers";

export interface IStoreState {
  /**
   * The index of the team that's currently drafting
   */
  activeTeam: number;

  /**
   * the current 1-based draft index. is incremented by one during each
   * successive draft selection
   */
  currentPick: number; // index of current pick + 1

  /**
   * 1 or -1 for whether the draft is progressing to the right (upwards in activeTeam index)
   * or down (downards in activeTeam index)
   */
  draftDirection: number; // 1 or -1

  /**
   * The last picked players. Begins as null but is set thereafter
   */
  lastPickedPlayer: IPlayer | null;

  /**
   * Total number of teams drafting. Has downstream effects on the VOR calculations,
   * since a larger number of teams drafting means that roles like DST and TE take on
   * more value and should likely be drafted sooner
   */
  numberOfTeams: number;

  /**
   * An array of past store states. A store state is small enought that I'm just storing
   * the whole past state as an object, rather than a diff, or partial state, etc
   */
  past: IStoreState | null;

  /**
   * All the players, and their stats, as retrieved from the server. This is NOT the
   * players array that's in the PlayerTable, that's undraftedPlayers
   */
  players: IPlayer[];

  /**
   * The roster of the teams being drafted for.
   * The default is 1QB, 2RB, 2WR, 1TE, 1FLEX, 1K, 1DST, and 7Bench, but this can be changed
   */
  rosterFormat: IRoster;

  /**
   * Currently selected player (one click)
   */
  selectedPlayer: IPlayer | null;

  /**
   * The array of team rosters
   */
  teams: ITeam[];

  /**
   * The team that's being "tracked" on the left-side of the page. It's focused,
   * and players in the PlayerTable are grayed out based on roles that need to be filled
   * in the trackedTeam. Only one team can be tracked at a time, since it's likely a user
   * would only want to track their own team
   */
  trackedTeam: number;

  /**
   * An array of players that have yet to be drafted
   */
  undraftedPlayers: IPlayer[];
}

/**
 * Create an emptyTeam without any drafted players
 */
export const createTeam = (rosterFormat: IRoster): ITeam => ({
  Bench: new Array(rosterFormat.Bench).fill(null),
  DST: new Array(rosterFormat.DST).fill(null),
  FLEX: new Array(rosterFormat.FLEX).fill(null),
  K: new Array(rosterFormat.K).fill(null),
  QB: new Array(rosterFormat.QB).fill(null),
  RB: new Array(rosterFormat.RB).fill(null),
  StarterValue: 0,
  TE: new Array(rosterFormat.TE).fill(null),
  WR: new Array(rosterFormat.WR).fill(null)
});

const initialRoster: IRoster = {
  Bench: 7,
  DST: 1,
  FLEX: 1,
  K: 1,
  QB: 1,
  RB: 2,
  TE: 1,
  WR: 2
};

export const initialState = {
  activeTeam: 0, // active team's index ([0-9]) that's currently drafting
  currentPick: 1, // 1-based
  draftDirection: 1, // either 1 (forward) or -1 (reverse)
  lastPickedPlayer: null,
  numberOfTeams: 10,
  past: null,
  players: [],
  rosterFormat: initialRoster,
  selectedPlayer: null,
  teams: new Array(10).fill(0).map(() => createTeam(initialRoster)), // doing 10 empty teams by default
  trackedTeam: 0, // team to track in TeamPicks
  undraftedPlayers: []
};

export const store = createStore(
  reducers,
  composeWithDevTools(applyMiddleware())
);
