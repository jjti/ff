import { IPlayer } from "../../Player";
import { ACTION_TYPES } from "./index";

/**
 * Set the list of players in the store
 *
 * @param playerList The list of ranked players
 */
export const setPlayers = (playerList: IPlayer[]) => ({
  players: playerList,
  type: ACTION_TYPES.SET_PLAYERS
});

export const removePlayer = (player: IPlayer) => ({
  player,
  type: ACTION_TYPES.REMOVE_PLAYER
});

/**
 * undoes the last player pick
 */
export const undoPlayerPick = () => ({
  type: ACTION_TYPES.UNDO_PICK_PLAYER
});

/**
 * Select a player, highlighting it in the table.
 * Is done to check for schedule duplications
 * @param player the player to "select" or highlight
 */
export const selectPlayer = (player: IPlayer) => ({
  player,
  type: ACTION_TYPES.SELECT_PLAYER
});
