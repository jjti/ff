# ffdraft.app

<img width="1440" alt="Screen Shot 2022-08-06 at 9 41 54 AM" src="https://user-images.githubusercontent.com/13923102/183251462-b66d5479-119a-4933-a96d-0198bb569edb.png">

------

An app that helps draft the best fantasy football team possible.

## Value over replacement

The app ranks players by their [value over replacement (VOR)](https://support.fantasypros.com/hc/en-us/articles/115005868747-What-is-value-based-drafting-What-do-player-draft-values-mean-VORP-VONA-VOLS-VBD-). It does this by calculating the "replacement value" for each position. The `VOR` of a player is difference between that player's projected point total and the point total of the `n+1`th ranked player where `n` in the number of players in that position expected to be drafted in the first 10 rounds.

Why is this useful? Because it tells you, the drafter, how to prioritize players across positions. You'll be more informed when choosing between the RB or QB in round 6.

### Example

If there are 10 teams, and we expect 8 QBs to be drafted in the first 100 picks, the `VOR` of the best QB is his expected point total minus the point total of the 9th best QB. In the example below, it's better to pick the RB because his expected value further exceeds the replacement player that will be available from waivers. The RB1 offers 62 points of greater value over the season (`136 - 74`).

```
QB1: projection = 394, vor = 74 (394 - 320)
QB9: projection = 320, vor = 0 (320 - 320)

RB1: projection = 253, vor = 136 (253 - 117)
RB30: projection = 117, vor = 0 (117 - 117)
```

### Details

Calculating VOR is tricky for a few reasons:
- it depends on the number of teams and roster format. Eg: if the league has 2 QBs per team, that improves QB's values
- it depends on league scoring. Eg: if rushing touchdowns are 4pts and recieving touchdowns 6pts, that improves WR's values
- it depends on other drafters. Eg: if the first 6 rounds are all RB picks, that improves the RB's values

The app adjusts for each of the complexities above. It calculates player's VOR dynamically based on:
- league size
- league scoring
- average draft position

### Sources

Player projections are updated daily from ESPN, CBS, and NFL. These projections are as granular as the number of rushing touchdowns and fumbles expected per season. That granularity - versus a static ranking - are needed to account for variations in value due to league-specific scoring.

Each player's season-end projection is the average from across ESPN, CBS, and NFL. I expect the average of all sources to be more accurate than any on their own ([Nate Silver style](https://www.theatlantic.com/magazine/archive/2020/03/can-you-still-trust-nate-silver/605521/)).

Average draft position are retrieved from [Fantasy Pros](https://www.fantasypros.com/nfl/adp/overall.php). This is used to pick the replacement player in each position, and account for scoring-based differences in draft position (eg adjust for WRs being drafted earlier in PPR leagues).

## Pick tips

Tags next to players indicate:
1. pick recommendations
2. whether the player will be drafted soon
3. BYE week overlap with other players on roster
4. RB handcuffs

## Controls

Clicking on a player drafts the player to the active team (currently drafting). You can skip the current turn (not drafting a player), undo the last round's pick (if they make a mistake), or remove a player (if the player was drafted already but they missed it).
