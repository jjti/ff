import { toast } from 'react-toastify';
import { IPlayer } from '../../models/Player';
import { IPick, ITeam } from '../../models/Team';
import { createTeam, initialState, IStoreState } from '../store';
import { setPlayers, updatePlayerVORs } from './players';

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
 */
export const incrementDraft = (state: IStoreState): IStoreState =>
  setActiveTeam({
    ...state,
    currentPick: state.currentPick + 1,
  });

/**
 * Don't pick any player, simply skip this draft pick
 */
export const skipPick = (state: IStoreState): IStoreState => {
  return incrementDraft({
    ...state,
    picks: [{ player: null, pickNumber: state.currentPick, team: state.activeTeam }, ...state.picks],
  });
};

/**
 * add a player to a given team/roster
 */
const addPlayerToTeam = (player: IPlayer, team: ITeam): ITeam => {
  const emptySpot = team[player.pos].findIndex((p: IPlayer) => p === null);
  const emptyFlexSpot = team.FLEX.findIndex((p) => p === null);
  const emptySuperflexSpot = team.SUPERFLEX.findIndex((p) => p === null);
  const emptyBenchSpot = team.BENCH.findIndex((b) => b === null);

  if (emptySpot > -1) {
    // there's an empty spot in this position
    team[player.pos] = team[player.pos].map((p: IPlayer, i: number) => (i === emptySpot ? player : p));
  } else if (['RB', 'WR', 'TE'].indexOf(player.pos) > -1 && emptyFlexSpot > -1) {
    // it's a FLEX position, check if there are any flex positions left
    team.FLEX = team.FLEX.map((p, i) => (i === emptyFlexSpot ? player : p));
  } else if (['QB', 'RB', 'WR', 'TE'].indexOf(player.pos) > -1 && emptySuperflexSpot > -1) {
    // it's a FLEX position, check if there are any flex positions left
    team.SUPERFLEX = team.SUPERFLEX.map((p, i) => (i === emptySuperflexSpot ? player : p));
  } else {
    if (emptyBenchSpot > -1) {
      team.BENCH = team.BENCH.map((b, i) => (i === emptyBenchSpot ? player : b));
    } else {
      team.BENCH = team.BENCH.concat([player]);
    }
  }
  return team;
};

/**
 * Remove the player from the players.store, add it to the team,
 * and increment the activeTeam
 */
export const pickPlayer = (state: IStoreState, player: IPlayer): IStoreState => {
  const { activeTeam, currentPick, undraftedPlayers } = state;
  let { teams } = state;

  // try and add the player to the team roster, respecting the limit at each position
  teams = [...teams.slice(0, activeTeam), addPlayerToTeam(player, teams[activeTeam]), ...teams.slice(activeTeam + 1)];

  // create this latest pick object (for future reversion)
  const thisPick = { player, team: activeTeam, pickNumber: currentPick };

  return {
    ...state,

    // increment the draft by one
    ...incrementDraft(state),

    // update teams with the modified roster
    teams,

    // remove the picked player
    undraftedPlayers: undraftedPlayers.filter((p: IPlayer) => !(p.name === player.name && p.pos === player.pos)),

    // add this pick to the history of picks
    picks: [thisPick, ...state.picks],

    // save this player as the "lastPickedPlayer"
    lastPickedPlayer: player,
  };
};

/**
 * Update the pick in the store, it's been changed somehow
 */
export const setPick = (state: IStoreState, updatedPick: IPick): IStoreState => {
  const { teams } = state;
  return {
    ...state,
    picks: state.picks.reduce(
      (acc: IPick[], pick: IPick) =>
        pick.pickNumber === updatedPick.pickNumber ? [...acc, updatedPick] : [...acc, pick],
      []
    ),
    teams: updatedPick.player
      ? [
          ...teams.slice(0, updatedPick.team),
          addPlayerToTeam(updatedPick.player, teams[updatedPick.team]),
          ...teams.slice(updatedPick.team + 1),
        ]
      : teams,
  };
};

/**
 * "reset" the store, resetting the undraftedPlayers
 */
export const resetStore = (store: IStoreState) => setPlayers(initialState, store.lastSyncPlayers);

/**
 * Update the tracked team on the left side of the app
 */
export const setTrackedTeam = (state: IStoreState, trackedTeam: number): IStoreState => {
  // create a toast
  if (trackedTeam !== state.trackedTeam) {
    toast.info(`Tracking Team ${trackedTeam + 1}`);
  }

  return { ...state, trackedTeam };
};

/**
 * Update the number of teams and recalculate VOR for the players.
 */
export const setNumberOfTeams = (state: IStoreState, numberOfTeams: number): IStoreState => {
  const { picks, rosterFormat, trackedTeam } = state;

  // create new teams with empty rosters
  let newTeams = new Array(numberOfTeams).fill(0).map(() => createTeam(rosterFormat));

  // given the new team count, update each pick and destination team
  const newPicks: IPick[] = [];
  [...picks].reverse().forEach((p, i) => {
    let dstTeam = 0;
    if (Math.floor(i / numberOfTeams) % 2 === 0) {
      dstTeam = i % numberOfTeams;
    } else {
      dstTeam = numberOfTeams - (i % numberOfTeams) - 1;
    }

    newPicks.push({
      ...p,
      team: dstTeam,
    });
    newTeams[dstTeam] = addPlayerToTeam(p.player as IPlayer, newTeams[dstTeam]);
  });

  // if number of tracked teams is less than index of currently tracked team,
  // set new tracked team to max team index
  let newTrackedTeam = trackedTeam;
  if (trackedTeam > numberOfTeams - 1) {
    newTrackedTeam = numberOfTeams - 1;
  }

  // build up whole state minus updated VOR stats
  return setActiveTeam(
    updatePlayerVORs({
      ...state,
      numberOfTeams,
      picks: newPicks.reverse(),
      teams: newTeams,
      trackedTeam: newTrackedTeam,
    })
  );
};
