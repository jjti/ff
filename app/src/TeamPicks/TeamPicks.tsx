import * as React from "react";
import { connect } from "react-redux";
import { StoreState } from "../store/store";

import "./TeamPicks.css";

import { setTrackedTeam } from "../store/actions/teams";
import { ITeam } from "../Team";
import PlayerCard from "./PlayerCard";

interface IProps {
  activeTeam: ITeam;
  setTrackedTeam: (index: number) => void;
}

const initialState = {
  cardLength: 50
};

type State = Readonly<typeof initialState>;

class TeamPicks extends React.Component<IProps, State> {
  constructor(props: any) {
    super(props);
    this.state = { ...initialState, cardLength: this.getCardLength() };
    window.addEventListener("resize", () =>
      this.setState({ cardLength: this.getCardLength() })
    );
  }

  public render() {
    const { activeTeam } = this.props;

    return (
      <div className="TeamPicks">
        <div className="Pick-Section">
          <h3>STARTERS</h3>
          <div className="Pick-Columns">
            <div className="Pick-Column">
              <div className="Pick-Row QB-Row">
                <PlayerCard
                  player={activeTeam.QB}
                  pos="QB"
                  length={this.state.cardLength}
                />
              </div>
              <div className="Pick-Row RB-Row">
                {activeTeam.RBs.map((r, i) => (
                  <PlayerCard
                    key={r ? r.name : i}
                    player={r}
                    pos="RB"
                    length={this.state.cardLength}
                  />
                ))}
              </div>
              <div className="Pick-Row WR-Row">
                {activeTeam.WRs.map((w, i) => (
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
                  player={activeTeam.Flex}
                  pos="FLEX"
                  length={this.state.cardLength}
                />
              </div>
            </div>
            <div className="Pick-Column">
              <div style={{ height: this.state.cardLength + 16 }} />
              <div className="Pick-Row">
                <PlayerCard
                  player={activeTeam.TE}
                  pos="TE"
                  length={this.state.cardLength}
                />
              </div>
              <div className="Pick-Row">
                <PlayerCard
                  player={activeTeam.DST}
                  pos="DST"
                  length={this.state.cardLength}
                />
              </div>
              <div className="Pick-Row">
                <PlayerCard
                  player={activeTeam.K}
                  pos="K"
                  length={this.state.cardLength}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="Pick-Section">
          <h3>BENCH</h3>
          <div className="Pick-Row QB-Row">
            {activeTeam.Bench.map((p, i) => (
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
    const thisWidth = window.innerHeight * 0.7 - 20; // ~30px padding, 30% width of total window size
    return Math.floor(thisWidth / 8) - 8; // 8 == 2px border, 6px margin
  };
}

const mapStateToProps = (state: StoreState) => ({
  activeTeam: state.teams[state.activeTeam]
});

const mapDispathToProps = (dispatch: any) => ({
  setTrackedTeam: (index: number) => dispatch(setTrackedTeam(index))
});

export default connect(
  mapStateToProps,
  mapDispathToProps
)(TeamPicks);
