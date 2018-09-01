import * as React from 'react';
import { toast } from 'react-toastify';

import { IPlayer } from '../../Player';
import { ITeam } from '../../Team';
import { undoPlayerPick } from '../actions/players';
import { createTeam, initialState, IStoreState, store } from '../store';
import { updatePlayerVORs } from './players';

/**
 * Sum of the VOR of everyone on a ITeam. Used to keep track of
 * how the draft is going
 *
 * @param team the team whose VOR we're trying to sum
 */
const sumStarterValues = ({ QB, RB, WR, TE, FLEX, DST, K }: ITeam): number => {
  return [...QB, ...RB, ...WR, ...TE, ...FLEX, ...DST, ...K].reduce(
    (acc, p) => (p && p.vor ? acc + p.vor : acc),
    0
  );
};

/**
 * Increment the draft to the next round
 * @param state
 */
export const incrementDraft = (state: IStoreState): IStoreState => {
  const { activeTeam, currentPick, draftDirection, numberOfTeams } = state;

  // find what the next ActiveTeam is
  let newActiveTeam = activeTeam;
  let newDraftDirection = draftDirection;
  if (draftDirection === 1) {
    // we're moving left-to-right
    if (activeTeam === numberOfTeams - 1) {
      // now we're going other direction, but not changing current team
      newDraftDirection = -1;
    } else {
      newActiveTeam++; // move one more to the right
    }
  } else {
    // we're moving right-to-left
    if (activeTeam === 0) {
      // no we're going other direction, but not changing current team yet
      newDraftDirection = 1;
    } else {
      newActiveTeam--;
    }
  }

  return {
    ...state,

    // update the activeTeam, currentPick and draftDirection
    activeTeam: newActiveTeam,
    currentPick: currentPick + 1,
    draftDirection: newDraftDirection
  };
};

/**
 * Remove the player from the players.store, add it to the team,
 * and increment the activeTeam
 *
 * @param state team state
 */
export const pickPlayer = (
  state: IStoreState,
  player: IPlayer
): IStoreState => {
  const { undraftedPlayers, activeTeam, teams } = state;

  // try and add the player to the team roster, respecting the limit at each position
  const newTeams = teams.map(t => ({ ...t }));
  const roster: ITeam = { ...newTeams[activeTeam] };

  const emptySpot = roster[player.pos].findIndex((p: IPlayer) => p === null);
  const emptyFLEXSpot = roster.FLEX.findIndex(p => p === null);
  const emptyBenchSpot = roster.BENCH.findIndex(b => b === null);
  if (emptySpot > -1) {
    // there's an empty spot in this position
    roster[player.pos] = roster[player.pos].map(
      (p: IPlayer, i: number) => (i === emptySpot ? player : p)
    );
  } else if (
    ['RB', 'WR', 'TE'].indexOf(player.pos) > -1 &&
    emptyFLEXSpot > -1
  ) {
    // it's a FLEX position, check if there are any flex positions left
    roster.FLEX = roster.FLEX.map((p, i) => (i === emptyFLEXSpot ? player : p));
  } else {
    if (emptyBenchSpot > -1) {
      roster.BENCH = roster.BENCH.map(
        (b, i) => (i === emptyBenchSpot ? player : b)
      );
    } else {
      roster.BENCH = roster.BENCH.concat([player]);
    }
  }
  roster.StarterValue = sumStarterValues(roster);

  // update the team in the array
  newTeams[activeTeam] = roster;

  // create the new state
  const newState = {
    ...state,

    // increment the draft by one
    ...incrementDraft(state),

    // update teams with the modified roster
    teams: newTeams,

    // remove the picked player
    undraftedPlayers: undraftedPlayers.filter(
      (p: IPlayer) => !(p.name === player.name && p.pos === player.pos)
    ),

    // add this previous state to the past
    past: state,

    // save this player as the "lastPickedPlayer"
    lastPickedPlayer: player
  };

  // create a toast
  toast.info(
    <>
      <div>Drafted {player.name}</div>
      <button
        className="Toast-Undo-Button"
        onClick={() => store.dispatch(undoPlayerPick())}>
        Undo
      </button>
    </>
  );

  return newState;
};

/**
 * "reset" the store, resettting the undraftedPlayers
 * @param state state to be reset
 */
export const resetStore = (state: IStoreState): IStoreState =>
  updatePlayerVORs({
    ...initialState,
    players: state.players
  });

/**
 * Update the tracked team on the left side of the app
 *
 * @param state Store State
 * @param trackedTeam The index of the team, in the teams array, to be "tracked"
 *  on the left side of the app
 */
export const setTrackedTeam = (
  state: IStoreState,
  trackedTeam: number
): IStoreState => {
  // create a toast
  if (trackedTeam !== state.trackedTeam) {
    toast.info(`Viewing Team ${trackedTeam + 1}`);
  }

  return {
    ...state,
    trackedTeam
  };
};

/**
 * If we're not done with the first round yet, update the number of teams
 * and recalculate VOR for the players. Find the number of expected players drafted
 * at each position within 10 rounds, use that to estimate replacementValue,
 * and update player VOR accordingly (then sort)
 *
 * If we are done with the first round, error out. This shouldn't be called
 *
 * @param state current Store State
 * @param numberOfTeams the new number of teams
 */
export const setNumberOfTeams = (
  state: IStoreState,
  numberOfTeams: number
): IStoreState => {
  const {
    currentPick,
    numberOfTeams: currNumberOfTeams,
    rosterFormat,
    teams,
    trackedTeam
  } = state;

  // don't change anything if we're already done with a round
  if (currentPick > currNumberOfTeams) {
    throw new Error(
      'Cannot change the number of teams after a round has already completed'
    );
  }

  // don't change anything if the new number of teams will be less than
  // the number of teams that have already picked
  if (currentPick > numberOfTeams) {
    throw new Error(
      'Cannot change number of teams to less than the number that have already drafted players'
    );
  }

  // don't change anything if the number of teams isn't going to change
  if (currNumberOfTeams === numberOfTeams) {
    return state; // change nothing
  }

  // update the number of teams
  let newTeams = teams;
  if (numberOfTeams > currNumberOfTeams) {
    // add new teams so we have enough empty teams
    newTeams = newTeams.concat(
      new Array(numberOfTeams - currNumberOfTeams)
        .fill(null)
        .map(() => createTeam(rosterFormat))
    );
  } else {
    // cleave off the extra teams that are no longer needed
    newTeams = newTeams.slice(0, numberOfTeams);
  }

  // if number of tracked teams is less than index of currently tracked team,
  // set new tracked team to max team index
  let newTrackedTeam = trackedTeam;
  if (trackedTeam > numberOfTeams - 1) {
    newTrackedTeam = numberOfTeams - 1;
  }

  // create a toast
  toast.info(`VOR updated for ${numberOfTeams} teams`);

  // build up whole state minus updated VOR stats
  const newState = {
    ...state,
    numberOfTeams,
    teams: newTeams,
    trackedTeam: newTrackedTeam
  };

  return updatePlayerVORs(newState);
};
