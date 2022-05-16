import { ACTION_TYPES } from '.';
import { IScoring } from '../../models/Scoring';

/**
 * Toggle scoring formatting, changing points per td, reception, etc
 */
export const toggleScoringFormatting = () => ({
  type: ACTION_TYPES.TOGGLE_SCORE_FORMATTING
});

/**
 * Update the league points/scoring
 */
export const setScoreFormat = (scoring: IScoring) => ({
  scoring,
  type: ACTION_TYPES.SET_SCORE_FORMAT
});
