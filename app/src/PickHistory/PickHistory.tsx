import * as React from 'react';
import Card from '../Card/Card';
import { IPick } from '../models/Team';
import './PickHistory.css';

interface IPickHistoryProps {
  activeTeam: number;
  cardLength: number;
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
      headerMessage,
      open,
      pastPicks,
      refProp,
      toggleOpen
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
              <div
                className="Card Card-Empty"
                style={{ width: cardLength, height: cardLength }}>
                <h5>{activeTeam + 1}</h5>

                <p className="points small">Drafting</p>
              </div>

              {pastPicks.map(pick => (
                // If there was a player drafted, show their name and the undo button
                <Card
                  key={pick.pickNumber}
                  // @ts-ignore
                  length={cardLength}
                  pick={pick}
                  undoPick={this.props.undoPick}
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
