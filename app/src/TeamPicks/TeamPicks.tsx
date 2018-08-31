import * as React from "react";
import { connect } from "react-redux";

import { Position } from "../Player";
import { setTrackedTeam } from "../store/actions/teams";
import { IStoreState } from "../store/store";
import { ITeam } from "../Team";
import PlayerCard from "./PlayerCard";
import "./TeamPicks.css";

interface IProps {
  mobile?: boolean;
  numberOfTeams: number;
  trackedTeam: number;
  trackedTeamRoster: ITeam;
  setTrackedTeam: (team: number) => void;
}

const initialState = {
  cardLength: 50,
  showStarters: true
};

type State = Readonly<typeof initialState>;

class TeamPicks extends React.PureComponent<IProps, State> {
  public static defaultProps = {
    mobile: false
  };

  public starterPositions: Position[] = [
    "QB",
    "RB",
    "RB",
    "WR",
    "WR",
    "FLEX",
    "TE",
    "DST",
    "K"
  ];

  constructor(props: any) {
    super(props);
    this.state = { ...initialState, cardLength: this.getCardLength() };
    window.addEventListener("resize", () =>
      this.setState({ cardLength: this.getCardLength() })
    );
  }

  public render() {
    const {
      mobile,
      numberOfTeams,
      trackedTeam,
      trackedTeamRoster
    } = this.props;

    // if it's mobile, return just the small header and separate Starter and Mobile
    // team members into separate tabs
    if (mobile) {
      return (
        <div className="TeamPicks">
          <header>
            <h3>ffdraft.app</h3>
          </header>
        </div>
      );
    }

    return (
      <div className="TeamPicks Section Stick-Section">
        <div className="Pick-Section">
          <header>
            <h3>Starters</h3>

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
          </header>

          <div className="Pick-Column">
            {trackedTeamRoster.QB.map((r, i) => (
              <PlayerCard
                key={r ? r.name : i}
                player={r}
                pos="QB"
                length={this.state.cardLength}
              />
            ))}
            {trackedTeamRoster.RB.map((r, i) => (
              <PlayerCard
                key={r ? r.name : i}
                player={r}
                pos="RB"
                length={this.state.cardLength}
              />
            ))}
            {trackedTeamRoster.WR.map((w, i) => (
              <PlayerCard
                key={w ? w.name : i}
                player={w}
                pos="WR"
                length={this.state.cardLength}
              />
            ))}
            {trackedTeamRoster.FLEX.map((r, i) => (
              <PlayerCard
                key={r ? r.name : i}
                player={r}
                pos="FLEX"
                length={this.state.cardLength}
              />
            ))}
            {trackedTeamRoster.TE.map((r, i) => (
              <PlayerCard
                key={r ? r.name : i}
                player={r}
                pos="TE"
                length={this.state.cardLength}
              />
            ))}
            {trackedTeamRoster.DST.map((r, i) => (
              <PlayerCard
                key={r ? r.name : i}
                player={r}
                pos="DST"
                length={this.state.cardLength}
              />
            ))}
            {trackedTeamRoster.K.map((r, i) => (
              <PlayerCard
                key={r ? r.name : i}
                player={r}
                pos="K"
                length={this.state.cardLength}
              />
            ))}
          </div>
        </div>
        <div className="Pick-Section">
          <h3>Bench</h3>
          <div className="Pick-Column">
            {trackedTeamRoster.BENCH.map((p, i) => (
              <PlayerCard
                key={`bench_${i}`}
                player={p}
                pos="?"
                length={this.state.cardLength}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  private updateTrackedTeam = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    this.props.setTrackedTeam(+value);
  };

  private getCardLength = (): number => {
    if (this.props.mobile) {
      const mobileWidth = window.innerWidth * 0.85;
      return Math.floor(mobileWidth / 4) - 4; // 4px margin
    }

    const thisWidth = window.innerWidth * 0.25 - 60; // 25% width of total window size, 15px padding on both sides
    return Math.min(85, Math.floor(thisWidth / 3) - 8); // 8 == 2px border, 6px margin
  };
}

const mapStateToProps = ({
  numberOfTeams,
  teams,
  trackedTeam
}: IStoreState) => ({
  numberOfTeams,
  trackedTeam,
  trackedTeamRoster: teams[trackedTeam]
});

const mapDispathToProps = (dispatch: any) => ({
  setTrackedTeam: (index: number) => dispatch(setTrackedTeam(index))
});

export default connect(
  mapStateToProps,
  mapDispathToProps
)(TeamPicks);
