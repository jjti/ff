import { Select } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { resetDraft } from '../store/actions/players';
import { toggleScoringFormatting } from '../store/actions/scoring';
import {
  setNumberOfTeams,
  setTrackedTeam,
  toggleRosterFormatting
} from '../store/actions/teams';
import { IStoreState } from '../store/store';
import './Settings.css';

interface IProps {
  currentPick: number;
  numberOfTeams: number;
  resetDraft: () => void;
  setNumberOfTeams: (count: number) => void;
  setTrackedTeam: (team: number) => void;
  toggleRosterFormatting: () => void;
  toggleScoringFormatting: () => void;
  trackedTeam: number;
}

interface IState {
  open: boolean;
}

class Settings extends React.Component<IProps, IState> {
  /**
   * Start off with the Settings Section open because picking
   * team is important for draft order
   */
  public state: IState = {
    open: true
  };

  public toggleSettings = () => {
    this.setState({ open: !this.state.open });
  };

  public render() {
    const { currentPick, numberOfTeams } = this.props;
    const { open } = this.state;

    // an array with the allowable number of teams: [6, 16]
    const allowableNumberOfTeams =
      currentPick > numberOfTeams
        ? // freeze the number of teams at the value set in store, can't change any longer
          [numberOfTeams]
        : // allow the user to add teams, so long as the new team count is greater than
          // the number of picks that have already happened
          Array.from(new Array(11))
            .fill(0)
            .map((_, i) => i + 6)
            .filter(n => n > currentPick);

    const disabledOptions = currentPick > 0;

    return (
      <div className="Settings Section">
        <header className="Settings-Header" onClick={this.toggleSettings}>
          <h3>Settings</h3>
          {open ? <i className="up Grayed" /> : <i className="down Grayed" />}
        </header>
        {open && (
          <aside className="Settings-Container">
            <label className="full-width">
              Your team
              <Select
                className="Settings-Select"
                onChange={this.updateTrackedTeam}
                defaultValue={1}>
                {new Array(numberOfTeams).fill(0).map((_, i) => (
                  <Select.Option
                    key={`Pick-Selection-${i}`}
                    value={i + 1}>{`Team ${i + 1}`}</Select.Option>
                ))}
              </Select>
            </label>

            <label className="full-width">
              Number of teams
              <Select
                className="Settings-Select"
                onChange={this.setNumberOfTeams}
                defaultValue={10}>
                {allowableNumberOfTeams.map(n => (
                  <Select.Option
                    key={n}
                    value={n}>{`${n} Teams`}</Select.Option>
                ))}
              </Select>
            </label>

            <label data-tip={disabledOptions ? 'Reset to change rosters' : ''}>
              <button
                className="Options-Container options-left"
                onClick={this.props.toggleRosterFormatting}
                disabled={disabledOptions}>
                <p>Roster</p>
              </button>
            </label>

            <label data-tip={disabledOptions ? 'Reset to change scoring' : ''}>
              <button
                className="Options-Container options-left"
                onClick={this.props.toggleScoringFormatting}
                disabled={disabledOptions}>
                <p>Scoring</p>
              </button>
            </label>

            <label>
              <button
                className="Options-Container options-left"
                onClick={this.props.resetDraft}>
                <p>Reset</p>
              </button>
            </label>
          </aside>
        )}
      </div>
    );
  }

  private updateTrackedTeam = (value: number) => {
    this.props.setTrackedTeam(value);
  };

  private setNumberOfTeams = (value: number) => {
    this.props.setNumberOfTeams(value);
  };
}

const mapStateToProps = ({
  currentPick,
  numberOfTeams,
  trackedTeam
}: IStoreState) => ({
  currentPick,
  numberOfTeams,
  trackedTeam
});

const mapDispathToProps = (dispatch: any) => ({
  resetDraft: () => dispatch(resetDraft()),
  setNumberOfTeams: (count: number) => dispatch(setNumberOfTeams(count)),
  setTrackedTeam: (index: number) => dispatch(setTrackedTeam(index)),
  toggleRosterFormatting: () => dispatch(toggleRosterFormatting()),
  toggleScoringFormatting: () => dispatch(toggleScoringFormatting())
});

export default connect(
  mapStateToProps,
  mapDispathToProps
)(Settings);
