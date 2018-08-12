import { ITeam } from "../../Team";
import { ACTION_TYPES } from "../actions";
import { pickPlayer } from "./teams";

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
  activeTeam: 0, // active team's index ([0-9])
  draftDirection: 1, // either 1 (forward) or -1 (reverse)
  players: [],
  // doing 10 empty teams by default
  teams: new Array(10).fill(null).map(() => emptyTeam())
};

export default (state = initialState, action: any) => {
  switch (action.type) {
    case ACTION_TYPES.SET_PLAYERS: {
      return { ...state, players: action.players };
    }
    case ACTION_TYPES.PICK_PLAYER: {
      return pickPlayer(state, action.player);
    }
    default:
      return state;
  }
};
