import { IScoring } from '../../models/Scoring';
import { IStoreState } from '../store';
import { updatePlayerVORs } from './players';

/**
 * Change the points given to each player per TD, INT, etc
 */
export const setScoreFormat = (state: IStoreState, scoring: IScoring): IStoreState =>
  updatePlayerVORs({ ...state, scoring });
