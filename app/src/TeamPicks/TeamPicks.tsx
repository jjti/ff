import * as React from 'react';
import { connect } from 'react-redux';
import Card from '../Card/Card';
import { Position } from '../models/Player';
import { ITeam } from '../models/Team';
import { IStoreState } from '../store/store';
import './TeamPicks.css';

interface IProps {
  mobile?: boolean;
  numberOfTeams: number;
  teams: ITeam[];
  trackedTeam: number;
}

const initialState = {
  cardLength: 50,
  showStarters: true
};

type State = Readonly<typeof initialState>;

class TeamPicks extends React.Component<IProps, State> {
  public static defaultProps = {
    mobile: false
  };

  public starterPositions: Position[] = [
    'QB',
    'RB',
    'RB',
    'WR',
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
            <p>{`Team ${trackedTeam + 1}`}</p>
          </header>

          <div className="Pick-Column">
            {trackedTeamRoster.QB.map((r, i) => (
              // @ts-ignore
              <Card
                key={r ? r.name : i}
                // @ts-ignore
                pick={{ player: r, pickNumber: 0, team: 0 }}
                playerMeta={true}
                pos="QB"
                length={this.state.cardLength}
              />
            ))}
            {trackedTeamRoster.RB.map((r, i) => (
              // @ts-ignore
              <Card
                key={r ? r.name : i}
                // @ts-ignore
                pick={{ player: r, pickNumber: 0, team: 0 }}
                playerMeta={true}
                pos="RB"
                length={this.state.cardLength}
              />
            ))}
            {trackedTeamRoster.WR.map((r, i) => (
              // @ts-ignore
              <Card
                key={r ? r.name : i}
                // @ts-ignore
                pick={{ player: r, pickNumber: 0, team: 0 }}
                playerMeta={true}
                pos="WR"
                length={this.state.cardLength}
              />
            ))}
            {trackedTeamRoster.FLEX.map((r, i) => (
              // @ts-ignore
              <Card
                key={r ? r.name : i}
                // @ts-ignore
                pick={{ player: r, pickNumber: 0, team: 0 }}
                playerMeta={true}
                pos="FLEX"
                length={this.state.cardLength}
              />
            ))}
            {trackedTeamRoster.TE.map((r, i) => (
              // @ts-ignore
              <Card
                key={r ? r.name : i}
                // @ts-ignore
                pick={{ player: r, pickNumber: 0, team: 0 }}
                playerMeta={true}
                pos="TE"
                length={this.state.cardLength}
              />
            ))}
            {trackedTeamRoster.DST.map((r, i) => (
              // @ts-ignore
              <Card
                key={r ? r.name : i}
                // @ts-ignore
                pick={{ player: r, pickNumber: 0, team: 0 }}
                playerMeta={true}
                pos="DST"
                length={this.state.cardLength}
              />
            ))}
            {trackedTeamRoster.K.map((r, i) => (
              // @ts-ignore
              <Card
                key={r ? r.name : i}
                // @ts-ignore
                pick={{ player: r, pickNumber: 0, team: 0 }}
                playerMeta={true}
                pos="K"
                length={this.state.cardLength}
              />
            ))}
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
