import { Button } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { resetDraft } from '../lib/store/actions/players';
import { toggleScoringFormatting } from '../lib/store/actions/scoring';
import { toggleRosterFormatting, undoLast } from '../lib/store/actions/teams';
import { IStoreState } from '../lib/store/store';

interface IProps {
  currentPick: number;
  numberOfTeams: number;
  undoPick: () => void;
  resetDraft: () => void;
  toggleRosterFormatting: () => void;
  toggleScoringFormatting: () => void;
}

class MobileSettings extends React.Component<IProps> {
  public render() {
    const { currentPick, numberOfTeams } = this.props;

    // round tracker message
    const headerMessage = `Round ${Math.ceil(
      (currentPick + 1) / numberOfTeams
    )} – Pick ${currentPick + 1}`;

    return (
      <div className="MobileSettings">
        <header>
          <h2>ffdraft.app</h2>
          <div className="pick-column">
            <p className="small">{headerMessage}</p>
            <div className="draft-dot">
              <div className="dot green-dot" />
              <p className="small">Will be drafted soon</p>
            </div>
          </div>
        </header>
        <div className="buttons">
          <Button
            size="small"
            onClick={this.props.toggleScoringFormatting}
            style={{ marginRight: 10 }}>
            Scoring
          </Button>
          <Button size="small" onClick={this.props.toggleRosterFormatting}>
            Roster
          </Button>
          <Button
            size="small"
            type="dashed"
            onClick={this.props.resetDraft}
            style={{ marginLeft: 'auto', marginRight: 10 }}>
            Reset
          </Button>
          <Button size="small" type="dashed" onClick={this.props.undoPick}>
            Undo
          </Button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ currentPick, numberOfTeams }: IStoreState) => ({
  currentPick,
  numberOfTeams,
});

const mapDispatchToProps = (dispatch: any) => ({
  resetDraft: () => dispatch(resetDraft()),
  toggleRosterFormatting: () => dispatch(toggleRosterFormatting()),
  toggleScoringFormatting: () => dispatch(toggleScoringFormatting()),
  undoPick: () => dispatch(undoLast()),
});

export default connect(mapStateToProps, mapDispatchToProps)(MobileSettings);
