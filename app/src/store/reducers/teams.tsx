import * as React from 'react';
import { toast } from 'react-toastify';
import { IPlayer } from '../../models/Player';
import { IPick, ITeam } from '../../models/Team';
import { undoPick } from '../actions/teams';
import { createTeam, initialState, IStoreState, store } from '../store';
import { updatePlayerVORs } from './players';

/**
 * calculate the "active team", that is, the index of the next
 * team to be picking, based on the currentPick
 *
 * we're assuming a snake draft, so it's pretty trivial to calculate
 */
export const setActiveTeam = (state: IStoreState): IStoreState => {
  const { currentPick, numberOfTeams } = state;
  let { activeTeam } = state;

  if (Math.floor(currentPick / numberOfTeams) % 2 === 0) {
    activeTeam = currentPick % numberOfTeams;
  } else {
    activeTeam = numberOfTeams - (currentPick % numberOfTeams) - 1;
  }

  return { ...state, activeTeam };
};

/**
 * Increment the draft to the next round
 * @param state
 */
export const incrementDraft = (state: IStoreState): IStoreState =>
  setActiveTeam({
    ...state,
    currentPick: state.currentPick + 1
  });

/**
 * Don't pick any player, simply skip this draft pick
 */
export const skipPick = (state: IStoreState): IStoreState => {
  return incrementDraft({
    ...state,
    pastPicks: [
      { player: null, pickNumber: state.currentPick, team: state.activeTeam },
      ...state.pastPicks
    ]
  });
};

/**
 * add a plyer to a given team/roster
 */
const addPlayerToTeam = (player: IPlayer, team: ITeam): ITeam => {
  const emptySpot = team[player.pos].findIndex((p: IPlayer) => p === null);
  const emptyFLEXSpot = team.FLEX.findIndex(p => p === null);
  const emptyBenchSpot = team.BENCH.findIndex(b => b === null);
  if (emptySpot > -1) {
    // there's an empty spot in this position
    team[player.pos] = team[player.pos].map(
      (p: IPlayer, i: number) => (i === emptySpot ? player : p)
    );
  } else if (
    ['RB', 'WR', 'TE'].indexOf(player.pos) > -1 &&
    emptyFLEXSpot > -1
  ) {
    // it's a FLEX position, check if there are any flex positions left
    team.FLEX = team.FLEX.map((p, i) => (i === emptyFLEXSpot ? player : p));
  } else {
    if (emptyBenchSpot > -1) {
      team.BENCH = team.BENCH.map(
        (b, i) => (i === emptyBenchSpot ? player : b)
      );
    } else {
      team.BENCH = team.BENCH.concat([player]);
    }
  }
  return team;
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
  const { activeTeam, currentPick, undraftedPlayers } = state;
  let { teams } = state;

  // try and add the player to the team roster, respecting the limit at each position
  teams = [
    ...teams.slice(0, activeTeam),
    addPlayerToTeam(player, teams[activeTeam]),
    ...teams.slice(activeTeam + 1)
  ];

  // create this latest pick object (for future reversion)
  const thisPick = { player, team: activeTeam, pickNumber: currentPick };

  // create the new state
  const newState = {
    ...state,

    // increment the draft by one
    ...incrementDraft(state),

    // update teams with the modified roster
    teams,

    // remove the picked player
    undraftedPlayers: undraftedPlayers.filter(
      (p: IPlayer) => !(p.name === player.name && p.pos === player.pos)
    ),

    // add this pick to the history of picks
    pastPicks: [thisPick, ...state.pastPicks],

    // save this player as the "lastPickedPlayer"
    lastPickedPlayer: player
  };

  // create a toast
  toast.info(
    <>
      <div>Drafted {player.name}</div>
      <button
        className="Toast-Undo-Button"
        onClick={() => store.dispatch(undoPick(thisPick))}>
        Undo
      </button>
    </>
  );

  return newState;
};

/**
 * Update the pick in the store, it's been changed somehow
 *
 * @param pick the pick to be updated
 */
export const setPick = (
  state: IStoreState,
  updatedPick: IPick
): IStoreState => {
  const { teams } = state;
  return {
    ...state,
    pastPicks: state.pastPicks.reduce(
      (acc: IPick[], pick: IPick) =>
        pick.pickNumber === updatedPick.pickNumber
          ? [...acc, updatedPick]
          : [...acc, pick],
      []
    ),
    teams: updatedPick.player
      ? [
          ...teams.slice(0, updatedPick.team),
          addPlayerToTeam(updatedPick.player, teams[updatedPick.team]),
          ...teams.slice(updatedPick.team + 1)
        ]
      : teams
  };
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
