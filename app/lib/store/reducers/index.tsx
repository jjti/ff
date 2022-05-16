import { ACTION_TYPES } from '../actions';
import { initialState, IStoreState } from '../store';
import {
  removePlayer,
  setPlayers,
  setRosterFormat,
  undoLast,
  undoPick
} from './players';
import { setScoringFormat } from './scoring';
import {
  incrementDraft,
  pickPlayer,
  resetStore,
  setNumberOfTeams,
  setPick,
  setTrackedTeam,
  skipPick
} from './teams';

export default (state = initialState, action: any): IStoreState => {
  switch (action.type) {
    case ACTION_TYPES.PICK_PLAYER: {
      return pickPlayer(state, action.player);
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
      return { ...state, selectedPlayer: action.player };
    }
    case ACTION_TYPES.SET_ACTIVE_TEAM: {
      return { ...state, activeTeam: action.activeTeam };
    }
    case ACTION_TYPES.SET_NUMBER_OF_TEAMS: {
      return setNumberOfTeams(state, action.numberOfTeams);
    }
    case ACTION_TYPES.SET_PLAYERS: {
      return setPlayers(state, action.players);
    }
    case ACTION_TYPES.SET_PICK: {
      return setPick(state, action.pick);
    }
    case ACTION_TYPES.SET_ROSTER_FORMAT: {
      return setRosterFormat(state, action.rosterFormat);
    }
    case ACTION_TYPES.SET_SCORE_FORMAT: {
      return setScoringFormat(state, action.scoring);
    }
    case ACTION_TYPES.SET_TRACKED_TEAM: {
      return setTrackedTeam(state, action.trackedTeam);
    }
    case ACTION_TYPES.SKIP_PICK: {
      return skipPick(state);
    }
    case ACTION_TYPES.TOGGLE_ROSTER_FORMATTING: {
      return { ...state, formattingRoster: !state.formattingRoster };
    }
    case ACTION_TYPES.TOGGLE_SCORE_FORMATTING: {
      return { ...state, formattingScoring: !state.formattingScoring };
    }
    case ACTION_TYPES.UNDO_LAST: {
      return undoLast(state);
    }
    case ACTION_TYPES.UNDO_PICK: {
      return undoPick(state, action.pick);
    }
    default:
      return state;
  }
};
