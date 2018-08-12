import * as React from "react";

import "./TeamPicks.css";

import { ITeam } from "../Team";
import PlayerCard from "./PlayerCard";

const mockTeam: ITeam = {
  Bench: [null, null, null, null, null, null, null],
  DST: null,
  Flex: null,
  K: null,
  QB: {
    adp: 22,
    experts: 320.745,
    madden: 99,
    name: "Aaron Rodgers",
    pos: "QB",
    pred: 278.3571,
    replace_value: 229.0808,
    team: "Packers",
    vor: 49.2762
  },
  RBs: [
    {
      adp: 118,
      experts: 282.8875,
      madden: 84,
      name: "Alex Smith",
      pos: "RB",
      pred: 222.6565,
      replace_value: 229.0808,
      team: "Redskins",
      vor: -6.4243
    },
    null
  ],
  TE: null,
  WRs: [
    {
      adp: 89,
      experts: 291.6575,
      madden: 87,
      name: "Andrew Luck",
      pos: "WR",
      pred: 238.0473,
      replace_value: 229.0808,
      team: "Colts",
      vor: 8.9664
    },
    null
  ]
};

const initialState = {
  cardLength: 50
};
type State = Readonly<typeof initialState>;

const getCardLength = (): number => {
  const thisWidth = window.innerHeight * 0.7 - 20; // ~30px padding, 30% width of total window size
  return Math.floor(thisWidth / 8) - 8; // 8 == 2px border, 6px margin
};

export default class Picks extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);
    this.state = { ...initialState, cardLength: getCardLength() };
    window.addEventListener("resize", () =>
      this.setState({ cardLength: getCardLength() })
    );
  }

  public render() {
    return (
      <div>
        <div className="Pick-Section">
          <h3>STARTERS</h3>
          <div className="Pick-Columns">
            <div className="Pick-Column">
              <div className="Pick-Row QB-Row">
                <PlayerCard
                  player={mockTeam.QB}
                  pos="QB"
                  length={this.state.cardLength}
                />
              </div>
              <div className="Pick-Row RB-Row">
                {mockTeam.RBs.map((r, i) => (
                  <PlayerCard
                    key={r ? r.name : i}
                    player={r}
                    pos="RB"
                    length={this.state.cardLength}
                  />
                ))}
              </div>
              <div className="Pick-Row WR-Row">
                {mockTeam.WRs.map((w, i) => (
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
                  player={mockTeam.Flex}
                  pos="FLEX"
                  length={this.state.cardLength}
                />
              </div>
            </div>
            <div className="Pick-Column">
              <div style={{ height: this.state.cardLength + 16 }} />
              <div className="Pick-Row">
                <PlayerCard
                  player={mockTeam.TE}
                  pos="TE"
                  length={this.state.cardLength}
                />
              </div>
              <div className="Pick-Row">
                <PlayerCard
                  player={mockTeam.DST}
                  pos="DST"
                  length={this.state.cardLength}
                />
              </div>
              <div className="Pick-Row">
                <PlayerCard
                  player={mockTeam.K}
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
            {mockTeam.Bench.map(p => (
              <PlayerCard player={p} pos="?" length={this.state.cardLength} />
            ))}
          </div>
        </div>
      </div>
    );
  }
}
