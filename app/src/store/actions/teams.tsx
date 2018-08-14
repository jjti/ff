import { IPlayer } from "../../Player";
import { ACTION_TYPES } from "./index";

/**
 * Create an action for adding a player to a team
 *
 * @param the player that was picked
 */
export const pickPlayer = (player: IPlayer) => ({
  player,
  type: ACTION_TYPES.PICK_PLAYER
});

export const setTrackedTeam = (teamIndex: number) => ({
  teamIndex,
  type: ACTION_TYPES.SET_TRACKED_TEAM
});
