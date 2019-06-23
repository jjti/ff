import * as React from 'react';
import Card from '../Card/Card';
import { IPick } from '../models/Team';
import './PickHistory.css';

interface IPickHistoryProps {
  activeTeam: number;
  cardLength: number;
  currentPick: number;
  headerMessage: string;
  open: boolean;
  pastPicks: IPick[];
  refProp: any;
  toggleOpen: () => void;
  trackedTeam: number;
  undoPick: (pick: IPick) => void;
}

export default class PickHistory extends React.Component<IPickHistoryProps> {
  public render() {
    const {
      activeTeam,
      cardLength,
      currentPick,
      headerMessage,
      open,
      pastPicks,
      refProp,
      toggleOpen,
      trackedTeam
    } = this.props;

    return (
      <div className="PickHistory Section">
        <header className="PickHistory-Header" onClick={toggleOpen}>
          <h3>Picks</h3>
          <p>{headerMessage}</p>
          {open ? <i className="up Grayed" /> : <i className="down Grayed" />}
        </header>

        {open && (
          <>
            <div ref={refProp} className="PicksRow">
              {
                // @ts-ignore
                <Card
                  currentPick={true}
                  length={cardLength}
                  pick={{
                    pickNumnber: currentPick,
                    player: null,
                    team: activeTeam
                  }}
                  trackedTeamPicking={activeTeam === trackedTeam}
                />
              }

              {pastPicks.map(pick => (
                // If there was a player drafted, show their name and the undo button
                // @ts-ignore
                <Card
                  key={pick.pickNumber}
                  // @ts-ignore
                  length={cardLength}
                  pick={pick}
                />
              ))}

              <div className="PicksRow-Haze" />
            </div>
          </>
        )}
      </div>
    );
  }
}
