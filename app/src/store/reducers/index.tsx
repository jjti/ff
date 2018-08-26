import { ACTION_TYPES } from "../actions";
import { initialState, IStoreState } from "../store";
import { removePlayer, setRosterFormat, undoPlayerPick } from "./players";
import {
  incrementDraft,
  pickPlayer,
  resetStore,
  setNumberOfTeams,
  setTrackedTeam,
  updatePlayerVORs
} from "./teams";

export default (state = initialState, action: any): IStoreState => {
  switch (action.type) {
    case ACTION_TYPES.SET_PLAYERS: {
      return updatePlayerVORs({
        ...state,
        past: null,
        players: action.players,
        undraftedPlayers: action.players
      });
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
    case ACTION_TYPES.RESET_DRAFT: {
      return resetStore(state);
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
    case ACTION_TYPES.SET_NUMBER_OF_TEAMS: {
      return setNumberOfTeams(state, action.numberOfTeams);
    }
    case ACTION_TYPES.SET_ACTIVE_TEAM: {
      return { ...state, activeTeam: action.activeTeam };
    }
    case ACTION_TYPES.SET_ROSTER_FORMAT: {
      return setRosterFormat(state);
    }
    default:
      return state;
  }
};
