import * as React from 'react';
import { connect } from 'react-redux';
import Card from '../Card/Card';
import { Position } from '../models/Player';
import { ITeam, NullablePlayer } from '../models/Team';
import { IStoreState } from '../store/store';
import './TeamPicks.css';

interface IProps {
  mobile?: boolean;
  numberOfTeams: number;
  teams: ITeam[];
  trackedTeam: number;
}

const initialState = {
  cardLength: 50
};

type State = Readonly<typeof initialState>;

class TeamPicks extends React.Component<IProps, State> {
  public static defaultProps = {
    mobile: false
  };

  public starterPositions: Position[] = [
    'QB',
    'RB',
    'WR',
    'FLEX',
    'TE',
    'DST',
    'K'
  ];

  constructor(props: any) {
    super(props);
    this.state = { ...initialState, cardLength: this.getCardLength() };
    window.addEventListener('resize', () =>
      this.setState({ cardLength: this.getCardLength() })
    );
  }

  public render() {
    const { trackedTeam, mobile, teams } = this.props;

    const trackedTeamRoster = teams[trackedTeam];

    if (mobile) {
      return null;
    }

    return (
      <div className="TeamPicks Section Stick-Section">
        <div className="Pick-Section">
          <header>
            <h3>Starters</h3>
            <p>{`Team ${trackedTeam + 1}`}</p>
          </header>

          <div className="Pick-Column">
            {this.starterPositions.map(pos =>
              trackedTeamRoster[pos].map((p: NullablePlayer, j: number) => (
                // @ts-ignore
                <Card
                  key={p ? p.name : `${pos}${j}`}
                  // @ts-ignore
                  pick={{ player: p, pickNumber: 0, team: 0 }}
                  playerMeta={true}
                  pos={pos}
                  length={this.state.cardLength}
                />
              ))
            )}
          </div>
        </div>
        <div className="Pick-Section">
          <h3>Bench</h3>
          <div className="Pick-Column">
            {trackedTeamRoster.BENCH.map((r, i) => (
              // @ts-ignore
              <Card
                key={r ? r.name : i}
                // @ts-ignore
                pick={{ player: r, pickNumber: 0, team: 0 }}
                playerMeta={true}
                pos={r ? r.pos : 'BE'}
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

    const thisWidth = window.innerWidth * 0.2; // 25% width of total window size, 15px padding on both sides
    return Math.min(85, Math.floor(thisWidth / 3) - 8); // 8 == 2px border, 6px margin
  };
}

const mapStateToProps = ({
  numberOfTeams,
  teams,
  trackedTeam
}: IStoreState) => ({
  numberOfTeams,
  teams,
  trackedTeam
});

const mapDispathToProps = (dispatch: any) => ({});

export default connect(
  mapStateToProps,
  mapDispathToProps
)(TeamPicks);
