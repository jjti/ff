# PPR and Value Based Drafting

I am interested in how league settings affect optimal draft strategy. Things like the number of teams and league scoring. My guess is that one-size-fits-all rankings are misleading and inaccurate for any non-vanilla league. In this post, I wanted to start with PPR, the most discussed FF settings by far. Running backs like James White are strongly rewarded in leagues with PPR whereas rush dependent backs like Sony Michel get clobbered. Below are some players who are particularly affected by PPR for the 2019 season.

## Players

A subset of these results is available [as a figure](https://imgur.com/a/7pQHxCL). The players below had the 20 largest absolute differences in PPR - non-PPR leagues.

The `diff` column below is the change in the player's rank in a non-PPR versus a PPR league using a value based draft strategy (described at the bottom). A negative number means the player does much better in a PPR league as compared to a non-PPR league.

There were fewer players with large jumps in rank than there were players with large falls. The most positively affected player here was, by far, Dion Lewis. It's not even close (among these top picks) in terms of jump in value. If you wind up in a league where other teams are picking using a stock non-PPR ranking, he may be hugely valuable. Conversely, touchdown-dependent Tyreek Hill's value plummets once other players begin to be rewarded per reception.
| name            | pos | adp   | 0.0-rank | 0.5-rank | 1.0-rank | diff | 
|-----------------|-----|-------|----------|----------|----------|------| 
| Dion Lewis      | RB  | 139.3 | 152      | 96       | 79       | -73  | 
| Jerick McKinnon | RB  | 108.8 | 90       | 78       | 69       | -21  | 
| Tarik Cohen     | RB  | 63.0  | 64       | 51       | 47       | -17  | 
| Austin Ekeler   | RB  | 126.0 | 83       | 68       | 67       | -16  | 
| James White     | RB  | 63.3  | 51       | 42       | 36       | -15  | 
| Michael Thomas  | WR  | 12.8  | 33       | 28       | 19       | -14  | 
| Tyler Lockett   | WR  | 53.5  | 49       | 53       | 60       | 11   | 
| Chris Carson    | RB  | 48.5  | 14       | 19       | 26       | 12   | 
| Will Fuller     | WR  | 84.5  | 87       | 90       | 99       | 12   | 
| O.J. Howard     | TE  | 55.8  | 52       | 60       | 64       | 12   | 
| Robby Anderson  | WR  | 82.0  | 74       | 81       | 86       | 12   | 
| Nick Chubb      | RB  | 20.0  | 15       | 22       | 28       | 13   | 
| Marvin Jones    | WR  | 99.0  | 69       | 79       | 82       | 13   | 
| Dante Pettis    | WR  | 91.3  | 81       | 86       | 95       | 14   | 
| Derrick Henry   | RB  | 32.5  | 11       | 13       | 25       | 14   | 
| Mike Williams   | WR  | 61.5  | 65       | 72       | 80       | 15   | 
| Eric Ebron      | TE  | 71.3  | 85       | 89       | 102      | 17   | 
| Sony Michel     | RB  | 40.0  | 10       | 17       | 27       | 17   | 
| David Njoku     | TE  | 91.3  | 94       | 101      | 116      | 22   | 
| Tyreek Hill     | WR  | 54.5  | 84       | 93       | 126      | 42   | 


## Methods

 Player stats were aggregated and averaged from CBS, ESPN, and NFL. Stats like estimated number of receptions, touchdowns, rushing yards, etc were stored form each site for each player. Season-end projections were calculated using ESPN's standard scoring (below) with 0.0, 0.5 and 1.0 points per reception. The value of each player was calculated as that players' expected points after the season versus their first replacement player. The replacement player for each position was one past than the typical number of players in that position drafted within 100 picks (via ADP data from FantasyPros). This is a more robust method that the number of starters per team + 1, since it better accounts for actual draft behavior (ex: kickers don't start showing up in round 5).

 Players reported here had an ADP <= 150 (FantasyPros) and a value based rank <= 100 (with non-PPR or PPR scoring). In other words, they will be picked in every draft.

```python
points = { # standard ESPN scoring
 "pass_yds": 0.04,
 "pass_tds": 4.0,
 "pass_ints": -2.0,
 "receptions": 0.0, # the stat that matters most here
 "reception_yds": 0.1,
 "reception_tds": 6.0,
 "rush_yds": 0.1,
 "rush_tds": 6.0,
 "fumbles": -2.0,
 "two_pts": 2.0,
 "kick_extra_points": 1.0,
 "kick_0_19": 3.0,
 "kick_20_29": 3.0,
 "kick_30_39": 3.0,
 "kick_40_49": 4.0,
 "kick_50": 5.0,
 "df_ints": 2.0,
 "df_tds": 6.0,
 "df_sacks": 1.0,
 "df_points_allowed_per_game": 0,
 "df_fumbles": 2.0,
 "df_safeties": 2.0,
}
```

## Future

Let me know if there's a particular stat or league setting whose effect you're interested in.

I started with PPR, because it has the most recognizable effect on player value, but it is covered ground. Already, sites like FantasyPros separate out their ECRankings into [non-PPR](https://www.fantasypros.com/nfl/rankings/consensus-cheatsheets.php) versus [PPR](https://www.fantasypros.com/nfl/rankings/ppr-cheatsheets.php) ranks.

In the short-term I want to expand this approach to look at the number of teams in the league, number of QBs, points per passing touchdown, etc. Again, my guess is that those changes have knock-on effects for draft strategy that don't present themselves in most rankings out there.

All the source code for this is available on [Github](https://github.com/JJTimmons/ff) (scrapers, Jupyter notebook, etc)

Also, please check out my draft assistant at [https://www.ffdraft.app/](https://www.ffdraft.app/). It has up-to-date aggregated projections with customizable league scoring and league size. (It's best on desktop).