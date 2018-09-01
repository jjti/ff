import * as React from 'react';

import { IPick } from '../Team';

import './PickHistory.css';

interface IPickHistoryProps {
  activeTeam: number;
  cardLength: number;
  headerMessage: string;
  open: boolean;
  pastPicks: IPick[];
  toggleOpen: () => void;
  trackedTeam: number;
}

export default React.forwardRef(
  (
    {
      activeTeam,
      cardLength,
      headerMessage,
      open,
      pastPicks,
      toggleOpen
    }: IPickHistoryProps,
    ref: any
  ) => (
    <div className="PickHistory Section">
      <header className="PickHistory-Header" onClick={toggleOpen}>
        <h3>Picks</h3>
        <p>{headerMessage}</p>
        {open ? <i className="up Grayed" /> : <i className="down Grayed" />}
      </header>

      {open && (
        <>
          <div ref={ref} className="PicksRow">
            <div
              className="Card Card-Empty"
              style={{ width: cardLength, height: cardLength }}>
              <h5>{activeTeam + 1}</h5>

              <div className="Currently-Drafting-Arrow">
                <div className="Arrow-Up" />
                <p className="small">Drafting</p>
              </div>
            </div>

            {pastPicks.map(p => (
              <div
                key={p.pickNumber}
                className="Card"
                style={{ width: cardLength, height: cardLength }}>
                <h5>{p.team + 1}</h5>
                <p>
                  {p.player && p.player.tableName ? p.player.tableName : ''}
                </p>
                <p className="points">Pick {p.pickNumber}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
);
