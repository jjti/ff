import { toast } from "react-toastify";

import { IPlayer } from "../../Player";
import { IStoreState } from "../store";
import { resetStore } from "./teams";

export const getPlayers = (state: IStoreState) => state.undraftedPlayers;

/**
 * Remove the player from the store and the players array
 * Update the past history
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

export const undoPlayerPick = (state: IStoreState): IStoreState => {
  const { past } = state;

  if (state.lastPickedPlayer) {
    toast.info(`Undrafted ${state.lastPickedPlayer.name}`);
  }

  return past || resetStore(state); // if it's null, reset and return
};
