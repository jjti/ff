import * as React from 'react';
import { connect } from 'react-redux';
import { IScoring } from '../models/Scoring';
import { setScoreFormat } from '../store/actions/scoring';
import { toggleScoringFormatting } from '../store/actions/scoring';
import { IStoreState } from '../store/store';
import './ScoringFormatter.css';

interface IProps {
  formattingScoring: boolean;
  scoring: IScoring;
  dispatchSetScoreFormat: (scoring: IScoring) => void;
  toggleScoringFormatting: () => void;
}

/**
 * Modal for change the points per TD/reception/fumble/etc
 */
class ScoringFormatter extends React.Component<IProps> {
  /** Offensive settings */
  private offense = {
    passYds: 'Thrown yard',
    passTds: 'Thrown TD', // tslint:disable-line
    passInts: 'Thrown interception',
    receptions: 'Reception',
    receptionYds: 'Reception yard',
    receptionTds: 'Reception TD',
    rushYds: 'Rush yard',
    rushTds: 'Rush TD',
    fumbles: 'Fumble',
    twoPts: '2PT Conversion'
  };

  /** kicker settings */
  private kickers = {
    kickExtraPoints: 'Extra Point Kick',
    kick019: 'Kick 0-19 years', // tslint:disable-line
    kick2029: 'Kick 20-29 years',
    kick3039: 'Kick 30-39 years',
    kick4049: 'Kick 40-49 years',
    kick50: 'Kick 50+ years'
  };

  /** DST settings */
  private dst = {
    dfInts: 'Defensive interception',
    dfTds: 'Defensive TD',
    dfSacks: 'Defensive sack', // tslint:disable-line
    dfPointsAllowedPerGame: 'Defensive points allowed',
    dfFumbles: 'Fumble recovery',
    dfSafeties: 'Safety'
  };

  public render() {
    const { formattingScoring, scoring } = this.props;

    if (!formattingScoring) {
      return null;
    }

    return (
      <div
        className="Formatter-backdrop"
        onClick={this.props.toggleScoringFormatting}>
        <div className="Formatter" onClick={e => e.stopPropagation()}>
          <header>
            <h3>Change League Scoring</h3>
            <button
              className="remove-player-x"
              onClick={this.props.toggleScoringFormatting}
            />
          </header>
          <div className="scoring-columns">
            <div className="scoring-column left-column">
              <h4>Offense</h4>
              {Object.keys(this.offense).map(k => (
                <div className="scoring-input" key={k}>
                  <label htmlFor={k}>{this.offense[k]}</label>
                  <input
                    id={k}
                    name={k}
                    type="number"
                    defaultValue={scoring[k]}
                    onBlur={this.onBlur}
                  />
                </div>
              ))}
            </div>

            <div className="scoring-column">
              <h4>Kicking</h4>
              {Object.keys(this.kickers).map(k => (
                <div className="scoring-input" key={k}>
                  <label htmlFor={k}>{this.kickers[k]}</label>
                  <input
                    id={k}
                    name={k}
                    type="number"
                    defaultValue={scoring[k]}
                    onBlur={this.onBlur}
                  />
                </div>
              ))}

              <h4>Defense</h4>
              {Object.keys(this.dst).map(k => (
                <div className="scoring-input" key={k}>
                  <label htmlFor={k}>{this.dst[k]}</label>
                  <input
                    id={k}
                    name={k}
                    type="number"
                    defaultValue={scoring[k]}
                    onBlur={this.onBlur}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Update state and re-rank the players with the new scoring
   */
  private onBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { scoring, dispatchSetScoreFormat } = this.props;
    const { id, value } = e.target;

    dispatchSetScoreFormat({ ...scoring, [id]: value });
  };
}

const mapStateToProps = ({ formattingScoring, scoring }: IStoreState) => ({
  formattingScoring,
  scoring
});

const mapDispathToProps = (dispatch: any) => ({
  dispatchSetScoreFormat: (scoring: IScoring) =>
    dispatch(setScoreFormat(scoring)),
  toggleScoringFormatting: () => dispatch(toggleScoringFormatting())
});

export default connect(
  mapStateToProps,
  mapDispathToProps
)(ScoringFormatter);
