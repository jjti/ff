import { Button, Select, Tooltip } from 'antd';
import { saveAs } from 'file-saver';
import * as React from 'react';
import { connect } from 'react-redux';
import { IPlayer } from '../lib/models/Player';
import { resetDraft } from '../lib/store/actions/players';
import { toggleScoringFormatting } from '../lib/store/actions/scoring';
import { setNumberOfTeams, setTrackedTeam, toggleRosterFormatting } from '../lib/store/actions/teams';
import { IStoreState } from '../lib/store/store';

interface IProps {
  numberOfTeams: number;
  resetDraft: () => void;
  setNumberOfTeams: (count: number) => void;
  setTrackedTeam: (team: number) => void;
  toggleRosterFormatting: () => void;
  toggleScoringFormatting: () => void;
  trackedTeam: number;
  undraftedPlayers: IPlayer[];
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
    open: true,
  };

  public toggleSettings = () => {
    this.setState({ open: !this.state.open });
  };

  public render() {
    const { numberOfTeams } = this.props;
    const { open } = this.state;

    // an array with the allowable number of teams: [6, 16]
    const allowableNumberOfTeams = Array.from(new Array(11))
      .fill(0)
      .map((_, i) => i + 6);

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
              <Select className="Settings-Select" onChange={this.props.setTrackedTeam} value={this.props.trackedTeam}>
                {new Array(numberOfTeams).fill(0).map((_, i) => (
                  <Select.Option key={`Pick-Selection-${i}`} value={i}>{`Team ${i + 1}`}</Select.Option>
                ))}
              </Select>
            </label>

            <label className="full-width">
              Team count
              <Select
                className="Settings-Select"
                onChange={this.props.setNumberOfTeams}
                value={this.props.numberOfTeams}>
                {allowableNumberOfTeams.map((n) => (
                  <Select.Option key={n} value={n}>{`${n} Teams`}</Select.Option>
                ))}
              </Select>
            </label>

            <label>
              <Tooltip title="Change rosters">
                <Button className="options-left" onClick={this.props.toggleRosterFormatting}>
                  Roster
                </Button>
              </Tooltip>
            </label>

            <label>
              <Tooltip title="Change scoring">
                <Button className="options-left" onClick={this.props.toggleScoringFormatting}>
                  Scoring
                </Button>
              </Tooltip>
            </label>

            <label>
              <Tooltip title="Download stats">
                <Button onClick={this.saveStats}>Stats</Button>
              </Tooltip>
            </label>

            <label>
              <Button className="options-left" onClick={this.props.resetDraft} danger={true}>
                Reset
              </Button>
            </label>
          </aside>
        )}
      </div>
    );
  }

  private saveStats = () => {
    const removeCols = ['key', 'index', 'tableName'];

    const cols = this.props.undraftedPlayers.length
      ? Object.keys(this.props.undraftedPlayers[0]).filter((k) => !removeCols.includes(k))
      : [];

    const statsCsv = this.props.undraftedPlayers.reduce(
      (acc, p) => acc + '\n' + cols.map((c) => p[c]).join(','),
      cols.join(',')
    );

    const blob = new Blob([statsCsv], {
      type: 'text/csv;charset=utf-8',
    });

    saveAs(blob, 'ffdraft-stats.csv');
  };
}

const mapStateToProps = ({ numberOfTeams, trackedTeam, undraftedPlayers }: IStoreState) => ({
  numberOfTeams,
  trackedTeam,
  undraftedPlayers,
});

const mapDispathToProps = (dispatch: any) => ({
  resetDraft: () => dispatch(resetDraft()),
  setNumberOfTeams: (count: number) => dispatch(setNumberOfTeams(count)),
  setTrackedTeam: (index: number) => dispatch(setTrackedTeam(index)),
  toggleRosterFormatting: () => dispatch(toggleRosterFormatting()),
  toggleScoringFormatting: () => dispatch(toggleScoringFormatting()),
});

export default connect(mapStateToProps, mapDispathToProps)(Settings);
