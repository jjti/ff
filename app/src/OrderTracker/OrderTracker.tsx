import * as React from "react";

import "./OrderTracker.css";

const initialState = {
  cardLength: 50,
  currentPickIndex: 2
};
type State = Readonly<typeof initialState>;

const getCardLength = (): number => {
  const thisWidth = window.innerWidth * 0.65 - 200; // ~30px padding, 70% width of total window size
  return Math.floor(thisWidth / 10) - 8; // 8 == 2px border, 6px margin
};

export default class OrderTracker extends React.Component<{}, State> {
  public readonly state: State = initialState;

  constructor(props: any) {
    super(props);

    this.state = { ...initialState, cardLength: getCardLength() };
    window.addEventListener("resize", () =>
      this.setState({ cardLength: getCardLength() })
    );
  }

  public render() {
    const { cardLength } = this.state;

    const currentPickLeft =
      this.state.currentPickIndex * (cardLength + 16) + 0.2 * cardLength;

    return (
      <div className="OrderTracker">
        <h3>TEAMS</h3>
        <div className="Team-Cards">
          {Array.from(new Array(10).keys()).map(k => (
            <div
              className={`Card ${
                k === this.state.currentPickIndex ? "" : "Card-Empty"
              }`}
              key={k}
              style={{ width: cardLength, height: cardLength }}
            >
              <h4>{k + 1}</h4>
              <p className="points">{Math.floor(Math.random() * 500)}</p>
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
}
