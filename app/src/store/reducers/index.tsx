import { ITeam } from "../../Team";
import { ACTION_TYPES } from "../actions";
import { IStoreState } from "../store";
import { removePlayer } from "./players";
import {
  incrementDraft,
  pickPlayer,
  setTrackedTeam,
  undoPlayerPick
} from "./teams";

const emptyTeam = (): ITeam => ({
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
  draftDirection: 1, // either 1 (forward) or -1 (reverse)
  lastPickedPlayer: null,
  past: null,
  players: [],
  selectedPlayer: null,
  teams: new Array(10).fill(0).map(() => emptyTeam()), // doing 10 empty teams by default
  trackedTeam: 0, // team to track in TeamPicks
  undraftedPlayers: []
};

export default (state = initialState, action: any): IStoreState => {
  switch (action.type) {
    case ACTION_TYPES.SET_PLAYERS: {
      return {
        ...state,
        players: action.players,
        undraftedPlayers: action.players
      };
    }
    case ACTION_TYPES.PICK_PLAYER: {
      return pickPlayer(state, action.player);
    }
    case ACTION_TYPES.UNDO_PICK_PLAYER: {
      return undoPlayerPick(state);
    }
    case ACTION_TYPES.SET_TRACKED_TEAM: {
      return setTrackedTeam(state, action.trackedTeam);
    }
    case ACTION_TYPES.REMOVE_PLAYER: {
      return removePlayer(state, action.player);
    }
    case ACTION_TYPES.INCREMENT_DRAFT: {
      return incrementDraft(state);
    }
    case ACTION_TYPES.SELECT_PLAYER: {
      return {
        ...state,
        selectedPlayer: action.player
      };
    }
    default:
      return state;
  }
};
