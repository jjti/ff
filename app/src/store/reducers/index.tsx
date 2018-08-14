import { ITeam } from "../../Team";
import { ACTION_TYPES } from "../actions";
import { pickPlayer, undoPlayerPick } from "./teams";

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
  past: null,
  players: [],
  teams: new Array(10).fill(0).map(() => emptyTeam()), // doing 10 empty teams by default
  trackedTeam: 0, // team to track in TeamPicks
  undraftedPlayers: []
};

export default (state = initialState, action: any) => {
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
    default:
      return state;
  }
};
