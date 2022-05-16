import { setPlayers } from 'lib/store/actions/players';
import { store } from 'lib/store/store';
import Head from 'next/head';
import React from 'react';
import { Provider } from 'react-redux';

import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'
import './styles.css';

if (typeof window !== 'undefined') {
  window.onload = () => {
    // set the player list using setPlayers
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState === 4 && this.status === 200) {
        const playerDataArray = JSON.parse(xhttp.responseText);
        store.dispatch(setPlayers(playerDataArray.data));
      } else if (this.readyState === 4 && this.status !== 200) {
        console.warn(this.readyState, this.status, xhttp.responseText);
      }
    };
    xhttp.open('GET', '/projections.json', true);
    xhttp.send();
  };
}

export default ({
  Component,
  pageProps,
}: {
  Component: any;
  pageProps: any;
}) => (
  <>
    <Head>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
      />
    </Head>
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  </>
);
