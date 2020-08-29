import { CloseOutlined } from '@ant-design/icons';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Helmet from '../Helmet';

import './About.css';

export default () => (
  <div className="About">
    {Helmet}

    <header>
      <Link to="/">
        <h1>ffdraft.app</h1>
      </Link>

      <Link to="/" style={{ marginLeft: 'auto' }}>
        <CloseOutlined style={{ fontSize: 30 }} />
      </Link>
    </header>

    <h3>Background</h3>
    <p>
      This is a fantasy football draft app. It is designed to be free,
      intuitive, and as accurate as possible with its draft recommendations.
    </p>

    <p>
      The inspiration for <span>ffdraft.app</span> came from{' '}
      <a target="_blank" href="https://fantasyfootballanalytics.net/">
        https://fantasyfootballanalytics.net/ (FFA)
      </a>
      . I liked the idea of{' '}
      <a href="https://fantasyfootballanalytics.net/2017/03/best-fantasy-football-projections-2017.html">
        aggregating forecasting models
      </a>{' '}
      from multiple sources. It's like{' '}
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
      . But FFA's application was an R Shiny web-app and unusable in
      draft-season; the server would get choke to the point of the page not
      loading.
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
      This app uses "value-over-replacement." That means each player's worth is
      relative to others in the same position. In particular, each player's
      value is relative to their positions "replacement player." Traditionally,
      the "replacement" player meant the first bench player for a given
      position. So, in a 12 person league, the 13th best QB would be the
      replacement QB. The best QB's value-over-replacement is their projected
      end-of-year points minus the projected end-of-year points of QB #13. In
      summation: "The value of a player is determined not by the number of
      points he scores, but by how much he outscores his peers at his particular
      position."
    </p>

    <p>
      Following a value-over-replacement sort too literally produces whacky
      results: DSTs and kickers start topping the list as early as round 5 and
      6. The solution used in ffdraft.app is based on an one proposed in an
      article at{' '}
      <a href="https://www.footballguys.com/05vbdrevisited.htm" target="_blank">
        footballguys.com
      </a>
      . Rather than having each baseline player be the number of needed players
      per team + one (ex: the 13th QB in a 12-team league), the replacement
      player becomes one more than the number of players in that position
      drafted after 10 rounds -- enough picks to fill an average starting
      line-up. In the same QB example: if, on average, eight QBs are drafted
      after 10 rounds, the baseline/replacement QB becomes the ninth best
      forecasted QB. In practice this better predicts other teams' drafts.
    </p>

    <p>
      I average together common fields from each data source server-side. For
      example, "pass_tds" holds the expected number of touchdowns thrown by a QB
      over the course of a season. It is not called "pass_tds" on any of the
      sources' website. Instead I map each source's fields to a common
      dictionary (ESPN: "td_pass", CBS: "touchdowns_passes", NFL: "passing_td").
      It would be easier to skip this step, and just scrape and average each
      site's forecasted number of fantasy points. This is what{' '}
      <a href="https://www.fantasypros.com/">Fantasy Pros</a> does for consensus
      rankings. But storing the raw, underlying stats, as opposed to their
      summed forecast, is important. Users can change the ranking and value
      estimates based upon their league scoring system. Small changes in points
      per reception, points per passing touchdown, etc. have large effects on
      final value-based player rankings.
    </p>

    <h3>Data Sources</h3>
    <p>Player and DST stats are coming from ESPN, CBS, and NFL.</p>

    <p>
      Average draft position is coming from{' '}
      <a href="https://www.fantasypros.com/">Fantasy Pros</a>.
    </p>

    <h3>Source code</h3>
    <p>
      The code is open-source and accessible at:{' '}
      <a target="_blank" href="https://github.com/JJTimmons/ff">
        https://github.com/JJTimmons/ff
      </a>
      . If you have any feature requests or see any bugs, please share them with
      me with an{' '}
      <a target="_blank" href="https://github.com/JJTimmons/ff/issues">
        Issue
      </a>
      .
    </p>
  </div>
);
