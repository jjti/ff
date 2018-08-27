import { toast } from "react-toastify";

import { IPlayer } from "../../Player";
import { IRoster } from "../../Team";
import { createTeam, IStoreState } from "../store";
import { resetStore, updatePlayerVORs } from "./teams";

export const getPlayers = (state: IStoreState) => state.undraftedPlayers;

/**
 * Remove the player from the store and the players array
 * Update the past history
 *
 * @param state
 * @param player
 */
export const removePlayer = (
  state: IStoreState,
  player: IPlayer
): IStoreState => {
  // create a toast
  toast.info(`Removed ${player.name}`);

  return {
    ...state,
    past: state,
    undraftedPlayers: state.undraftedPlayers.filter(
      p => !(p.name === player.name && p.pos === player.pos)
    )
  };
};

/**
 * Undo the last player selection by setting state to its past state object
 * TODO: make this a diff, kind of memory intense
 *
 * @param state state from current turn, about to be undone
 */
export const undoPlayerPick = (state: IStoreState): IStoreState => {
  const { past } = state;

  if (state.lastPickedPlayer) {
    toast.info(`Undrafted ${state.lastPickedPlayer.name}`);
  }

  return past || resetStore(state); // if it's null, reset and return
};

/**
 * Change the default roster format, changing number of QBs, RBs, etc
 * Will involve recalculating VORs
 *
 * @param state state before roster format update
 */
export const setRosterFormat = (
  state: IStoreState,
  newRosterFormat: IRoster
): IStoreState =>
  updatePlayerVORs({
    ...state,
    rosterFormat: newRosterFormat,
    teams: new Array(state.numberOfTeams)
      .fill(null)
      .map(() => createTeam(newRosterFormat))
  });
