import * as React from "react";
import { connect } from "react-redux";

import { Position } from "../Player";
import { IStoreState } from "../store/store";
import { ITeam } from "../Team";
import PlayerCard from "./PlayerCard";
import "./TeamPicks.css";

interface IProps {
  trackedTeam: ITeam;
  mobile?: boolean;
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
    const { mobile, trackedTeam } = this.props;

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
          </header>

          <div className="Pick-Column">
            {trackedTeam.QB.map((r, i) => (
              <PlayerCard
                key={r ? r.name : i}
                player={r}
                pos="QB"
                length={this.state.cardLength}
              />
            ))}
            {trackedTeam.RB.map((r, i) => (
              <PlayerCard
                key={r ? r.name : i}
                player={r}
                pos="RB"
                length={this.state.cardLength}
              />
            ))}
            {trackedTeam.WR.map((w, i) => (
              <PlayerCard
                key={w ? w.name : i}
                player={w}
                pos="WR"
                length={this.state.cardLength}
              />
            ))}
            {trackedTeam.FLEX.map((r, i) => (
              <PlayerCard
                key={r ? r.name : i}
                player={r}
                pos="FLEX"
                length={this.state.cardLength}
              />
            ))}
            {trackedTeam.TE.map((r, i) => (
              <PlayerCard
                key={r ? r.name : i}
                player={r}
                pos="TE"
                length={this.state.cardLength}
              />
            ))}
            {trackedTeam.DST.map((r, i) => (
              <PlayerCard
                key={r ? r.name : i}
                player={r}
                pos="DST"
                length={this.state.cardLength}
              />
            ))}
            {trackedTeam.K.map((r, i) => (
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
            {trackedTeam.BENCH.map((p, i) => (
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

  private getCardLength = (): number => {
    if (this.props.mobile) {
      const mobileWidth = window.innerWidth * 0.85;
      return Math.floor(mobileWidth / 4) - 4; // 4px margin
    }

    const thisWidth = window.innerWidth * 0.25 - 60; // 25% width of total window size, 15px padding on both sides
    return Math.min(85, Math.floor(thisWidth / 3) - 8); // 8 == 2px border, 6px margin
  };
}

const mapStateToProps = ({ teams, trackedTeam }: IStoreState) => ({
  trackedTeam: teams[trackedTeam]
});

export default connect(mapStateToProps)(TeamPicks);
