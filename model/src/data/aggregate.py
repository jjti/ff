"""Aggregate projection, madden, and results data into a single table

Things that make this hard are:

1. redundant names across years and within years
2. names with small variations in suffixes between data sources

- projected points from NBC,FOX,etc are in /data/raw/projections
- madden stats are in /data/raw/madden
- end of season stats and fantasy points are in /data/raw/pro_football_reference.csv
"""

import os

import pandas as pd

INTERIM = os.path.join("..", "..", "data", "interim")
PROCESSED = os.path.join("..", "..", "data", "processed")


def projections(out_dir=INTERIM):
    """Gather all the projection data."""

    p_files = []
    for d_name, _, f_names in os.walk(
        os.path.join("..", "..", "data", "raw", "projections")
    ):
        for f_name in f_names:
            p_files.append(os.path.join(d_name, f_name))

    # I made the 2018 files, which are, I now see, inferior...
    df_2018 = pd.DataFrame()
    for p_file in [p for p in p_files if "2018" in p]:
        # parse each player file to name, position, and pts
        p_df = pd.read_csv(p_file, index_col=0)
        p_df.name = p_df.name.apply(ffname)

        if df_2018.empty:
            df_2018 = p_df
        else:
            df_2018 = pd.merge(df_2018, p_df, how="outer")
    df_2018 = df_2018.drop("img_url", axis=1)
    df_2018.to_csv(os.path.join(out_dir, "2018_projections.csv"), index=False)

    # Load and parse the rest of the data from 2012-2014
    for year in [2012, 2013, 2014]:
        df = pd.DataFrame()
        for p_file in [p for p in p_files if str(year) in p]:
            # name and pts are stored with source in lowercase
            base = os.path.basename(p_file)
            src = base[: base.index("-")].lower()

            # parse each player file to name, position, and pts
            p_df = pd.read_csv(p_file)

            p_df["name"] = p_df["name_" + src].apply(ffname)
            p_df = p_df[["name", "pos", "pts_" + src]]

            if df.empty:
                df = p_df
            else:
                df = pd.merge(df, p_df, how="outer")
        df.to_csv(os.path.join(out_dir, f"{year}_projections.csv"), index=False)


def madden(out_dir=INTERIM):
    """Parse Madden stats to the interim directory.
    """

    p_files = []
    for d_name, _, f_names in os.walk(
        os.path.join("..", "..", "data", "raw", "madden")
    ):
        for f_name in f_names:
            p_files.append(os.path.join(d_name, f_name))

    for year in [2012, 2013, 2014, 2018]:
        df = pd.DataFrame()
        for p_file in [p for p in p_files if str(year) in p]:
            pfr = pd.read_csv(p_file)

            if year == 2013 or year == 2014:
                pfr["name"] = pfr["First Name"] + "_" + pfr["Last Name"]
            if year == 2018:
                pfr["name"] = pfr["Name"]
            if year == 2012:
                pfr["pos"] = pfr["position"]
                pfr["madden_ovr"] = pfr["overall"]
            else:
                pfr["pos"] = pfr["Position"]
                pfr["madden_ovr"] = pfr["Overall"]

            pfr["name"] = pfr["name"].apply(ffname)
            pfr["pos"] = pfr["pos"].apply(ffpos)
            pfr[["name", "pos", "madden_ovr"]].to_csv(
                os.path.join(out_dir, f"{year}_madden.csv"), index=False
            )


def results(out_dir=INTERIM):
    """Parse the football_reference_scrape data to end of season fantasy results.
    """

    pfr = pd.read_csv(
        os.path.join("..", "..", "data", "raw", "pro_football_reference.csv")
    )

    pfr["name"] = pfr.player.apply(ffname)
    pfr["pos"] = pfr["fantasy_pos"]
    pfr["pts"] = pfr.fantasy_points
    pfr["pts_ppr"] = pfr.fantasy_points_ppr

    pfr = pfr[["name", "pos", "pts", "pts_ppr", "year"]]

    for year in [2012, 2013, 2014, 2018]:
        pfr[pfr.year == year].to_csv(
            os.path.join(out_dir, f"{year}_results.csv"), index=False
        )


def final(out_dir=PROCESSED):
    """Aggregate the projections, madden and the fantasy points into a single table
    """

    full_df = pd.DataFrame()
    for year in [2012, 2013, 2014, 2018]:
        year_projections = pd.read_csv(os.path.join(INTERIM, f"{year}_projections.csv"))
        year_madden = pd.read_csv(os.path.join(INTERIM, f"{year}_madden.csv"))
        year_results = pd.read_csv(os.path.join(INTERIM, f"{year}_results.csv"))

        year_df = year_projections.merge(year_madden, how="outer").merge(
            year_results, how="outer"
        )

        if year == 2012:
            full_df = year_df
        else:
            full_df = full_df.merge(year_df, how="outer")

    # re-order
    full_df = full_df[
        [
            "name",
            "pos",
            "year",
            "madden_ovr",
            "pts_cbs",
            "pts_ppr_cbs",
            "pts_nfl",
            "pts_espn",
            "pts_fox",
            "pts_yahoo",
            "pts",
            "pts_ppr",
        ]
    ]

    full_df.to_csv(os.path.join(PROCESSED, "data.csv"), index=False)


def ffname(name):
    """Remove extraneous characters that may differ between sources.
    """

    return (
        name.lower()
        .replace(".", "")
        .replace("*", "")
        .replace("'", "")
        .replace("jr", "")
        .strip()
        .replace(" ", "_")
    )


def ffpos(pos):
    """Unify positions
    """

    return pos.upper().strip().replace("HB", "RB").replace("FB", "RB")


if __name__ == "__main__":
    projections()
    madden()
    results()
    final()
