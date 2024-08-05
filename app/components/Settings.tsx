import { Button, Radio, Select, Tooltip } from 'antd';
import { saveAs } from 'file-saver';
import { IScoring } from 'lib/models/Scoring';
import * as React from 'react';
import { connect } from 'react-redux';
import { IPlayer } from '../lib/models/Player';
import { resetDraft } from '../lib/store/actions/players';
import { setScoreFormat, toggleScoringFormatting } from '../lib/store/actions/scoring';
import { setNumberOfTeams, setTrackedTeam, toggleRosterFormatting, toggleTeamNameUpdates } from '../lib/store/actions/teams';
import { IStoreState } from '../lib/store/store';

interface IProps {
  numberOfTeams: number;
  resetDraft: () => void;
  scoring: IScoring;
  setNumberOfTeams: (count: number) => void;
  setScoring: (scoring: IScoring) => void;
  setTrackedTeam: (team: number) => void;
  teamNames: string[];
  toggleRosterFormatting: () => void;
  toggleScoringFormatting: () => void;
  toggleTeamNameUpdates: () => void;
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
    const { numberOfTeams, teamNames } = this.props;
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
                  <Select.Option key={`Pick-Selection-${i}`} value={i}>{teamNames[i]}</Select.Option>
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

            <label className="full-width">
              PPR
              <Radio.Group
                value={this.props.scoring.receptions}
                style={{ marginLeft: 'auto' }}
                onChange={(e) => {
                  this.props.setScoring({ ...this.props.scoring, receptions: e.target.value });
                }}>
                <Radio.Button value={0}>0</Radio.Button>
                <Radio.Button value={0.5}>0.5</Radio.Button>
                <Radio.Button value={1}>1</Radio.Button>
              </Radio.Group>
            </label>

            <label>
              <Tooltip title="Change roster format">
                <Button className="options-left" onClick={this.props.toggleRosterFormatting}>
                  Roster
                </Button>
              </Tooltip>
            </label>

            <label>
              <Tooltip title="Change league scoring">
                <Button className="options-left" onClick={this.props.toggleScoringFormatting}>
                  Scoring
                </Button>
              </Tooltip>
            </label>
            
            <label>
              <Tooltip title="Change Team Names">
                <Button className="options-left" onClick={this.props.toggleTeamNameUpdates}>
                  Team Names
                </Button>
              </Tooltip>
            </label>

            <label>
              <Tooltip title="Download stats CSV">
                <Button onClick={this.saveStats}>Download</Button>
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
      // @ts-ignore
      (acc, p) => acc + '\n' + cols.map((c) => p[c]).join(','),
      cols.join(',')
    );

    const blob = new Blob([statsCsv], {
      type: 'text/csv;charset=utf-8',
    });

    saveAs(blob, 'ffdraft-stats.csv');
  };
}

const mapStateToProps = ({ numberOfTeams, scoring, teams, trackedTeam, undraftedPlayers, }: IStoreState) => ({
  numberOfTeams,
  scoring,
  teamNames: teams.map(team => team.name),
  trackedTeam,
  undraftedPlayers,
});

const mapDispathToProps = (dispatch: any) => ({
  resetDraft: () => dispatch(resetDraft()),
  setNumberOfTeams: (count: number) => dispatch(setNumberOfTeams(count)),
  setScoring: (scoring: IScoring) => dispatch(setScoreFormat(scoring)),
  setTrackedTeam: (index: number) => dispatch(setTrackedTeam(index)),
  toggleRosterFormatting: () => dispatch(toggleRosterFormatting()),
  toggleScoringFormatting: () => dispatch(toggleScoringFormatting()),
  toggleTeamNameUpdates: () => dispatch(toggleTeamNameUpdates()),
});

export default connect(mapStateToProps, mapDispathToProps)(Settings);
