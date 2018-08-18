# ff

Fantasy football forecasting (2018). Experimenting with R

![full](https://user-images.githubusercontent.com/13923102/43682303-f861f7e2-983e-11e8-98f5-07ec2a89e998.png)

## App

A built an app for drafting the best team possible.

### Value over replacement

![screen shot 2018-08-18 at 5 35 32 pm](https://user-images.githubusercontent.com/13923102/44303360-0b0b6a80-a30d-11e8-8901-179bfa8ac693.png)

It ranks players by their [value over replacement (VOR)](https://support.fantasypros.com/hc/en-us/articles/115005868747-What-is-value-based-drafting-What-do-player-draft-values-mean-VORP-VONA-VOLS-VBD-) which is best way I'm aware of for comparing players at different positions. The app does this by calculating the "replacement value" for each position. The replacement value is 1+ the number that are expected to be drafted within the first 10 rounds of a draft.

So if there are 10 teams, and we expect 8 QBs to be drafted within the first 100 picks (based on ESPN's average draft position data), the replacement value is the predicted number of points of the 9's best QB.

Since the expected number of drafted players at each position is dependent on the number of teams, VOR is recalculated if the number of teams is changed.

#### Tracking teams' VOR

![screen shot 2018-08-18 at 5 58 15 pm](https://user-images.githubusercontent.com/13923102/44303512-5115fd80-a310-11e8-8005-811895620d92.png)

Teams are tracked during the draft, and a tally is kept of the VOR of team's starters. It's a real-time index for how well everyone is doing.

### Building out a Roster

![screen shot 2018-08-18 at 5 55 19 pm](https://user-images.githubusercontent.com/13923102/44303477-e9f84900-a30f-11e8-9119-286d37dc159b.png)

The user can track their (or anyone else's) team during the draft. Since the starting roster is all that contributes to points-per-week, positions that are already filled are grayed out (QB in the example above).

### Tips on picks

![screen shot 2018-08-18 at 6 00 19 pm](https://user-images.githubusercontent.com/13923102/44303524-9c301080-a310-11e8-9ead-829609af1142.png)

Small tags are also shown next to the player names indicating if they're likely to be drafted soon (given ADP) and whether there's a schedule conflict between the player and another key player (QB, RB, WR, or TE).

### Controls

![screen shot 2018-08-18 at 6 01 05 pm](https://user-images.githubusercontent.com/13923102/44303527-b4a02b00-a310-11e8-9b0d-edc25883a8c6.png)

Double clicking on a player drafts the player to the team of the active team. Users can also skip the current turn (not drafting a player), undo the last round's pick (if they make a mistake), and remove a player (if the player was drafted already but they missed it).
