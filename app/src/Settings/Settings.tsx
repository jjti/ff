import * as React from "react";
import { connect } from "react-redux";

import { resetDraft, togglePPR } from "../store/actions/players";
import {
  setNumberOfTeams,
  setTrackedTeam,
  toggleRosterFormatting
} from "../store/actions/teams";
import { IStoreState } from "../store/store";

import "./Settings.css";

interface IProps {
  currentPick: number;
  numberOfTeams: number;
  resetDraft: () => void;
  ppr: boolean;
  setNumberOfTeams: (count: number) => void;
  setTrackedTeam: (index: number) => void;
  togglePPR: () => void;
  toggleRosterFormatting: () => void;
  trackedTeam: number;
}

interface IState {
  open: boolean;
}

class Settings extends React.Component<IProps, IState> {
  /**
   * Start off with the Settings Section open... needed to set team#
   * and which team is currently being tracked
   */
  public state: IState = {
    open: true
  };

  public toggleSettings = () => {
    this.setState({ open: !this.state.open });
  };

  public render() {
    const { open } = this.state;
    const { currentPick, numberOfTeams, ppr, trackedTeam } = this.props;

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
              <div className="Options-Container">
                <select
                  className="Tracked-Team-Select Grayed"
                  onChange={this.updateTrackedTeam}
                  value={trackedTeam}
                >
                  {new Array(numberOfTeams).fill(0).map((_, i) => (
                    <option key={`Pick-Selection-${i}`} value={i}>{`Team ${i +
                      1}`}</option>
                  ))}
                </select>
              </div>
            </label>

            <label className="full-width">
              Number of teams
              <div className="Options-Container">
                <select
                  className="Grayed"
                  value={`${numberOfTeams} Teams`}
                  disabled={currentPick > numberOfTeams}
                  onChange={this.setNumberOfTeams}
                >
                  {allowableNumberOfTeams.map(n => (
                    <option key={`${n}-Teams-Select`}>{`${n} Teams`}</option>
                  ))}
                </select>
              </div>
            </label>

            <label className="full-width" onClick={this.props.togglePPR}>
              PPR
              <div className={`toggle ${ppr ? "active" : ""}`} />
            </label>

            <label>
              <button
                className="Options-Container options-left"
                onClick={this.props.toggleRosterFormatting}
              >
                <p>Customize Roster</p>
              </button>
            </label>

            <label>
              <button
                className="Options-Container options-left"
                onClick={this.props.resetDraft}
              >
                <p>Reset Draft</p>
              </button>
            </label>
          </aside>
        )}
      </div>
    );
  }

  private updateTrackedTeam = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    this.props.setTrackedTeam(+value);
  };

  private setNumberOfTeams = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    const numberOfTeams = +value.split(" ")[0];
    this.props.setNumberOfTeams(numberOfTeams);
  };
}

const mapStateToProps = ({
  currentPick,
  numberOfTeams,
  ppr,
  trackedTeam
}: IStoreState) => ({
  currentPick,
  numberOfTeams,
  ppr,
  trackedTeam
});

const mapDispathToProps = (dispatch: any) => ({
  resetDraft: () => dispatch(resetDraft()),
  setNumberOfTeams: (count: number) => dispatch(setNumberOfTeams(count)),
  setTrackedTeam: (index: number) => dispatch(setTrackedTeam(index)),
  togglePPR: () => dispatch(togglePPR()),
  toggleRosterFormatting: () => dispatch(toggleRosterFormatting())
});

export default connect(
  mapStateToProps,
  mapDispathToProps
)(Settings);
