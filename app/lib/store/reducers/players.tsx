import { DraftablePositions as positions, IPlayer } from '../../models/Player';
import { IScoring } from '../../models/Scoring';
import { IPick, IRoster, ITeam, NullablePlayer } from '../../models/Team';
import { createTeam, IStoreState } from '../store';
import { setActiveTeam, setNumberOfTeams } from './teams';

interface IPlayerForecast extends IPlayer {
  forecast: number;
}

/**
 * Initialize the store, setting players.
 */
export const initStore = (state: IStoreState, players: IPlayer[]) =>
  updatePlayerVORs({
    ...state,
    activeTeam: 0,
    currentPick: 0,
    lastSync: Date.now(),
    lastSyncPlayers: players,
    players: players,
    picks: [],
    teams: new Array(state.numberOfTeams).fill(0).map(() => createTeam(state.rosterFormat)),
    undraftedPlayers: players,
  });

/**
 * Remove the player from the store and the players array
 * Update the past history
 *
 * Past picks doesn't change
 */
export const onRemovePlayer = (state: IStoreState, player: IPlayer): IStoreState => ({
  ...state,
  undraftedPlayers: state.undraftedPlayers.filter((p) => p.key !== player.key),
});

/**
 * given a player and a team's roster, remove the player from the roster
 */
const removeFromRoster = (roster: ITeam, player: IPlayer): ITeam => {
  // @ts-ignore
  return Object.keys(roster).reduce(
    (acc: ITeam, pos) => ({
      ...acc,
      // @ts-ignore
      [pos]: roster[pos].reduce(
        (players: NullablePlayer[], p: NullablePlayer) => (p === player ? [...players, null] : [...players, p]),
        []
      ),
    }),
    {}
  ) as ITeam;
};

/**
 * Undo the last pick/skip action
 * Unlike undoPick, this isn't player specific
 */
export const undoLast = (state: IStoreState): IStoreState => {
  const { currentPick, picks: pastPicks } = state;
  let { teams, undraftedPlayers } = state;

  if (!pastPicks.length) {
    // cannot do anything on the zero-th pick
    return state;
  }

  // check and adjust for the last team pick
  const lastPick = pastPicks[0];
  if (lastPick.player) {
    teams = [
      ...teams.slice(0, lastPick.team),
      removeFromRoster(teams[lastPick.team], lastPick.player),
      ...teams.slice(lastPick.team + 1),
    ];

    undraftedPlayers = [lastPick.player, ...undraftedPlayers].sort(
      // @ts-ignore
      (a: IPlayer, b: IPlayer) => b.vor - a.vor
    );
  }

  return setActiveTeam({
    ...state,
    currentPick: currentPick - 1,
    picks: pastPicks.slice(1),
    teams,
    undraftedPlayers,
  });
};

/**
 * Add the PlayerPick back into the list of teams and remove from the teams roster
 * If the pick paramter is null, undo the last pick
 */
export const undoPick = (state: IStoreState, pick: IPick): IStoreState => {
  const { picks: pastPicks, undraftedPlayers } = state;
  let { teams } = state;

  if (!pick.player) {
    // should never happen
    return state;
  }

  teams = [
    ...teams.slice(0, pick.team),
    removeFromRoster(teams[pick.team], pick.player),
    ...teams.slice(pick.team + 1),
  ];

  return {
    ...state,
    picks: pastPicks.reduce(
      (acc: IPick[], p: IPick) => (p === pick ? acc.concat({ ...p, player: null }) : acc.concat(p)),
      []
    ),
    teams,
    undraftedPlayers: [pick.player, ...undraftedPlayers].sort((a: IPlayer, b: IPlayer) =>
      a.vor !== undefined && b.vor !== undefined ? b.vor - a.vor : 0
    ),
  };
};

/**
 * Change the default roster format, changing number of QBs, RBs, etc
 *
 * Requires recalculating VORs
 */
export const setRosterFormat = (state: IStoreState, newRosterFormat: IRoster) =>
  // mega-hacky but setNumberOfTeams already does what I need rn
  setNumberOfTeams({ ...state, rosterFormat: newRosterFormat }, state.numberOfTeams);

