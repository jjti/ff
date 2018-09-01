import { IPlayer } from '../../Player';
import { IPick } from '../../Team';
import { ACTION_TYPES } from './index';

/**
 * Create an action for adding a player to a team
 *
 * @param the player that was picked
 */
export const pickPlayer = (player: IPlayer) => ({
  player,
  type: ACTION_TYPES.PICK_PLAYER
});

/**
 * undoes the last player pick
 */
export const undoPlayerPick = (pick?: IPick | null) => ({
  pick,
  type: ACTION_TYPES.UNDO_PICK_PLAYER
});

/**
 * Update the team to focus on on the left hand side of the page
 * @param trackedTeam the index of the team of focus on on the left
 */
export const setTrackedTeam = (trackedTeam: number) => ({
  trackedTeam,
  type: ACTION_TYPES.SET_TRACKED_TEAM
});

/**
 * Skip this term, increment the draftIndex and, if necessary, direction
 */
export const incrementDraft = () => ({
  type: ACTION_TYPES.INCREMENT_DRAFT
});

/**
 * Set the new number of teams in the store
 */
export const setNumberOfTeams = (numberOfTeams: number) => ({
  numberOfTeams,
  type: ACTION_TYPES.SET_NUMBER_OF_TEAMS
});

/**
 * Update the current team in the draft
 * @param activeTeam new current team index
 */
export const setActiveTeam = (activeTeam: number) => ({
  activeTeam,
  type: ACTION_TYPES.SET_ACTIVE_TEAM
});

/**
 * Toggle roster formatting. will open a modal for selecting number
 * at each position
 */
export const toggleRosterFormatting = () => ({
  type: ACTION_TYPES.TOGGLE_ROSTER_FORMATTING
});
