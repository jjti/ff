# Fantasy Football Draft App

An app for drafting the best fantasy football team possible.

## Value over replacement

The app ranks players by their [value over replacement (VOR)](https://support.fantasypros.com/hc/en-us/articles/115005868747-What-is-value-based-drafting-What-do-player-draft-values-mean-VORP-VONA-VOLS-VBD-). It calculates the "replacement value" for each position. The `VOR` of a player is difference between that player's projected point total and the projected point total of the `n+1`th ranked player where `n` in the number of players in that position expected to be drafted in the first 10 rounds.

![screen shot 2018-08-18 at 5 35 32 pm](https://user-images.githubusercontent.com/13923102/44303360-0b0b6a80-a30d-11e8-8901-179bfa8ac693.png)

So if there are 10 teams, and we expect 8 QBs to be drafted in the first 100 picks, the replacement value is the seasonal projection of the 9'th best QB.

Since the expected number of drafted players at each position depends on the number of teams, the app recalculates VOR if the number of teams changes. Similarly, the app accounts for differences in league-to-league scoring.

## Building out a Roster

You can track your team's status during the draft. Already filled positions are grayed out (QB in the example below).

![screen shot 2018-08-18 at 5 55 19 pm](https://user-images.githubusercontent.com/13923102/44303477-e9f84900-a30f-11e8-9119-286d37dc159b.png)

## Tips on picks

Tags next to players indicate:
1. pick recommendations
2. that the player will be drafted soon
3. schedule conflicts between other team members

<img width="1440" alt="screen shot 2018-09-04 at 6 36 28 pm" src="https://user-images.githubusercontent.com/13923102/45061205-7f663d80-b071-11e8-98c8-01ae83f0619d.png">

## Controls

Clicking on a player drafts the player to the active team (currently drafting). You can skip the current turn (not drafting a player), undo the last round's pick (if they make a mistake), or remove a player (if the player was drafted already but they missed it).

<img width="700" alt="screen shot 2018-09-04 at 6 40 08 pm" src="https://user-images.githubusercontent.com/13923102/45061311-f8fe2b80-b071-11e8-9b9a-19d246805a07.png">
