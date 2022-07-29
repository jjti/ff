import { InputNumber, Modal } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { Position } from '../lib/models/Player';
import { IRoster } from '../lib/models/Team';
import { setRosterFormat } from '../lib/store/actions/players';
import { toggleRosterFormatting } from '../lib/store/actions/teams';
import { IStoreState } from '../lib/store/store';

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
    'BENCH',
  ];

  /**
   * change the number of players at the passed position
   */
  public changePositionCount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id: pos, value } = e.target;
    const { rosterFormat } = this.props;

    let numvalue = parseInt(value, 10) || 0;
    numvalue = Math.max(numvalue, 0);
    numvalue = Math.round(numvalue);

    console.log(value, numvalue);

    this.props.setRosterFormat({ ...rosterFormat, [pos]: numvalue });
  };

  public render() {
    const { formattingRoster, rosterFormat } = this.props;

    return (
      // @ts-ignore
      <Modal
        title="Change roster"
        visible={formattingRoster}
        onOk={this.props.toggleRosterFormatting}
        onCancel={this.props.toggleRosterFormatting}>
        <div className="position-change-section">
          {this.orderedPositions.map((k) => (
            <div className="position-input-input" key={k}>
              <label htmlFor={k}>{k}</label>
              <InputNumber
                id={k}
                type="number"
                className="position-input"
                value={rosterFormat[k]}
                onBlur={this.changePositionCount}
                precision={0}
                min={0}
              />
            </div>
          ))}
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = ({ formattingRoster, rosterFormat }: IStoreState) => ({
  formattingRoster,
  rosterFormat,
});

const mapDispathToProps = (dispatch: any) => ({
  setRosterFormat: (roster: IRoster) => dispatch(setRosterFormat(roster)),
  toggleRosterFormatting: () => dispatch(toggleRosterFormatting()),
});

export default connect(mapStateToProps, mapDispathToProps)(RosterFormatter);
