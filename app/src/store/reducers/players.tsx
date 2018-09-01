import { toast } from 'react-toastify';

import { IPlayer, Position } from '../../Player';
import { IPick, IRoster, ITeam, NullablePlayer } from '../../Team';
import { createTeam, initialRoster, IStoreState } from '../store';

/**
 * Update the list of players in the store
 * Set tableName on them
 *
 * @param state state before having players set
 */
export const setPlayers = (
  state: IStoreState,
  players: IPlayer[]
): IStoreState => {
  const getTableName = (name: string) => {
    const splitName = name.split(' ');
    return `${name[0]}. ${splitName[1]}`;
  };

  const playersWithTableName = players.filter(p => p.name).map(p => ({
    ...p,
    tableName: p.pos === 'DST' ? p.name : getTableName(p.name)
  }));

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
 *
 * @param state
 * @param player
 */
export const removePlayer = (
  state: IStoreState,
  player: IPlayer
): IStoreState => {
  // create a toast
  toast.info(`Removed ${player.name}`);

  return {
    ...state,
    undraftedPlayers: state.undraftedPlayers.filter(
      p => !(p.name === player.name && p.pos === player.pos)
    )
  };
};

/**
 * given a player and a team's roster, remove the player from the roster
 */
const removeFromRoster = (roster: ITeam, player: IPlayer): ITeam => {
  return Object.keys(roster).reduce(
    (acc: ITeam, pos) => ({
      ...acc,
      [pos]: roster[pos].reduce(
        (players: NullablePlayer[], p: NullablePlayer) =>
          p === player ? players.concat([null]) : players.concat([p]),
        []
      )
    }),
    {}
  ) as ITeam;
};

/**
 * Add the PlayerPick back into the list of teams and remove from the teams roster
 * If the pick paramter is null, undo the last pick
 *
 * @param state state from current turn, about to be undone
 */
export const undoPlayerPick = (
  state: IStoreState,
  pick?: IPick
): IStoreState => {
  const { pastPicks, teams, undraftedPlayers } = state;

  let pickToUndo = pick;
  if (!pickToUndo && pastPicks.length) {
    pickToUndo = pastPicks[0];
  }

  if (!pickToUndo || !pickToUndo.player) {
    return state;
  }

  toast.info(`Undrafted ${pickToUndo.player.name}`);

  teams[pickToUndo.team] = removeFromRoster(
    teams[pickToUndo.team],
    pickToUndo.player
  );

  return {
    ...state,
    activeTeam: pickToUndo.team,
    currentPick: pickToUndo.pickNumber,
    pastPicks: pastPicks.filter(p => p !== pickToUndo),
    undraftedPlayers: undraftedPlayers
      .concat([pickToUndo.player])
      .sort((a: IPlayer, b: IPlayer) => (a.vor && b.vor ? b.vor - a.vor : 0))
  };
};

/**
 * Change the default roster format, changing number of QBs, RBs, etc
 * Will involve recalculating VORs
 *
 * @param state state before roster format update
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
 * toggle the PPR setting and make a notification
 */
export const togglePPR = (state: IStoreState): IStoreState => {
  if (!state.ppr) {
    toast.info('Using PPR Scoring');
  } else {
    toast.info('Using Standard Scoring');
  }

  return updatePlayerVORs({ ...state, ppr: !state.ppr });
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

  const positions: Position[] = ['QB', 'RB', 'WR', 'TE', 'DST', 'K'];

  // we have 4 adp rankings from fantasyfootballcalculator. they're stored
  // in player properties adp8, adp10, adp12, and adp14
  let adp = 'adp10';
  if (numberOfTeams <= 8) {
    adp = 'adp8';
  } else if (numberOfTeams > 10 && numberOfTeams <= 12) {
    adp = 'adp12';
  } else if (numberOfTeams > 12) {
    adp = 'adp14';
  }

  if (ppr) {
    adp += 'PPR';
  } else {
    adp += 'STN';
  }

  // update player adp to whatever it is in an equivelant league size
  players = players.map(p => ({ ...p, adp: p[adp] }));

  // total number of players at each position
  const positionToTotalCountMap = {};
  positions.forEach(pos => {
    positionToTotalCountMap[pos] = players.filter(p => p.pos === pos).length;
  });

  // #1, find replacement player index for each position
  // map each position to the number of players drafted before the lastPick
  const positionToCountMap = {};
  positions.forEach(pos => {
    positionToCountMap[pos] = players.filter(
      p => p.pos === pos && p.adp && p.adp > 0 && p.adp < numberOfTeams * 10
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
    // player in that position
    positionToCountMap[pos] = positionToCountMap[pos] || 0;
    positionToCountMap[pos] +=
      (rosterFormat[pos] - initialRoster[pos]) * numberOfTeams;
    positionToCountMap[pos] = Math.max(0, positionToCountMap[pos]);

    totalPlayerCount += positionToCountMap[pos];
  });

  // sum the total number of players (to get the total number of players drafted
  // to the number of teams * 10)
  const ratioOfExpected = (numberOfTeams * 10) / totalPlayerCount;

  // adjust so the total count sums to ~100 and we don't exceed the tt
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
    const sortedPlayers = players
      .filter(p => p.pos === pos)
      .sort(
        (a, b) =>
          ppr
            ? b.predictionPPR - a.predictionPPR
            : b.predictionSTN - a.predictionSTN
      );

    // if the "replacement player" is a tenable value, get his expected
    // number of points
    let replacementValue = 0;
    if (positionToCountMap[pos] < positionToTotalCountMap[pos]) {
      replacementValue =
        sortedPlayers[positionToCountMap[pos]][
          ppr ? 'predictionPPR' : 'predictionSTN'
        ];
    }

    positionToReplaceValueMap[pos] = replacementValue;
  });

  // #3, update players' VORs
  players = players.map(p => ({
    ...p,
    vor:
      (ppr ? p.predictionPPR : p.predictionSTN) -
      positionToReplaceValueMap[p.pos]
  }));
  players = players.filter(p => p.vor);

  return players.sort((a, b) => (a.vor && b.vor && b.vor - a.vor) || -1);
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
