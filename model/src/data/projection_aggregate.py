"""Combine aggregated projections into a JSON format usable via the client-side application
"""

import os

import pandas as pd

pd.set_option("display.max_columns", 500)

YEAR = 2019

PROJECTIONS = os.path.join("..", "..", "data", "raw", "projections")
ADP = os.path.join("..", "..", "data", "raw", "adp", f"FFC-{YEAR}.csv")

CBS = os.path.join(PROJECTIONS, f"CBS-Projections-{YEAR}.csv")
ESPN = os.path.join(PROJECTIONS, f"ESPN-Projections-{YEAR}.csv")
NFL = os.path.join(PROJECTIONS, f"NFL-Projections-{YEAR}.csv")

OUTPUT = os.path.join("..", "..", "data", "processed", f"projections-{YEAR}.csv")


HEADERS = ["key", "name", "pos", "team"]

STATS = [
    "pass_tds",
    "pass_yds",
    "pass_ints",
    "rush_tds",
    "rush_yds",
    "receptions",
    "reception_tds",
    "reception_yds",
    "two_pts",
    "fumbles",
    "kick_0_19",
    "kick_20_29",
    "kick_30_39",
    "kick_40_49",
    "kick_50",
    "kick_extra_points",
    "df_points_allowed_per_game",
    "df_sacks",
    "df_safeties",
    "df_fumbles",
    "df_tds",
    "df_ints",
]

COLS = HEADERS + STATS


def aggregate():
    """Read in CBS, ESPN, Fox projections and ADP and outputs a
    forecast.json for the application
    """

    src = ["cbs", "espn", "nfl"]

    df = pd.read_csv(ADP)
    df = df.set_index("key")
    for i, other in enumerate([CBS, ESPN, NFL]):
        other_df = pd.read_csv(other)
        other_df.columns = [
            h + "_" + src[i] if h != "key" else h for h in other_df.columns
        ]

        df = df.join(other_df.set_index("key"))
    df = df.sort_values("adp")

    for stat in STATS:
        stat_cols = [c for c in df.columns if stat in c]
        df[stat] = df[stat_cols].mean(axis=1)

    df.to_csv(OUTPUT)


if __name__ == "__main__":
    aggregate()
