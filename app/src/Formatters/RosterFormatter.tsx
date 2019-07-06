import * as React from 'react';
import { connect } from 'react-redux';
import { Position } from '../models/Player';
import { IRoster } from '../models/Team';
import { setRosterFormat } from '../store/actions/players';
import { toggleRosterFormatting } from '../store/actions/teams';
import { IStoreState } from '../store/store';
import './RosterFormatter.css';

interface IProps {
  formattingRoster: boolean;
  rosterFormat: IRoster;
  setRosterFormat: (roster: IRoster) => void;
  toggleRosterFormatting: () => void;
}

class RosterFormatter extends React.Component<IProps> {
  /**
   * The order the positions should show up in the modal
   */
  public orderedPositions: Position[] = [
    'QB',
    'RB',
    'WR',
    'TE',
    'FLEX',
    'DST',
    'K',
    'BENCH'
  ];

  /**
   * change the number of players at the passed position
   */
  public changePositionCount = (pos: Position, change: number) => {
    const { rosterFormat } = this.props;
    const newCountAtPosition = Math.max(0, rosterFormat[pos] + change); // don't go negative
    const newRoster = { ...rosterFormat, [pos]: newCountAtPosition };
    this.props.setRosterFormat(newRoster);
  };

  public render() {
    const { formattingRoster, rosterFormat } = this.props;

    if (!formattingRoster) {
      return null;
    }

    return (
      <div
        className="Formatter-backdrop"
        onClick={this.props.toggleRosterFormatting}>
        <div
          className="Formatter RosterFormatter"
          onClick={e => e.stopPropagation()}>
          <header>
            <h3>Change Roster</h3>
            <button
              className="remove-player-x"
              onClick={this.props.toggleRosterFormatting}
            />
          </header>
          <div className="position-change-section">
            {this.orderedPositions.map(k => (
              <label className="position-toggle" key={k}>
                {`${rosterFormat[k]} ${k === 'BENCH' ? 'Bench' : k}${
                  rosterFormat[k] !== 1 && k !== 'BENCH' ? 's' : ''
                }`}
                <button
                  className="Options-Container position-button"
                  onClick={e => {
                    e.stopPropagation();
                    this.changePositionCount(k, 1);
                  }}>
                  +
                </button>
                <button
                  className="Options-Container position-button"
                  onClick={e => {
                    e.preventDefault();
                    this.changePositionCount(k, -1);
                  }}>
                  −
                </button>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ formattingRoster, rosterFormat }: IStoreState) => ({
  formattingRoster,
  rosterFormat
});

const mapDispathToProps = (dispatch: any) => ({
  setRosterFormat: (roster: IRoster) => dispatch(setRosterFormat(roster)),
  toggleRosterFormatting: () => dispatch(toggleRosterFormatting())
});

export default connect(
  mapStateToProps,
  mapDispathToProps
)(RosterFormatter);
