import * as React from 'react';
import { Link } from 'react-router-dom';

import './About.css';

export default () => (
  <div className="About">
    <header>
      <Link to="/">
        <h1>ffdraft.app</h1>
      </Link>
    </header>

    <h3>Background</h3>
    <p>
      This is a fantasy football draft application. It is designed to be 1. free
      2. intuitive and 3. smart about player ranking.
    </p>

    <p>
      The inspiration for <span>ffdraft.app</span> came from{' '}
      <a target="_blank" href="https://fantasyfootballanalytics.net/">
        https://fantasyfootballanalytics.net/
      </a>
      . I liked the idea of{' '}
      <a href="https://fantasyfootballanalytics.net/2017/03/best-fantasy-football-projections-2017.html">
        aggregating forecasting models
      </a>{' '}
      from multiple sources. It seemed analogous to{' '}
      <a target="_blank" href="https://en.wikipedia.org/wiki/Nate_Silver">
        Nate Silver's
      </a>{' '}
      approach to poll aggregation. Plus FFA's creator was an{' '}
      <a
        href="https://fantasyfootballanalytics.net/2013/03/isaac-petersen.html"
        target="_blank">
        associate professor
      </a>
      , so I trusted the methodology more than random Excel sheets that flood
      the fantasy football{' '}
      <a href="https://www.reddit.com/r/fantasyfootball/" target="_blank">
        subreddits
      </a>
      . But FFA's application was an R Shiny web-app and hardly usable close to
      draft-season; the server would get choke to the point of the application
      not loading.
    </p>

    <p>
      There is a long list of alternative fantasy football draft tools on Reddit
      and the world wide-web. But I do not think any of them meet the three
      design criteria that I listed. They fall into two buckets: Excel sheets
      (not-intuitive/data-poor) and paid products (Fantasy Pros, Draft Slayer,
      etc.).
    </p>

    <h3>Methodology</h3>
    <p>
      The basis of this app's player ranking is value-over-replacement.
      Traditionally, the "replacement" player meant the first bench player for a
      given position. So in a 12 person league, the baseline forecast value
      against which other QBs are compared would be the 13th best QB. The best
      QB's value becomes their projected end-of-year points minus the projected
      end-of-year points of QB #13. In other words: "The value of a player is
      determined not by the number of points he scores, but by how much he
      outscores his peers at his particular position."
    </p>

    <p>
      Unfortunately, following a value-over-replacement sort too literally
      produces whacky results: DSTs and kickers start topping the list as early
      as round 5 and 6. The solution used in ffdraft.app is based on an one
      proposed in an article at{' '}
      <a href="https://www.footballguys.com/05vbdrevisited.htm" target="_blank">
        footballguys.com
      </a>
      . Rather than having each baseline player be the number of needed players
      per team + one (ex: the 13th QB in a 12-team league), the replacement
      player becomes one more than the number of players drafted to each after
      10 rounds -- roughly enough picks to fill an average starting line-up. In
      the same QB example: if, on average, eight QBs are drafted after 10
      rounds, the baseline/replacement QB becomes the ninth best forecasted QB.
      In practice this better predicts other teams' drafts.
    </p>

    <h3>Data Sources</h3>
    <p>
      Right now raw player/DST stats are coming from ESPN, CBS, and NFL. These
      are stats like estimated "number of rushing touchdowns," "extra points,"
      etc. It is important to note that these are <em>not</em> rankings. While
      aggregated rankings, a la{' '}
      <a href="https://www.fantasypros.com/">Fantasy Pros</a>, are interesting,
      they are not useful for most drafts, since the value of each player
      relative to their "replacement" depends on the number of teams and the
      league's scoring.
    </p>

    <p>
      Average draft position is based on aggregated data from{' '}
      <a href="https://www.fantasypros.com/">Fantasy Pros</a>.
    </p>

    <h3>Source code</h3>
    <p>
      The code is open-source at:{' '}
      <a target="_blank" href="https://github.com/JJTimmons/ff">
        https://github.com/JJTimmons/ff
      </a>
    </p>

    <h4>Back-end</h4>
    <p>
      The scrapers are python scripts in{' '}
      <a href="https://github.com/JJTimmons/ff/blob/master/model/src/data/projection_scrape.py">
        /model/src/data/projections_scrape.py
      </a>
      . They use <a href="https://selenium-python.readthedocs.io/">Selenium</a>{' '}
      and a Google Chrome driver to scrape projections from ESPN, CBS, and NFL.
      Selenium is needed, versus just the{' '}
      <a href="https://pypi.org/project/requests/2.7.0/</p>">requests</a>{' '}
      package, because the ESPN site is entirely React-JS rendered and lacks
      routes for pagination. There is also some lazy loading going on (ESPN +
      NFL), so even after loading the URL via Selenium, some data is still
      missing at the bottom of each page. Selenium's ActionChains make it easy
      to simulate events -- clicking and scrolling -- to traverse all the
      projection pages.
    </p>

    <p>
      Right now I average together collated, common fields from each data source
      server-side. For example, "pass_tds" holds the expected number of
      touchdowns thrown by a QB over the course of a season. It is not called
      "pass_tds" on any of the sources' websites, so I map each source's fields
      to a common dictionary (from ESPN: "td_pass", CBS: "touchdowns_passes",
      NFL: "passing_td"). It would be easier to skip this step, and just scrape
      and average each site's forecasted number of fantasy points. This is what{' '}
      <a href="https://www.fantasypros.com/">Fantasy Pros</a> does with its
      consensus rankings. But storing the raw, underlying stats, as opposed to
      their summed forecast, is extremely important. It gives users the change
      to change the ranking and value estimates to based upon their league
      scoring system. Small changes in points per reception, points per passing
      touchdown, etc. have large effects and the final value-based player rank.
    </p>

    <p>
      There is another script in{' '}
      <a href="https://github.com/JJTimmons/ff/blob/master/model/src/data/projection_aggregate.py">
        /model/src/data/projection_aggregate.py
      </a>{' '}
      that averages all the fields from the each source (for those where a value
      is defined).
    </p>

    <h4>Front-end</h4>
    <p>
      The application is written with React + Typescript using the{' '}
      <a href="https://www.npmjs.com/package/react-scripts-ts" target="_blank">
        react-scripts-ts
      </a>{' '}
      package that adds Typescript to React Create App. There is no DB, the
      projections are stored with in the applications build output{' '}
      <a
        href="https://github.com/JJTimmons/ff/blob/master/app/src/projections.json"
        target="_blank">
        as JSON
      </a>
      .
    </p>
  </div>
);
