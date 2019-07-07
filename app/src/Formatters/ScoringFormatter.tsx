import { InputNumber, Modal } from 'antd';
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
    passYds: '25 passing yards',
    passTds: 'Thrown TD', // tslint:disable-line
    passInts: 'Interception',
    receptions: 'Reception',
    receptionYds: '10 receiving yards',
    receptionTds: 'TD reception',
    rushYds: '10 rushing yards',
    rushTds: 'Rushing TD',
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
    dfFumbles: 'Fumble recovery',
    dfSafeties: 'Safety'
  };

  /**
   * Some stats are reported as multiples, but should be 1:1 during forecasting
   */
  private multiple = {
    passYds: 25,
    receptionYds: 10,
    rushYds: 10
  };

  public render() {
    const { formattingScoring, scoring } = this.props;

    return (
      <Modal
        title="Change scoring"
        visible={formattingScoring}
        onOk={this.props.toggleScoringFormatting}
        onCancel={this.props.toggleScoringFormatting}>
        <div className="scoring-columns">
          <div className="scoring-column left-column">
            <h5>Offense</h5>
            {Object.keys(this.offense).map(k => (
              <div className="scoring-input" key={k}>
                <label htmlFor={k}>{this.offense[k]}</label>
                <InputNumber
                  id={k}
                  name={k}
                  key={k}
                  type="number"
                  defaultValue={
                    this.multiple[k]
                      ? scoring[k] * this.multiple[k]
                      : scoring[k]
                  }
                  onBlur={this.onBlur}
                />
              </div>
            ))}
          </div>

          <div className="scoring-column">
            <h5>Kicking</h5>
            {Object.keys(this.kickers).map(k => (
              <div className="scoring-input" key={k}>
                <label htmlFor={k}>{this.kickers[k]}</label>
                <InputNumber
                  id={k}
                  name={k}
                  key={k}
                  type="number"
                  defaultValue={scoring[k]}
                  onBlur={this.onBlur}
                />
              </div>
            ))}
          </div>

          <div className="scoring-column">
            <h5>Defense</h5>
            {Object.keys(this.dst).map(k => (
              <div className="scoring-input" key={k}>
                <label htmlFor={k}>{this.dst[k]}</label>
                <InputNumber
                  id={k}
                  name={k}
                  key={k}
                  type="number"
                  defaultValue={scoring[k]}
                  onBlur={this.onBlur}
                />
              </div>
            ))}
          </div>
        </div>
      </Modal>
    );
  }

  /**
   * Update state and re-rank the players with the new scoring
   */
  private onBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { scoring, dispatchSetScoreFormat } = this.props;
    const { id, value } = e.target;

    let numValue: number;
    if (this.multiple[id]) {
      numValue = parseInt(value, 10) / this.multiple[id];
    } else {
      numValue = parseInt(value, 10);
    }

    dispatchSetScoreFormat({ ...scoring, [id]: numValue });
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
