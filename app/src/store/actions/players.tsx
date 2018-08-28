import { toast } from "react-toastify";

import { IPlayer } from "../../Player";
import { IRoster } from "../../Team";
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

/**
 * Remove a player from the list of those remaining
 * @param player the player to be removed
 */
export const removePlayer = (player: IPlayer) => ({
  player,
  type: ACTION_TYPES.REMOVE_PLAYER
});

/**
 * "Reset" the draft, restoring initial player state
 */
export const resetDraft = () => {
  toast.info("Draft was reset");

  return {
    type: ACTION_TYPES.RESET_DRAFT
  };
};

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

/**
 * Change the roster format
 */
export const setRosterFormat = (rosterFormat: IRoster) => ({
  rosterFormat,
  type: ACTION_TYPES.SET_ROSTER_FORMAT
});

/**
 * Change whether we're judging players in PPR or Standard league
 */
export const togglePPR = () => ({
  type: ACTION_TYPES.TOGGLE_PPR
});
