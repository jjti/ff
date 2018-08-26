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

          <div className="Pick-Columns">
            <div className="Pick-Column">
              <div className="Pick-Row QB-Row">
                <PlayerCard
                  player={trackedTeam.QB}
                  pos="QB"
                  length={this.state.cardLength}
                />
              </div>
              <div className="Pick-Row RB-Row">
                {trackedTeam.RBs.map((r, i) => (
                  <PlayerCard
                    key={r ? r.name : i}
                    player={r}
                    pos="RB"
                    length={this.state.cardLength}
                  />
                ))}
              </div>
              <div className="Pick-Row WR-Row">
                {trackedTeam.WRs.map((w, i) => (
                  <PlayerCard
                    key={w ? w.name : i}
                    player={w}
                    pos="WR"
                    length={this.state.cardLength}
                  />
                ))}
              </div>
              <div className="Pick-Row Flex-Row">
                <PlayerCard
                  player={trackedTeam.Flex}
                  pos="FLEX"
                  length={this.state.cardLength}
                />
              </div>
            </div>
            <div className="Pick-Column">
              <div style={{ height: this.state.cardLength + 16 }} />
              <div className="Pick-Row">
                <PlayerCard
                  player={trackedTeam.TE}
                  pos="TE"
                  length={this.state.cardLength}
                />
              </div>
              <div className="Pick-Row">
                <PlayerCard
                  player={trackedTeam.DST}
                  pos="DST"
                  length={this.state.cardLength}
                />
              </div>
              <div className="Pick-Row">
                <PlayerCard
                  player={trackedTeam.K}
                  pos="K"
                  length={this.state.cardLength}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="Pick-Section">
          <h3>Bench</h3>
          <div className="Pick-Row QB-Row">
            {trackedTeam.Bench.map((p, i) => (
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
    return Math.min(75, Math.floor(thisWidth / 3) - 8); // 8 == 2px border, 6px margin
  };
}

const mapStateToProps = ({ teams, trackedTeam }: IStoreState) => ({
  trackedTeam: teams[trackedTeam]
});

export default connect(mapStateToProps)(TeamPicks);
