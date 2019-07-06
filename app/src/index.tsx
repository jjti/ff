import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import About from './About/About';
import App from './App';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import { store } from './store/store';

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <Route path="/about" component={About} />
      <Route exact={true} path="/" component={App} />
    </Router>
  </Provider>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
