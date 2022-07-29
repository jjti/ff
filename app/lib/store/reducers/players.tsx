import { toast } from 'react-toastify';
import { IPlayer, Position } from '../../models/Player';
import { IScoring } from '../../models/Scoring';
import { IPick, IRoster, ITeam, NullablePlayer } from '../../models/Team';
import { createTeam, initialRoster, IStoreState } from '../store';
import { setActiveTeam } from './teams';

export let INITIAL_PLAYERS: IPlayer[];

interface IPlayerForecast extends IPlayer {
  forecast: number;
}

/**
 * Update the list of players in the store. Set tableName on them
 */
export const setPlayers = (
  state: IStoreState,
  players: IPlayer[]
): IStoreState => {
  // tableName returns an abbreviated player name that fits in the cards and rows
  const tableName = (name: string) => `${name[0]}. ${name.split(' ')[1]}`;

  const positions = new Set(['QB', 'RB', 'WR', 'TE', 'DST', 'K']);
  let playersWithTableName = players
    .map(p => ({
      ...p,
      tableName: p.pos === 'DST' ? p.name : tableName(p.name)
    }))
    .filter(p => positions.has(p.pos)); // TODO: filter "P" players on server

  // chopping off bottom for rendering perf
  playersWithTableName = playersWithTableName;

  // hacky but am storing players here for a reset event
  if (!INITIAL_PLAYERS) {
    INITIAL_PLAYERS = playersWithTableName;
  }

  return updatePlayerVORs({
    ...state,
    pastPicks: [],
    players: playersWithTableName,
    undraftedPlayers: playersWithTableName
  });
};

/**
 * Remove the player from the store and the players array
 * Update the past history
 *
 * Past picks doesn't change
 */
export const removePlayer = (
  state: IStoreState,
  player: IPlayer
): IStoreState => ({
  ...state,
  undraftedPlayers: state.undraftedPlayers.filter(p => p.key !== player.key)
});

/**
 * given a player and a team's roster, remove the player from the roster
 */
const removeFromRoster = (roster: ITeam, player: IPlayer): ITeam => {
  // @ts-ignore
  return Object.keys(roster).reduce(
    (acc: ITeam, pos) => ({
      ...acc,
      [pos]: roster[pos].reduce(
        (players: NullablePlayer[], p: NullablePlayer) =>
          p === player ? [...players, null] : [...players, p],
        []
      )
    }),
    {}
  ) as ITeam;
};

/**
 * Undo the last pick/skip action
 * Unlike undoPick, this isn't player specific
 */
export const undoLast = (state: IStoreState): IStoreState => {
  const { currentPick, pastPicks } = state;
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
      ...teams.slice(lastPick.team + 1)
    ];

    undraftedPlayers = [lastPick.player, ...undraftedPlayers].sort(
      // @ts-ignore
      (a: IPlayer, b: IPlayer) => b.vor - a.vor
    );
  } else {
    toast.info('Undoing Skip');
  }

  return setActiveTeam({
    ...state,
    currentPick: currentPick - 1,
    pastPicks: pastPicks.slice(1),
    teams,
    undraftedPlayers
  });
};

/**
 * Add the PlayerPick back into the list of teams and remove from the teams roster
 * If the pick paramter is null, undo the last pick
 */
export const undoPick = (state: IStoreState, pick: IPick): IStoreState => {
  const { pastPicks, undraftedPlayers } = state;
  let { teams } = state;

  if (!pick.player) {
    // should never happen
    return state;
  }

  teams = [
    ...teams.slice(0, pick.team),
    removeFromRoster(teams[pick.team], pick.player),
    ...teams.slice(pick.team + 1)
  ];

  return {
    ...state,
    pastPicks: pastPicks.reduce(
      (acc: IPick[], p: IPick) =>
        p === pick ? acc.concat({ ...p, player: null }) : acc.concat(p),
      []
    ),
    teams,
    undraftedPlayers: [pick.player, ...undraftedPlayers].sort(
      (a: IPlayer, b: IPlayer) =>
        a.vor !== undefined && b.vor !== undefined ? b.vor - a.vor : 0
    )
  };
};

/**
 * Change the default roster format, changing number of QBs, RBs, etc
 * Will involve recalculating VORs
 */
export const setRosterFormat = (
  state: IStoreState,
  newRosterFormat: IRoster
): IStoreState =>
  updatePlayerVORs({
    ...state,
    rosterFormat: newRosterFormat,
    teams: new Array(state.numberOfTeams)
      .fill(null)
      .map(() => createTeam(newRosterFormat))
  });

/**
 * Update the VOR for all the players not yet drafted. Is dependent on
 * the number of teams currently in the draft
 */
export const updatePlayerVORs = (state: IStoreState): IStoreState => ({
  ...state,
  undraftedPlayers: updateVOR(state)
});

