import * as React from "react";
import { connect } from "react-redux";

import { setNumberOfTeams, setTrackedTeam } from "../store/actions/teams";
import { IStoreState } from "../store/store";

import "./Settings.css";

interface IProps {
  currentPick: number;
  numberOfTeams: number;
  setNumberOfTeams: (count: number) => void;
  setTrackedTeam: (index: number) => void;
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
    const { currentPick, numberOfTeams, trackedTeam } = this.props;

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
        <header>
          <h3 id="Settings-Header">Settings</h3>
          {open ? (
            <i className="up Grayed" onClick={this.toggleSettings} />
          ) : (
            <i className="down Grayed" onClick={this.toggleSettings} />
          )}
        </header>
        {open && (
          <aside>
            <label>
              Your team
              <div className="Select-Container">
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

            <label>
              Number of teams
              <div className="Select-Container">
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
  trackedTeam
}: IStoreState) => ({
  currentPick,
  numberOfTeams,
  trackedTeam
});

const mapDispathToProps = (dispatch: any) => ({
  setNumberOfTeams: (count: number) => dispatch(setNumberOfTeams(count)),
  setTrackedTeam: (index: number) => dispatch(setTrackedTeam(index))
});

export default connect(
  mapStateToProps,
  mapDispathToProps
)(Settings);
