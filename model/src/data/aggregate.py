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


def projections(out_dir="../../data/interim"):
    """Gather all the projection data."""

    p_files = []
    for d_name, _, f_names in os.walk("../../data/raw/projections"):
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
    df_2018.to_csv(os.path.join(out_dir, "2018_projections.csv"))

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
        df.to_csv(os.path.join(out_dir, f"{year}_projections.csv"))


def ffname(name):
    """Remove extraneous characters that may differ between sources.
    """

    return name.strip().replace(".", "").replace("*", "").replace(" ", "_").lower()


if __name__ == "__main__":
    projections()
