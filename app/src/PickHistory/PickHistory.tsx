import * as React from 'react';

import { ITeam } from '../Team';

import './PickHistory.css';

interface IPickHistoryProps {
  cardLength: number;
  cursorLeft: number;
  headerMessage: string;
  open: boolean;
  teams: ITeam[];
  toggleOpen: () => void;
  trackedTeam: number;
}

export default ({
  cardLength,
  cursorLeft,
  headerMessage,
  open,
  teams,
  toggleOpen,
  trackedTeam
}: IPickHistoryProps) => (
  <div className="OrderTracker Section">
    <header className="OrderTracker-Header" onClick={toggleOpen}>
      <h3>Teams</h3>
      <p>{headerMessage}</p>
      {open ? <i className="up Grayed" /> : <i className="down Grayed" />}
    </header>

    {open && (
      <>
        <div className="Team-Cards">
          {teams.map((t, i) => (
            <div
              className={`Card ${
                i === trackedTeam ? 'Card-Active' : 'Card-Empty'
              }`}
              key={i}
              style={{ width: cardLength, height: cardLength }}>
              <h4>{i + 1}</h4>
              <p className="points">{t.StarterValue}</p>
            </div>
          ))}
        </div>
        <div className="Team-Arrow-Up" style={{ left: cursorLeft }} />
        <p className="Team-Arrow-Label small" style={{ left: cursorLeft + 21 }}>
          Drafting
        </p>
      </>
    )}
  </div>
);
