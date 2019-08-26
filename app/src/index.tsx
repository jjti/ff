import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import About from './About/About';
import App from './App';
import './index.css';
import { unregister } from './registerServiceWorker';
import { setPlayers } from './store/actions/players';
import { store } from './store/store';

window.onload = () => {
  // set the player list using setPlayers
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      const playerDataArray = JSON.parse(xhttp.responseText);
      store.dispatch(setPlayers(playerDataArray.data));
    }
  };
  xhttp.open('GET', `${process.env.PUBLIC_URL}/projections.json`, true);
  xhttp.send();
};

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <Route path="/about" component={About} />
      <Route exact={true} path="/" component={App} />
    </Router>
  </Provider>,
  document.getElementById('root') as HTMLElement
);

unregister();
