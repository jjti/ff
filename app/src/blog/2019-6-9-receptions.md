# Players Most Affected by PPR and Value Based Drafting

I am interested in how league settings affect draft strategy. Things like the number of teams and league scoring. My guess is that one-size-fits-all rankings/tiers are misleading for any non-vanilla league.

This post is about PPR: probably the most discussed FF setting. [There was discussion on this sub](https://www.reddit.com/r/fantasyfootball/comments/cbdl66/draft_strategy_differences_between_standard5pprppr/) earlier this week. And just this year, PPR became the new normal on [NFL's platform](http://www.nfl.com/fantasyfootball/story/0ap3000001031468/article/rule-change-coming-to-nfl-fantasy-football), so it's especially worth considering if about to make the switch.

Below are more players who are particularly affected by PPR for the 2019 season. The players below had the 20 largest absolute differences in value based draft rank position between PPR and standard leagues. The `diff` column below is the change in the player's rank in a non-PPR versus a PPR league using a value based draft strategy (described at the bottom; `1.0-rank - 0.0-rank`). A negative number means the player should be drafted sooner in a PPR league as compared to a non-PPR league.

## Figures

- [The 20-most affected players](https://imgur.com/a/RfQthFk) (same data as below)
- [Values by rank by position (in standard and PPR leagues)](https://imgur.com/a/ubCytV3)

## Players

| name              | pos | adp-std | adp-ppr | 0.0-rank | 0.5-rank | 1.0-rank | diff | 
|-------------------|-----|---------|---------|----------|----------|----------|------| 
| Tarik Cohen       | RB  | 63.0    | 58.0    | 75       | 55       | 52       | -23  | 
| Zach Ertz         | TE  | 28.5    | 24.8    | 41       | 38       | 24       | -17  | 
| Michael Thomas    | WR  | 12.8    | 10.6    | 33       | 22       | 16       | -17  | 
| James White       | RB  | 63.3    | 56.0    | 55       | 47       | 40       | -15  | 
| Travis Kelce      | TE  | 15.8    | 15.0    | 21       | 20       | 7        | -14  | 
| Vance McDonald    | TE  | 90.5    | 96.8    | 98       | 99       | 85       | -13  | 
| Jarvis Landry     | WR  | 68.0    | 62.8    | 74       | 59       | 63       | -11  | 
| Will Fuller       | WR  | 84.3    | 83.0    | 82       | 82       | 94       | 12   | 
| Robby Anderson    | WR  | 82.3    | 77.2    | 70       | 72       | 83       | 13   | 
| Marlon Mack       | RB  | 32.5    | 35.2    | 25       | 32       | 38       | 13   | 
| Mike Williams     | WR  | 61.5    | 65.4    | 59       | 63       | 73       | 14   | 
| Tevin Coleman     | RB  | 69.5    | 73.4    | 63       | 69       | 79       | 16   | 
| Darrell Henderson | RB  | 83.3    | 81.6    | 86       | 83       | 102      | 16   | 
| Chris Carson      | RB  | 48.5    | 57.6    | 15       | 24       | 31       | 16   | 
| Derrick Henry     | RB  | 32.5    | 36.8    | 11       | 17       | 29       | 18   | 
| Nick Chubb        | RB  | 20.0    | 21.8    | 17       | 27       | 35       | 18   | 
| Jordan Howard     | RB  | 86.0    | 87.6    | 77       | 79       | 96       | 19   | 
| Tyreek Hill       | WR  | 54.0    | 48.6    | 60       | 67       | 80       | 20   | 
| Sony Michel       | RB  | 40.0    | 46.8    | 10       | 19       | 32       | 22   | 
| Rashaad Penny     | RB  | 81.0    | 81.6    | 90       | 92       | 146      | 56   | 

## Takeaways

If you're in a PPR league, do what you were probably going to do anyway: wait longer on rush-dependent RBs like Nick Chubb, Jordan Howard, and Sony Michel. Think about getting a pass-heavy TE sooner than you would in standard. And definitely let some other team get Rashaad Penny if you're in round 7.

Another news flash: avoid rankings or tiers that don't specify whether it's for a PPR league or not. But realize that generic rankings and tiers feed into ADP, since lots of drafters are looking at them. Look for players where their usage warrants an earlier pick than their ADP, like James White and Travis Kelce.

## Methods

 All the source code for this is available on [Github](https://github.com/JJTimmons/ff) (scrapers, Jupyter notebook, etc)
 
 Player stat projections from CBS, ESPN, and NFL were averaged. Stats like estimated number of receptions, touchdowns, rushing yards, etc were stored from each site for each player. Season-end projections were calculated using ESPN's standard scoring (below) with 0.0, 0.5 and 1.0 points per reception. The value of each player was calculated as that players' expected points after the season versus their first replacement player. The replacement player for each position was one past than the typical number of players in that position drafted within 100 picks (via ADP data from FantasyPros). This is [a more robust method](https://www.footballguys.com/05vbdrevisited.htm) than the number of starters per team + 1, since it better accounts for actual draft behavior (ex: kickers don't start showing up in round 5).

 Players reported here had an ADP <= 100 (with non-PPR or PPR scoring) or a value based rank <= 100 (with non-PPR or PPR scoring). In other words, they will be picked in every draft. Message me if you want to see more players, I chose top 20 to keep it focused.

```python
points = { # standard ESPN scoring
 "pass_yds": 0.04,
 "pass_tds": 4.0,
 "pass_ints": -2.0,
 "receptions": 0.0, # the stat that's varied
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

Let me know if there's a particular stat or league setting that you're interested in.

I started with PPR because it's so commonly discussed. But it is also covered ground. Already, sites like FantasyPros separate out their ECRankings into [non-PPR](https://www.fantasypros.com/nfl/rankings/consensus-cheatsheets.php) versus [PPR](https://www.fantasypros.com/nfl/rankings/ppr-cheatsheets.php) ranks.

In the short-term I want to expand this approach to look at the number of teams in the league, number of QBs, points per passing touchdown, etc. Again, my guess is that those changes have knock-on effects for draft strategy that don't present themselves in most existing rankings.

Also, please check out my draft assistant at [https://www.ffdraft.app/](https://www.ffdraft.app/). It has up-to-date (every 3hrs) aggregated projections with customizable league scoring and league size. You can change the value of receptions in `Settings > Score` to see how it affects value based rankings (ps: it's best on desktop).
