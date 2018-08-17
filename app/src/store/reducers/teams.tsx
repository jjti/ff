import { toast } from "react-toastify";

import { initialState } from ".";
import { IPlayer } from "../../Player";
import { ITeam } from "../../Team";
import { IStoreState } from "../store";

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
  ].reduce((acc, p) => (p ? acc + p.vor : acc), 0);
};

/**
 * Increment the draft to the next round
 * @param state
 */
export const incrementDraft = (state: IStoreState): IStoreState => {
  const { activeTeam, draftDirection } = state;

  // find what the next ActiveTeam is
  let newActiveTeam = activeTeam;
  let newDraftDirection = draftDirection;
  if (draftDirection === 1) {
    // we're moving left-to-right
    if (activeTeam === 9) {
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

    // update the activeTeam and draftDirection
    activeTeam: newActiveTeam,
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

  // create a toast
  toast.info(`Team ${activeTeam + 1} drafted ${player.name}`);

  return {
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
    past: state
  };
};

/**
 * Reset the store to its initial state, but keep the players
 * that were gathered from the backend
 *
 * @param state the current state of the store
 */
export const resetStore = (state: IStoreState): IStoreState => ({
  ...initialState,
  players: state.players,
  undraftedPlayers: state.players
});

/**
 * Return the state of the app back in time
 *
 * @param state of the current app
 */
export const undoPlayerPick = (state: IStoreState): IStoreState => {
  const { past } = state; // we want the last state
  return past || resetStore(state); // if it's null, reset and return
};

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
  toast.info(`Now tracking Team ${trackedTeam + 1}`);

  return {
    ...state,
    trackedTeam
  };
};
