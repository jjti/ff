# Fantasy Football Draft App

[An app](https://www.ffdraft.app/) for drafting the best fantasy football team possible.

## Value over replacement

The app ranks players by their [value over replacement (VOR)](https://support.fantasypros.com/hc/en-us/articles/115005868747-What-is-value-based-drafting-What-do-player-draft-values-mean-VORP-VONA-VOLS-VBD-). The app does this by calculating the "replacement value" for each position. The `VOR` of a player is difference between that player's projected point total and the projected point total of the `n+1`th ranked player in a given postion where `n` in the number of players in that position expected to be drafted within the first 10 rounds of a draft.

![screen shot 2018-08-18 at 5 35 32 pm](https://user-images.githubusercontent.com/13923102/44303360-0b0b6a80-a30d-11e8-8901-179bfa8ac693.png)

So if there are 10 teams, and we expect 8 QBs to be drafted within the first 100 picks (based on Fantasy Pro's average draft data), the replacement value is the seasonal projection of the 9'th best QB.

Since the expected number of drafted players at each position depends on the number of teams, the app recalculates VOR if the number of teams changes. Similarly, the app accounts for differences in league-to-league scoring.

## Building out a Roster

The user can track their (or anyone else's) team during the draft. Since the starting roster is all that contributes to points-per-week, positions that are already filled are grayed out (QB in the example above).

![screen shot 2018-08-18 at 5 55 19 pm](https://user-images.githubusercontent.com/13923102/44303477-e9f84900-a30f-11e8-9119-286d37dc159b.png)

## Tips on picks

Small tags are also shown next to the player names indicating if they're likely to be drafted soon (given ADP) and whether there's a schedule conflict between the player and another key player (QB, RB, WR, or TE). There are also recommendations for which player to pick by a combination of using the player's VOR, ADP, and the user's existing roster.

<img width="1440" alt="screen shot 2018-09-04 at 6 36 28 pm" src="https://user-images.githubusercontent.com/13923102/45061205-7f663d80-b071-11e8-98c8-01ae83f0619d.png">

## Controls

Clicking on a player drafts the player to the active team (currently drafting). Users can also skip the current turn (not drafting a player), undo the last round's pick (if they make a mistake), or remove a player (if the player was drafted already but they missed it). They can also drag and drop player rows onto the row of prior picks, and swap picks up in the pick history row.

<img width="700" alt="screen shot 2018-09-04 at 6 40 08 pm" src="https://user-images.githubusercontent.com/13923102/45061311-f8fe2b80-b071-11e8-9b9a-19d246805a07.png">