/**
 * recalculate VOR for the players.
 *
 * #1: find the number of players, at each position, drafted by the 10th round
 *    in leagues with this many players. Can estimate with ADP from ESPN
 * #2: find the replacementValue for each position, by using the index from #1 + 1
 * #3: update each player's VOR using their predicted number of points minus their replacementValue
 * #4: sort the players by their VOR
 */
const updateVOR = (state: IStoreState): IPlayer[] => {
  const {
    numberOfTeams,
    rosterFormat,
    scoring,
    players: playersNoForecast
  } = state;

  // how many rounds we care about from a VOR perspective
  const numberOfRounds = numberOfTeams;
  // the drafable positions (TODO: account for FLEX)
  const positions: Position[] = ['QB', 'RB', 'WR', 'TE', 'DST', 'K'];

  // get player array with estimated draft positions
  let players = playersWithForecast(scoring, playersNoForecast);

  // total number of players at each position
  const positionToTotalCountMap = {};
  positions.forEach(pos => {
    positionToTotalCountMap[pos] = players.filter(p => p.pos === pos).length;
  });

  const adpDiff = [0, 0.5, 1].map(ppr => Math.abs(ppr - scoring.receptions));
  const minDiff = Math.min(...adpDiff);
  const minDiffIndex = adpDiff.indexOf(minDiff);
  const adpCol = { 0: 'std', 1: 'halfPpr', 2: 'ppr' }[minDiffIndex]!;

  // #1, find replacement player index for each position
  // map each position to the number of players drafted before the lastPick
  const positionToCountMap = {};
  positions.forEach(pos => {
    positionToCountMap[pos] = players.filter(
      p =>
        p.pos === pos &&
        p[adpCol] &&
        p[adpCol] > 0 &&
        p[adpCol] <= numberOfTeams * numberOfRounds
    ).length; // || 0 to avoid NaN on never drafted positions (in first 10 rounds)
  });

  // because #1 is based on a default league, with 1QB, 2RBs, etc, we need
  // to account for specialty leagues where the numbers differ. We crudishly
  // do that here, by comparing the number of players in the current roster to
  // a "default" roster and multiplying the number of drafted players in that position
  // accordingly
  let totalPlayerCount = 0;
  Object.keys(initialRoster).forEach(pos => {
    // this is dumb af but lets guess that every team will draft 1 additional
    // player in that position for each additional player in the modified roster
    positionToCountMap[pos] = positionToCountMap[pos] || 0;
    positionToCountMap[pos] +=
      (rosterFormat[pos] - initialRoster[pos]) * numberOfTeams;
    positionToCountMap[pos] = Math.max(0, positionToCountMap[pos]);

    totalPlayerCount += positionToCountMap[pos];
  });

  // sum the total number of players (to get the total number of players drafted
  // to the number of teams * numberOfRounds)
  const ratioOfExpected = (numberOfTeams * numberOfRounds) / totalPlayerCount;

  // adjust so the total count sums to ~100 (default) and we don't exceed it
  Object.keys(positionToCountMap).forEach(pos => {
    positionToCountMap[pos] = Math.floor(
      positionToCountMap[pos] * ratioOfExpected
    );
  });

  // #2, find replacement values at each position by finding the predicted points
  //     at 1+the number of expected players in that position drafted within 10 rounds
  // filter by position, sort descending by prediction points, and get the number of points by the replacement player
  // map positions to their replacement values
  const positionToReplaceValueMap = {};
  positions.forEach(pos => {
    // sort the players, in that position, by their VOR
    const sortedPlayersInPosition = players
      .filter(p => p.pos === pos)
      .sort((a, b) => b.forecast - a.forecast);

    // if the "replacement player" is a tenable value, get his expected
    // number of points, otherwise it says zero
    let replacementValue = 0;
    if (positionToCountMap[pos] < positionToTotalCountMap[pos]) {
      replacementValue =
        sortedPlayersInPosition[positionToCountMap[pos]].forecast;
    }

    positionToReplaceValueMap[pos] = replacementValue;
  });

  // #3, update players' VORs
  players = players.map(p => ({
    ...p,
    vor: p.forecast - positionToReplaceValueMap[p.pos]
  }));

  players = players.filter(p => p.vor !== undefined);

  // @ts-ignore
  return players.sort((a, b) => b.vor - a.vor || -1);
};

/**
 * Update the players by forecasting their season-end points. Use league score
 * and the league's point settings
 */
const playersWithForecast = (
  scoring: IScoring,
  players: IPlayer[]
): IPlayerForecast[] => {
  return players.map(p => ({
    ...p,
    forecast: Math.round(
      Object.keys(scoring).reduce(
        (acc, k) =>
          k === 'dfPointsAllowedPerGame'
            ? acc + 16.0 * dstPointsPerGame(p[k])
            : acc + scoring[k] * p[k],
        0.0
      )
    )
  }));
};

/**
 * estimate the points a team will earn from points against over season
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
