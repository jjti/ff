import * as React from 'react';
import { Helmet as ReactHelmet } from 'react-helmet';

export default () => (
  <ReactHelmet>
    <title>Fantasy Football Draft App</title>
    <meta charSet="utf-8" />
    <meta
      name="description"
      content="A free Fantasy Football Draft Assistant with rankings and pick recommendations"
    />
    <meta
      name="keywords"
      content="fantasy,football,ranking,picks,rosters,scoring,projections,assistant,wizard,help"
    />
  </ReactHelmet>
);
