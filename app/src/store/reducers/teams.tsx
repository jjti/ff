import { IPlayer } from "../../Player";
import { ITeam } from "../../Team";
import { StoreState } from "../store";

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
 * Remove the player from the players.store, add it to the team,
 * and increment the activeTeam
 *
 * @param state team state
 */
export const pickPlayer = (state: StoreState, player: IPlayer) => {
  const { players, activeTeam, draftDirection, teams } = state;

  // try and add the player to the team roster, respecting the limit at each position
  const roster: ITeam = { ...teams[activeTeam] };
  const emptyBenchSpot = roster.Bench.findIndex(b => b === null);
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
        roster.RBs[emptyRBSpot] = player;
      } else if (!roster.Flex) {
        // flex is still empty
        roster.Flex = player;
      } else {
        roster.Bench[emptyBenchSpot] = player;
      }
      break;
    }
    case "WR": {
      const emptyWRSpot = roster.WRs.findIndex(wr => wr === null);
      if (emptyWRSpot > -1) {
        // there's an empty WR spot on the roster, insert
        roster.WRs[emptyWRSpot] = player;
      } else if (!roster.Flex) {
        // flex is still empty
        roster.Flex = player;
      } else {
        roster.Bench[emptyBenchSpot] = player;
      }
      break;
    }
    case "TE": {
      if (!roster.TE) {
        roster.TE = player;
      } else if (!roster.Flex) {
        roster.Flex = player;
      } else {
        roster.Bench[emptyBenchSpot] = player;
      }
      break;
    }
    default: {
      throw new Error("Unrecognized position!");
    }
  }
  roster.StarterValue = sumStarterValues(roster);

  // update the team in the array
  const updatedTeams = teams
    .slice(0, activeTeam)
    .concat([roster])
    .concat(teams.splice(activeTeam + 1));

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

    // update teams with the modified roster
    teams: updatedTeams,

    // update the activeTeam and draftDirection
    activeTeam: newActiveTeam,
    draftDirection: newDraftDirection,

    // remove the picked player
    players: players.filter(
      (p: IPlayer) => !(p.name === player.name && p.pos === player.pos)
    )
  };
};
