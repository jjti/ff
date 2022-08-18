import * as React from 'react';
import { connect } from 'react-redux';
import Card from './Card';
import { StarterPositions } from '../lib/models/Player';
import { ITeam, NullablePlayer } from '../lib/models/Team';
import { IStoreState } from '../lib/store/store';

interface IProps {
  mobile?: boolean;
  numberOfTeams: number;
  teams: ITeam[];
  trackedTeam: number;
}

const initialState = {
  cardLength: 50,
};

type State = Readonly<typeof initialState>;

class TeamPicks extends React.Component<IProps, State> {
  public static defaultProps = {
    mobile: false,
  };

  constructor(props: any) {
    super(props);
    this.state = {
      ...initialState,
      cardLength: 55,
    };
  }

  componentDidMount = () => {
    this.setState({
      cardLength: this.getCardLength(),
    });
    window.addEventListener('resize', () =>
      this.setState({ cardLength: this.getCardLength() })
    );
  };

  getCardLength = (): number => {
    if (this.props.mobile) {
      const mobileWidth = window.innerWidth * 0.85;
      return Math.floor(mobileWidth / 4) - 4; // 4px margin
    }

    const thisWidth = window.innerWidth * 0.2; // 25% width of total window size, 15px padding on both sides
    return Math.min(85, Math.floor(thisWidth / 3) - 8); // 8 == 2px border, 6px margin
  };

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
            {StarterPositions.map((pos) =>
              trackedTeamRoster[pos].map((p: NullablePlayer, j: number) => (
                // @ts-ignore
                <Card
                  key={p ? p.name : `${pos}${j}`}
                  // @ts-ignore
                  pick={{ player: p, pickNumber: 0, team: 0 }}
                  playerMeta={true}
                  // SUPERFLEX is too long
                  pos={pos === 'SUPERFLEX' ? 'SUPER' : pos}
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
                // @ts-ignore
                pos={r ? r.pos : 'BE'}
                length={this.state.cardLength}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({
  numberOfTeams,
  teams,
  trackedTeam,
}: IStoreState) => ({
  numberOfTeams,
  teams,
  trackedTeam,
});

const mapDispathToProps = (dispatch: any) => ({});

export default connect(mapStateToProps, mapDispathToProps)(TeamPicks);
