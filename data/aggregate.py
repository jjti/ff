"""Combine aggregated projections into a JSON format usable via the client-side application
"""

import datetime
import logging
import os
import re

import pandas as pd
import numpy as np

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s:%(message)s")
pd.set_option("display.max_columns", 500)

YEAR = datetime.datetime.now().year
DIR = os.path.dirname(__file__)
PROJECTIONS = os.path.join(DIR, "raw", "projections")
ADP = os.path.join(DIR, "raw", "adp", f"FantasyPros-{YEAR}.csv")
CBS = os.path.join(PROJECTIONS, f"CBS-Projections-{YEAR}.csv")
ESPN = os.path.join(PROJECTIONS, f"ESPN-Projections-{YEAR}.csv")
NFL = os.path.join(PROJECTIONS, f"NFL-Projections-{YEAR}.csv")

AGGREGATE_BASE = os.path.join(DIR, "processed", f"Projections-{YEAR}")
AGGREGATE_CSV = AGGREGATE_BASE + ".csv"
AGGREGATE_JSON = AGGREGATE_BASE + ".json"

REG = r"(.*?)_([a-zA-Z0-9])"

HEADERS = ["key", "name", "pos", "team", "bye", "std", "half_ppr", "ppr"]

STATS = {
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
}

COLS = HEADERS + list(STATS)


def aggregate():
    """Read in CBS, ESPN, Fox projections and ADP and outputs a
    forecast.json for the application
    """

    logging.info("aggregating projections")

    src = ["cbs", "espn", "nfl"]

    df = pd.read_csv(ADP)
    df = df.set_index("key")
    for i, other in enumerate([CBS, ESPN, NFL]):
        other_src = "_" + src[i]
        other_df = pd.read_csv(other)
        other_df = other_df.set_index("key")
        other_df.columns = [h + other_src for h in other_df.columns]

        df = df.join(other_df, how="outer")
        df["pos"] = df.apply(
            lambda x: x["pos" + other_src] if x["pos"] is np.nan else x["pos"], axis=1
        )
        df["name"] = df.apply(
            lambda x: x["name" + other_src] if x["name"] is np.nan else x["name"],
            axis=1,
        )
        df["team"] = df.apply(
            lambda x: x["team" + other_src] if x["team"] is np.nan else x["team"],
            axis=1,
        )

    # the ADP numbers can be kind of strange -- jumping from 2 to 6 to 6.3. This just sorts them
    df = df.sort_values("std")
    df["std"] = list(range(1, len(df) + 1))
    df = df.sort_values("half_ppr")
    df["half_ppr"] = list(range(1, len(df) + 1))
    df = df.sort_values("ppr")
    df["ppr"] = list(range(1, len(df) + 1))

    for stat in STATS:
        stat_cols = [c for c in df.columns if stat in c]
        df[stat] = df[stat_cols].mean(axis=1)

    # keep only the means
    df = df.reset_index()  # add key back as a column
    df = df[COLS]
    df = df.round(1)

    # drop rows where all the stats fields are null
    df = df.dropna(axis=0, subset=STATS, how="all")

    df["std"] = df["std"].fillna(-1.0)
    df["half_ppr"] = df["half_ppr"].fillna(-1.0)
    df["ppr"] = df["ppr"].fillna(-1.0)

    df.to_csv(AGGREGATE_CSV, index=False)
    df.columns = [re.sub(REG, camel, c, 0) for c in df.columns]
    df.to_json(AGGREGATE_JSON, orient="table")

    logging.info("aggregated projections to: %s", AGGREGATE_JSON)


def camel(match):
    return match.group(1) + match.group(2).upper()
