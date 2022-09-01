# ffdraft.app

<img width="1440" alt="Screen Shot 2022-08-06 at 9 41 54 AM" src="https://user-images.githubusercontent.com/13923102/183251462-b66d5479-119a-4933-a96d-0198bb569edb.png">

An app for drafting the best fantasy football team possible: [www.ffdraft.app](https://www.ffdraft.app/)

## Value over replacement

The app ranks players by their [value over replacement (VOR)](https://support.fantasypros.com/hc/en-us/articles/115005868747-What-is-value-based-drafting-What-do-player-draft-values-mean-VORP-VONA-VOLS-VBD-). Players' `VOR` is difference between each player's expected season-end points minus the points of the `n+1`th ranked player (where `n` in the league-wide count of starters in that position).

Why is this useful? Because it tells you, the drafter, how to prioritize players across positions. You'll be informed when choosing between the RB or QB in round 6.

### Example

If there are 10 teams we expect the `VOR` of the best QB to be his expected season-end points minus the points of the 11th best QB. In the example below, it's better to pick the RB because his expected value far exceeds the replacement player who will be available from waivers. The RB1 offers 62 points of greater value over the season (`136 - 74`).

```
QB1: projection = 394, vor = 74 (394 - 320)
QB11: projection = 320, vor = 0 (320 - 320)

RB1: projection = 253, vor = 136 (253 - 117)
RB31: projection = 117, vor = 0 (117 - 117)
```

### Details

Calculating VOR is tricky because:
- it depends on the league size. Eg: if the league has 16 teams, RB values tend to increase a lot
- it depends on the league roster format. Eg: if the league has 2 QBs per team, that improves QB values
- it depends on league scoring. Eg: if rushing touchdowns are 4pts and recieving touchdowns 6pts, that improves WR's values
- it depends on other drafters. Eg: if the first 6 rounds are all RB picks, that improves the RB's values. The waiver RB for replacement will be worse

The app adjusts for each of the complexities above. It calculates player's VOR dynamically based on:
- league size
- league roster format
- league scoring
- average draft position

### Sources

Player projections are updated daily from ESPN, CBS, and NFL. These projections are as granular as the number of rushing touchdowns and fumbles expected per season. That granularity - versus a static ranking - is needed to adjust for league-specific scoring.

Each player's season-end projection is the average from across ESPN, CBS, and NFL. I expect the average of all sources to be more accurate than any on their own.

Average draft position are retrieved from [Fantasy Pros](https://www.fantasypros.com/nfl/adp/overall.php).

## Suggestions

Tags next to players indicate:
1. pick recommendations
2. whether the player will be drafted soon
3. BYE week overlap with other players on roster
4. RB handcuffs

While the suggestions are useful, it's usually enough to just draft the top player ranked by VOR.

## Controls

Clicking on a player drafts him to the active team (currently drafting). You can skip the current turn (not drafting a player), undo the last round's pick (if they make a mistake), or remove a player (if the player was drafted already but you missed it).
