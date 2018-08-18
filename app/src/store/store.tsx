import { applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";

import { IPlayer } from "../Player";
import { ITeam } from "../Team";
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
export const createTeam = (): ITeam => ({
  Bench: new Array(7).fill(null),
  DST: null,
  Flex: null,
  K: null,
  QB: null,
  RBs: [null, null],
  StarterValue: 0,
  TE: null,
  WRs: [null, null]
});

export const initialState = {
  activeTeam: 0, // active team's index ([0-9]) that's currently drafting
  currentPick: 1, // 1-based
  draftDirection: 1, // either 1 (forward) or -1 (reverse)
  lastPickedPlayer: null,
  numberOfTeams: 10,
  past: null,
  players: [],
  selectedPlayer: null,
  teams: new Array(10).fill(0).map(() => createTeam()), // doing 10 empty teams by default
  trackedTeam: 0, // team to track in TeamPicks
  undraftedPlayers: []
};

export const store = createStore(
  reducers,
  composeWithDevTools(applyMiddleware())
);
