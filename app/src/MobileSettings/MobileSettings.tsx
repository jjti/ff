import { Button, Dropdown, Menu } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { resetDraft } from '../store/actions/players';
import { toggleScoringFormatting } from '../store/actions/scoring';
import { toggleRosterFormatting, undoLast } from '../store/actions/teams';
import './MobileSettings.css';

interface IProps {
  undoPick: () => void;
  resetDraft: () => void;
  toggleRosterFormatting: () => void;
  toggleScoringFormatting: () => void;
}

class MobileSettings extends React.Component<IProps> {
  public render() {
    return (
      <div className="MobileSettings">
        <Dropdown
          overlay={
            <Menu style={{ width: 120 }}>
              <Menu.Item onClick={this.props.undoPick}>Undo Pick</Menu.Item>
              <Menu.Item onClick={this.props.toggleScoringFormatting}>
                Change Scoring
              </Menu.Item>
              <Menu.Item onClick={this.props.toggleRosterFormatting}>
                Change Roster
              </Menu.Item>
              <Menu.Item onClick={this.props.resetDraft}>Reset Draft</Menu.Item>
            </Menu>
          }>
          <Button icon="menu" />
        </Dropdown>
        <h3>ffdraft.app</h3>
        <div className="draft-dot">
          <div className="dot green-dot" />
          <p className="small">Will be drafted soon</p>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch: any) => ({
  resetDraft: () => dispatch(resetDraft()),
  toggleRosterFormatting: () => dispatch(toggleRosterFormatting()),
  toggleScoringFormatting: () => dispatch(toggleScoringFormatting()),
  undoPick: () => dispatch(undoLast())
});

export default connect(
  null,
  mapDispatchToProps
)(MobileSettings);