/**
 * Calculate the VOR of all the players.
 *
 * This adds vor and forecast to each player.
 *
 * #1: find the number of players at each position
 * #2: find the replacement projection for each position (what's the projection for the next player off waivers?)
 * #3: calculate each player's VOR using their projection minus their replacement player's projection
 * #4: sort the players by their VOR
 */
export const updatePlayerVORs = (state: IStoreState): IStoreState => {
  const { numberOfTeams, rosterFormat, scoring, players: playersNoForecast, undraftedPlayers } = state;

  // get player array with estimated season-end projection
  let players = playersWithForecast(scoring, playersNoForecast);

  // #1 find replacement player index for each position
  //
  // total how many starters will be used across all teams
  const positionToReplacementIndex = positions.reduce((acc, pos) => {
    // @ts-ignore
    let starters = rosterFormat[pos];

    if (pos === 'QB') {
      starters += rosterFormat['SUPERFLEX'];
    }
    if (scoring.receptions > 0) {
      if (pos === 'WR') {
        starters += rosterFormat['FLEX'] + 1;
      } else if (pos === 'RB') { 
        starters += 1;
      }
    } else if (['WR', 'RB'].includes(pos)) {
      starters += rosterFormat['FLEX'] + 1;
    }
    if (['K', 'DST'].includes(pos)) {
      starters = 0;
    }

    return { [pos]: Math.round(starters * numberOfTeams), ...acc };
  }, {});

  // #2 find replacement values at each position subtracting points at the N+1'th index at that position
  //
  // filter by position, sort descending by prediction points, and get the number of points by the replacement player
  // map positions to their replacement values
  const positionToReplacementValue = positions.reduce((acc, pos) => {
    // sort the players, in that position, by their VOR
    const sortedPlayersInPosition = players.filter((p) => p.pos === pos).sort((a, b) => b.forecast - a.forecast);

    // this is for an edge-case where there's a ton of teams or each roster is huge.
    let replacementValue = 0;
    // @ts-ignore
    if (positionToReplacementIndex[pos] < sortedPlayersInPosition.length) {
      // @ts-ignore
      replacementValue = sortedPlayersInPosition[positionToReplacementIndex[pos]].forecast;
    }

    return { [pos]: replacementValue, ...acc };
  }, {});

  players = players
    // #3 set players' VORs
    .map((p) => ({
      ...p,
      // @ts-ignore
      vor: p.forecast - positionToReplacementValue[p.pos],
    }))
    // #4 sort 'em
    .sort((a, b) => b.vor - a.vor);

  // update the undraftedPlayers array as well (it being a separate array is maybe bad)
  const playerIdToVor = {};
  // @ts-ignore
  players.forEach((p) => (playerIdToVor[p.key] = p));
  undraftedPlayers.forEach((p) => {
    // @ts-ignore
    p.forecast = playerIdToVor[p.key].forecast;
    // @ts-ignore
    p.vor = playerIdToVor[p.key].vor;
  });
  // @ts-ignore
  undraftedPlayers.sort((a, b) => b.vor - a.vor);

  return {
    ...state,
    players,
    undraftedPlayers,
  };
};

/**
 * Update the players by forecasting their season-end points.
 *
 * Use league score and the league's point settings
 */
const playersWithForecast = (scoring: IScoring, players: IPlayer[]): IPlayerForecast[] => {
  return players.map((p) => ({
    ...p,
    forecast: Math.round(
      Object.keys(scoring).reduce(
        // @ts-ignore
        (acc, k) => (k === 'dfPointsAllowedPerGame' ? acc + 16.0 * dstPointsPerGame(p[k]) : acc + scoring[k] * p[k]),
        0.0
      )
    ),
  })).sort((a, b) => a.forecast - b.forecast);
};

/**
 * Estimate the points a team will earn from points against over season
 */
const dstPointsPerGame = (pts: number): number => {
  if (pts === null) {
    return 0;
  }
  if (pts < 1) {
    return 5;
  } else if (pts < 7) {
    return 4;
  } else if (pts < 14) {
    return 3;
  } else if (pts < 18) {
    return 1;
  } else if (pts < 28) {
    return 0;
  } else if (pts < 35) {
    return -1;
  } else if (pts < 46) {
    -3;
  }
  return -5;
};
