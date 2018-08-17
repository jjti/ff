import { IPlayer } from "../../Player";
import { IStoreState } from "../store";

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
): IStoreState => ({
  ...state,
  past: state,
  undraftedPlayers: state.undraftedPlayers.filter(
    p => p.name === player.name && p.pos === player.pos
  )
});
