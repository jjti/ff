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
  dispatchSetRosterFormat: (roster: IRoster) => void;
  toggleRosterFormatting: () => void;
}

class RosterFormatter extends React.Component<IProps> {
  /**
   * The order the positions should show up in the modal
   */
  public orderedPositions: Position[] = ['QB', 'RB', 'WR', 'TE', 'FLEX', 'DST', 'K', 'BENCH', 'SUPERFLEX'];

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
                className="position-input"
                id={k}
                key={k}
                min={0}
                onChange={this.changePositionCount(k)}
                precision={0}
                type="number"
                defaultValue={rosterFormat[k]}
              />
            </div>
          ))}
        </div>
      </Modal>
    );
  }

  /**
   * change the number of players at the passed position
   */
  private changePositionCount = (pos: string) => {
    return (value: string) => {
      const { rosterFormat, dispatchSetRosterFormat } = this.props;

      let numvalue = parseInt(value, 10) || 0;
      numvalue = Math.max(numvalue, 0);
      numvalue = Math.round(numvalue);

      dispatchSetRosterFormat({ ...rosterFormat, [pos]: numvalue });
    };
  };
}

const mapStateToProps = ({ formattingRoster, rosterFormat }: IStoreState) => ({
  formattingRoster,
  rosterFormat,
});

const mapDispathToProps = (dispatch: any) => ({
  dispatchSetRosterFormat: (roster: IRoster) => dispatch(setRosterFormat(roster)),
  toggleRosterFormatting: () => dispatch(toggleRosterFormatting()),
});

export default connect(mapStateToProps, mapDispathToProps)(RosterFormatter);
