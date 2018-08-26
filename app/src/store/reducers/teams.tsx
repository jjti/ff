import * as React from "react";
import { toast } from "react-toastify";

import { IPlayer, Position } from "../../Player";
import { ITeam } from "../../Team";
import { undoPlayerPick } from "../actions/players";
import { createTeam, initialState, IStoreState, store } from "../store";

/**
 * Sum of the VOR of everyone on a ITeam. Used to keep track of
 * how the draft is going
 *
 * @param team the team whose VOR we're trying to sum
 */
const sumStarterValues = (team: ITeam): number => {
  return [
    team.QB,
    ...team.RBs,
    ...team.WRs,
    team.TE,
    team.Flex,
    team.DST,
    team.K
  ].reduce((acc, p) => (p && p.vor ? acc + p.vor : acc), 0);
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
  const emptyBenchSpot = roster.Bench.findIndex(b => b === null);
  const addToBench = () => {
    if (emptyBenchSpot > -1) {
      roster.Bench = roster.Bench.map(
        (b, i) => (i === emptyBenchSpot ? player : b)
      );
    } else {
      roster.Bench = roster.Bench.concat([player]);
    }
  };
  switch (player.pos) {
    case "QB":
    case "DST":
    case "K": {
      // positions with just one player in the position
      if (!roster[player.pos]) {
        roster[player.pos] = player;
      } else {
        roster.Bench[emptyBenchSpot] = player;
      }
      break;
    }
    case "RB": {
      const emptyRBSpot = roster.RBs.findIndex(rb => rb === null);
      if (emptyRBSpot > -1) {
        // there's an empty RB spot on the roster, insert
        roster.RBs = roster.RBs.map((r, i) => (i === emptyRBSpot ? player : r));
      } else if (!roster.Flex) {
        // flex is still empty
        roster.Flex = player;
      } else {
        addToBench();
      }
      break;
    }
    case "WR": {
      const emptyWRSpot = roster.WRs.findIndex(wr => wr === null);
      if (emptyWRSpot > -1) {
        // there's an empty WR spot on the roster, insert
        roster.WRs = roster.WRs.map((w, i) => (i === emptyWRSpot ? player : w));
      } else if (!roster.Flex) {
        // flex is still empty
        roster.Flex = player;
      } else {
        addToBench();
      }
      break;
    }
    case "TE": {
      if (!roster.TE) {
        roster.TE = player;
      } else if (!roster.Flex) {
        roster.Flex = player;
      } else {
        addToBench();
      }
      break;
    }
    default: {
      throw new Error("Unrecognized position!");
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
      <div>
        Team {activeTeam + 1} drafted {player.name}
      </div>
      <button
        className="Toast-Undo-Button"
        onClick={() => store.dispatch(undoPlayerPick())}
      >
        Undo
      </button>
    </>
  );

  return newState;
};

export const resetStore = (state: IStoreState): IStoreState => ({
  ...initialState,
  players: state.players,
  undraftedPlayers: state.players
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
  toast.info(`Tracking Team ${trackedTeam + 1}`);

  return {
    ...state,
    trackedTeam
  };
};

/**
 * recalculate VOR for the players.
 *
 * #1: find the number of players, at each position, drafted by the 10th round
 *    in leagues with this many players. Can estimate with ADP from ESPN
 * #2: find the replacementValue for each position, by using the index from #1 + 1
 * #3: update each player's VOR using their predicted number of points minus their replacementValue
 * #4: sort the players by their VOR
 * @param players
 * @param numberOfTeams
 */
const updateVOR = (players: IPlayer[], numberOfTeams: number): IPlayer[] => {
  const positions: Position[] = ["QB", "RB", "WR", "TE", "DST", "K"];

  // we have 4 adp rankings from fantasyfootballcalculator. they're stored
  // in player properties adp8, adp10, adp12, and adp14
  let adp = "adp10";
  if (numberOfTeams <= 8) {
    adp = "adp8";
  } else if (numberOfTeams > 10 && numberOfTeams <= 12) {
    adp = "adp12";
  } else if (numberOfTeams > 12) {
    adp = "adp14";
  }

  // update player adp to whatever it is in an equivelant draft
  players = players.map(p => ({ ...p, adp: p[adp] })).filter(p => p.prediction);

  // #1, find replacement player index for each position
  // map each position to the number of players drafted before the lastPick
  const positionToCountMap = positions.reduce(
    (acc, pos) => ({
      ...acc,
      [pos]: players.filter(
        p => p.pos === pos && p.adp && p.adp < numberOfTeams * 10
      ).length
    }),
    {}
  );

  // #2, find replacement values at each position by finding the predicted points
  //     at 1+the number of expected players in that position drafted within 10 rounds
  // filter by position, sort descending by prediction points, and get the number of points by the replacement player
  // map positions to their replacement values
  const positionToReplaceValueMap = positions.reduce(
    (acc, pos) => ({
      ...acc,
      [pos]: players
        .filter(p => p.pos === pos)
        .sort((a, b) => b.prediction - a.prediction)[positionToCountMap[pos]]
        .prediction
    }),
    {}
  );

  // #3, update players' VORs
  const newPlayers = players.map(p => ({
    ...p,
    vor: p.prediction - positionToReplaceValueMap[p.pos]
  }));

  // #4, sort by their VOR
  const valuablePlayers = newPlayers.filter(p => !isNaN(p.vor));
  const unvaluablePlayers = newPlayers.filter(p => isNaN(p.vor));
  return valuablePlayers
    .sort((a, b) => b.vor - a.vor)
    .concat(unvaluablePlayers);
};

/**
 * Update the VOR for all the players not yet drafted. Is dependent on
 * the number of teams currently in the draft
 *
 * @param state the current store state
 */
export const updatePlayerVORs = (state: IStoreState): IStoreState => ({
  ...state,
  undraftedPlayers: updateVOR(state.undraftedPlayers, state.numberOfTeams)
});

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
    players,
    teams
  } = state;

  // don't change anything if we're already done with a round
  if (currentPick > currNumberOfTeams) {
    throw new Error(
      "Cannot change the number of teams after a round has already completed"
    );
  }

  // don't change anything if the new number of teams will be less than
  // the number of teams that have already picked
  if (currentPick > numberOfTeams) {
    throw new Error(
      "Cannot change number of teams to less than the number that have already drafted players"
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
        .map(() => createTeam())
    );
  } else {
    // cleave off the extra teams that are no longer needed
    newTeams = newTeams.slice(0, numberOfTeams);
  }

  return {
    ...state,
    numberOfTeams,
    teams: newTeams,
    undraftedPlayers: updateVOR(players, numberOfTeams)
  };
};
