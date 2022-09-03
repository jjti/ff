import { toast } from 'react-toastify';
import { IPlayer } from '../../models/Player';
import { IRoster } from '../../models/Team';
import { ACTION_TYPES } from './index';

/**
 * Set the list of players in the store
 */
export const setPlayers = (players: IPlayer[]) => ({
  players,
  type: ACTION_TYPES.SET_PLAYERS,
});

/**
 * Remove a player from the list of those remaining
 */
export const removePlayer = (player: IPlayer) => ({
  player,
  type: ACTION_TYPES.REMOVE_PLAYER,
});

/**
 * "Reset" the draft, restoring initial player state
 */
export const resetDraft = () => {
  toast.warn('Draft reset');

  return {
    type: ACTION_TYPES.RESET_DRAFT,
  };
};

/**
 * Change the roster format
 */
export const setRosterFormat = (rosterFormat: IRoster) => ({
  rosterFormat,
  type: ACTION_TYPES.SET_ROSTER_FORMAT,
});
