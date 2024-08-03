import { applyMiddleware, createStore } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { IPlayer } from '../models/Player';
import { IScoring } from '../models/Scoring';
import { IPick, IRoster, ITeam } from '../models/Team';
import reducers from './reducers';

export interface IStoreState {
  /**
   * The index of the team that's currently drafting
   */
  activeTeam: number;

  /**
   * the current draft index. is incremented by one during each
   * successive draft selection
   */
  currentPick: number; // index of current pick

  /**
   * Whether the app is currently in a state of "formatting the roster"
   * When it is, there's a popup where the user toggles the number of players
   * at QB, RB, WR, TE, FLEX, DST, and K
   */
  formattingRoster: boolean;

  /**
   * Whether the app is currently in a state of changing league scoring
   */
  formattingScoring: boolean;

  /**
   * The last picked players. Begins as null but is set thereafter
   */
  lastPickedPlayer: IPlayer | null;

  /**
   * Timestamp of the last update of player projections. -1 if never synced
   */
  lastSync: number;

  /**
   * Players out of the last sync of projections.json
   */
  lastSyncPlayers: IPlayer[];

  /**
   * Total number of teams drafting. Has downstream effects on the VOR calculations,
   * since a larger number of teams drafting means that roles like DST and TE take on
   * more value and should likely be drafted sooner
   */
  numberOfTeams: number;

  /**
   * An array of player picks, ordered such that the first element is the most
   * recent, the second is the second most recent, etc
   *
   * if the drafter skips a round, ie drafts no one, that position in the array is just null
   */
  picks: IPick[];

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
   * The user's league scoring. The default is for an ESPN league
   */
  scoring: IScoring;

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
  BENCH: new Array(rosterFormat.BENCH).fill(null),
  DST: new Array(rosterFormat.DST).fill(null),
  FLEX: new Array(rosterFormat.FLEX).fill(null),
  SUPERFLEX: new Array(rosterFormat.SUPERFLEX).fill(null),
  K: new Array(rosterFormat.K).fill(null),
  QB: new Array(rosterFormat.QB).fill(null),
  RB: new Array(rosterFormat.RB).fill(null),
  TE: new Array(rosterFormat.TE).fill(null),
  WR: new Array(rosterFormat.WR).fill(null),
});

/**
 * Typical ESPN, CBS, Yahoo League. I'm using this as baseline for VOR calculation.
 * If the actual roster is changed, the VOR calculations need to as well
 */
export const initialRoster: IRoster = {
  BENCH: 7,
  DST: 1,
  FLEX: 1,
  SUPERFLEX: 0,
  K: 1,
  QB: 1,
  RB: 2,
  TE: 1,
  WR: 2,
};

/**
 * Default scoring for an ESPN league.
 * See: https://support.espn.com/hc/en-us/articles/360003914032-Scoring-Formats
 */
export const initialScore: IScoring = {
  passYds: 0.04,
  passTds: 4.0, // tslint:disable-line
  passInts: -2.0,
  receptions: 0.0,
  receptionYds: 0.1,
  receptionTds: 6.0,
  rushYds: 0.1,
  rushTds: 6.0,
  fumbles: -2.0,
  twoPts: 2.0,
  kickExtraPoints: 1.0,
  kick019: 3.0,
  kick2029: 3.0,
  kick3039: 3.0,
  kick4049: 4.0,
  kick50: 5.0,
  dfInts: 2.0,
  dfTds: 6.0,
  dfSacks: 1.0,
  dfPointsAllowedPerGame: 0,
  dfFumbles: 2.0,
  dfSafeties: 2.0,
};

/**
 * Initial state of the redux store
 */
export const initialState = {
  activeTeam: 0, // active team's index ([0-9]) that's currently drafting
  currentPick: 0, // index of current pick
  formattingRoster: false,
  formattingScoring: false,
  lastPickedPlayer: null,
  lastSync: -1,
  lastSyncPlayers: [],
  numberOfTeams: 10,
  picks: [],
  players: [],
  ppr: false,
  rosterFormat: initialRoster,
  scoring: initialScore,
  selectedPlayer: null,
  teams: new Array(10).fill(0).map(() => createTeam(initialRoster)), // doing 10 empty teams by default
  trackedTeam: 0, // team to track in TeamPicks
  undraftedPlayers: [],
};

const persistConfig = {
  key: 'root',
  storage,
};

const persistedReducer = persistReducer(persistConfig, reducers);

export const store = createStore(persistedReducer, applyMiddleware());

export const persistor = persistStore(store);
