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
  undoPick: (pick: IPick) => void;
}

export default React.forwardRef(
  (
    {
      activeTeam,
      cardLength,
      headerMessage,
      open,
      pastPicks,
      toggleOpen,
      undoPick
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
              // If there was a player drafted, show their name and the undo button
              <div
                key={p.pickNumber}
                className={`Card ${p.player ? '' : 'Card-Empty'}`}
                style={{ width: cardLength, height: cardLength }}>
                <h5>{p.team + 1}</h5>
                {p.player && (
                  <button
                    className="Undo-Player-Pick"
                    onClick={() => undoPick(p)}
                  />
                )}
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
