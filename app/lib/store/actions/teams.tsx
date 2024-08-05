import { IPlayer } from '../../models/Player';
import { IPick } from '../../models/Team';
import { ACTION_TYPES } from './index';

/**
 * Create an action for adding a player to a team
 *
 * @param the player that was picked
 */
export const pickPlayer = (player: IPlayer) => ({
  player,
  type: ACTION_TYPES.PICK_PLAYER,
});

/**
 * Like pickPlayer, but not on the currentPick.
 * Instead, update a given pick that should already be in state/store
 */
export const setPick = (pick: IPick) => ({
  pick,
  type: ACTION_TYPES.SET_PICK,
});

/**
 * Skip this active round, couldn't find drafted player
 */
export const skipPick = () => ({
  type: ACTION_TYPES.SKIP_PICK,
});

/**
 * undoes the last pick/skip
 */
export const undoLast = () => ({
  type: ACTION_TYPES.UNDO_LAST,
});

/**
 * undoes the a given pick, may not be the last one
 */
export const undoPick = (pick: IPick) => ({
  pick,
  type: ACTION_TYPES.UNDO_PICK,
});

/**
 * Update the team to focus on on the left hand side of the page
 * @param trackedTeam the index of the team of focus on on the left
 */
export const setTrackedTeam = (trackedTeam: number) => ({
  trackedTeam,
  type: ACTION_TYPES.SET_TRACKED_TEAM,
});

/**
 * Skip this term, increment the draftIndex and, if necessary, direction
 */
export const incrementDraft = () => ({
  type: ACTION_TYPES.INCREMENT_DRAFT,
});

/**
 * Set the new number of teams in the store
 */
export const setNumberOfTeams = (numberOfTeams: number) => ({
  numberOfTeams,
  type: ACTION_TYPES.SET_NUMBER_OF_TEAMS,
});

/**
 * Update the current team in the draft
 * @param activeTeam new current team index
 */
export const setActiveTeam = (activeTeam: number) => ({
  activeTeam,
  type: ACTION_TYPES.SET_ACTIVE_TEAM,
});

/**
 * Update a specific team's name 
 * @param teamIndex index of the team you want to update
 * @param name new team name
 */
export const setTeamName = (teamIndex: number, name: string) => ({
  teamIndex,
  name,
  type: ACTION_TYPES.SET_TEAM_NAME,
})

/**
 * Toggle roster formatting. will open a modal for selecting number at each position
 */
export const toggleRosterFormatting = () => ({
  type: ACTION_TYPES.TOGGLE_ROSTER_FORMATTING,
});

/**
 * Toggle roster formatting. will open a modal for selecting number at each position
 */
export const toggleTeamNameUpdates = () => ({
  type: ACTION_TYPES.TOGGLE_TEAM_NAME_UPDATES,
});
