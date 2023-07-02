import { initStore } from 'lib/store/actions/players';
import { persistor, store } from 'lib/store/store';
import Head from 'next/head';
import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import './styles.css';
import { IPlayer } from 'lib/models/Player';
import { ToastContainer } from 'react-toastify';

if (typeof window !== 'undefined') {
  window.onload = () => {
    // if the last sync was within 12 hours, don't re-sync players
    const { lastSync, lastSyncPlayers, players } = store.getState();
    if (players.length && lastSyncPlayers.length && lastSync > 0 && Date.now() - lastSync < 1000 * 60 * 60 * 12) {
      return;
    }

    // set the player list using setPlayers
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState === 4 && this.status === 200) {
        const playerDataArray = JSON.parse(xhttp.responseText);
        let players = playerDataArray.data as IPlayer[];

        // tableName returns an abbreviated player name that fits in the cards and rows
        const tableName = (name: string) => `${name[0]}. ${name.split(' ')[1]}`;
        const positions = new Set(['QB', 'RB', 'WR', 'TE', 'DST', 'K']);
        players = players
          .map((p) => ({
            ...p,
            tableName: p.pos === 'DST' ? p.name : tableName(p.name),
          }))
          .filter((p) => positions.has(p.pos)); // TODO: filter "P" players on server

        store.dispatch(initStore(players));
      } else if (this.readyState === 4 && this.status !== 200) {
        console.warn(this.readyState, this.status, xhttp.responseText);
      }
    };
    xhttp.open('GET', '/projections.json', true);
    xhttp.send();
  };
}

export default ({ Component, pageProps }: { Component: any; pageProps: any }) => (
  <>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
    </Head>
    {/* @ts-ignore */}
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Component {...pageProps} />
        <ToastContainer position="bottom-right" hideProgressBar />
      </PersistGate>
    </Provider>
  </>
);
