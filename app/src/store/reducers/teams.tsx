import * as React from "react";
import { toast } from "react-toastify";

import { IPlayer, Position } from "../../Player";
import { ITeam } from "../../Team";
import { undoPlayerPick } from "../actions/players";
import {
  createTeam,
  initialRoster,
  initialState,
  IStoreState,
  store
} from "../store";

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
    ["RB", "WR", "TE"].indexOf(player.pos) > -1 &&
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
        onClick={() => store.dispatch(undoPlayerPick())}
      >
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
const updateVOR = (state: IStoreState): IPlayer[] => {
  const { numberOfTeams, ppr, rosterFormat } = state;
  let { players } = state;

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

  if (ppr) {
    adp += "PPR";
  } else {
    adp += "STN";
  }

  // update player adp to whatever it is in an equivelant league size
  players = players
    .map(p => ({ ...p, adp: p[adp] }))
    .filter(p => (ppr ? p.predictionPPR : p.predictionSTN));

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

  // because #1 is based on a default league, with 1QB, 2RBs, etc, we need
  // to account for specialty leagues where the numbers differ. We crudishly
  // do that here, by comparing the number of players in the current roster to
  // a "default" roster and multiplying the number of drafted players in that position
  // accordingly
  Object.keys(initialRoster)
    .filter(k => positionToCountMap[k])
    .forEach(pos => {
      const newCountRatioIncr = rosterFormat[pos] / initialRoster[pos];
      positionToCountMap[pos] = Math.round(
        positionToCountMap[pos] * newCountRatioIncr
      );
    });

  // #2, find replacement values at each position by finding the predicted points
  //     at 1+the number of expected players in that position drafted within 10 rounds
  // filter by position, sort descending by prediction points, and get the number of points by the replacement player
  // map positions to their replacement values
  const positionToReplaceValueMap = positions.reduce(
    (acc, pos) => ({
      ...acc,
      [pos]: players
        .filter(p => p.pos === pos)
        .sort(
          (a, b) =>
            ppr
              ? b.predictionPPR - a.predictionPPR
              : b.predictionSTN - a.predictionSTN
        )[positionToCountMap[pos]][ppr ? "predictionPPR" : "predictionSTN"]
    }),
    {}
  );

  // #3, update players' VORs
  const newPlayers = players.map(p => ({
    ...p,
    vor:
      (ppr ? p.predictionPPR : p.predictionSTN) -
      positionToReplaceValueMap[p.pos]
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
  undraftedPlayers: updateVOR(state)
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
    rosterFormat,
    teams,
    trackedTeam
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
