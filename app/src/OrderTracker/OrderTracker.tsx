import * as React from "react";
import { connect } from "react-redux";

import { setTrackedTeam } from "../store/actions/teams";
import { IStoreState } from "../store/store";
import { ITeam } from "../Team";

import "./OrderTracker.css";

interface IProps {
  activeTeam: number;
  teams: ITeam[];
  setTrackedTeam: (index: number) => void;
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
          <label>
            Focused Team
            <select
              className="Tracked-Team-Select"
              onChange={this.updateTrackedTeam}
            >
              {new Array(10).fill(0).map((_, i) => (
                <option key={`Pick-Selection-${i}`} value={i}>{`Team ${i +
                  1}`}</option>
              ))}
            </select>
          </label>
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

  private updateTrackedTeam = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    this.props.setTrackedTeam(+value);
  };
}

const mapStateToProps = (state: IStoreState) => ({
  activeTeam: state.activeTeam,
  teams: state.teams
});

const mapDispathToProps = (dispatch: any) => ({
  setTrackedTeam: (index: number) => dispatch(setTrackedTeam(index))
});

export default connect(
  mapStateToProps,
  mapDispathToProps
)(OrderTracker);
