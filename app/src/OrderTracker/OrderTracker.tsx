import * as React from "react";
import { connect } from "react-redux";

import { IStoreState } from "../store/store";
import { ITeam } from "../Team";
import "./OrderTracker.css";

interface IProps {
  activeTeam: number;
  teams: ITeam[];
}

const initialState = {
  cardLength: 50
};
type State = Readonly<typeof initialState>;

class OrderTracker extends React.Component<IProps, State> {
  public readonly state: State = initialState;

  constructor(props: any) {
    super(props);

    this.state = { ...initialState, cardLength: this.getCardLength() };
    window.addEventListener("resize", () =>
      this.setState({ cardLength: this.getCardLength() })
    );
  }

  public render() {
    const { cardLength } = this.state;

    const currentPickLeft =
      this.props.activeTeam * (cardLength + 16) + 0.2 * cardLength;

    return (
      <div className="OrderTracker">
        <h3>TEAMS</h3>

        <aside>
          <div className="Legend-Row">
            <i className="green-dot" />
            <p className="small">Will be drafted soon</p>
          </div>
        </aside>

        <div className="Team-Cards">
          {this.props.teams.map((t, i) => (
            <div
              className={`Card ${
                i === this.props.activeTeam ? "Card-Active" : "Card-Empty"
              }`}
              key={i}
              style={{ width: cardLength, height: cardLength }}
            >
              <h4>{i + 1}</h4>
              <p className="points">{t.StarterValue}</p>
            </div>
          ))}
        </div>
        <div className="Team-Arrow-Up" style={{ left: currentPickLeft }} />
        <p
          className="Team-Arrow-Label small"
          style={{ left: currentPickLeft + 21 }}
        >
          Current
        </p>
      </div>
    );
  }

  private getCardLength = (): number => {
    const thisWidth = window.innerWidth * 0.65 - 200; // ~30px padding, 70% width of total window size
    return Math.floor(thisWidth / 10) - 8; // 8 == 2px border, 6px margin
  };
}

const mapStateToProps = (state: IStoreState) => ({
  activeTeam: state.activeTeam,
  teams: state.teams
});

export default connect(mapStateToProps)(OrderTracker);
