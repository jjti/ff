"""Projections scrapers."""

import datetime
import os
import re
import time
import traceback

import pandas as pd
import numpy as np
from bs4 import BeautifulSoup, NavigableString
from selenium import webdriver
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys

DIR = os.path.dirname(__file__)

# helpful resource for setting this up on headless Ubuntu: https://tecadmin.net/setup-selenium-chromedriver-on-ubuntu/
DRIVER_PATH = os.sep + os.path.join("usr", "local", "bin", "chromedriver")
DRIVER_OPTIONS = webdriver.ChromeOptions()
DRIVER_OPTIONS.add_argument("--headless")
DRIVER_OPTIONS.add_argument("--window-size=1200x900")
DRIVER_OPTIONS.add_argument("--no-sandbox")
DRIVER_OPTIONS.add_argument("--disable-dev-shm-usage")
DRIVER = webdriver.Chrome(options=DRIVER_OPTIONS, executable_path=DRIVER_PATH)

RAW_PROJECTIONS = os.path.join(DIR, "..", "..", "data", "raw", "projections")
RAW_ADP = os.path.join(DIR, "..", "..", "data", "raw", "adp")

YEAR = datetime.datetime.now().year

NAME_TEAM_MAP = {
    "Cardinals": "ARI",
    "Falcons": "ATL",
    "Ravens": "BAL",
    "Bills": "BUF",
    "Panthers": "CAR",
    "Bears": "CHI",
    "Bengals": "CIN",
    "Browns": "CLE",
    "Cowboys": "DAL",
    "Broncos": "DEN",
    "Lions": "DET",
    "Packers": "GB",
    "Texans": "HOU",
    "Colts": "IND",
    "Jaguars": "JAX",
    "Chiefs": "KC",
    "Las Vegas": "LV",
    "Raiders": "LV",
    "Dolphins": "MIA",
    "Vikings": "MIN",
    "Patriots": "NE",
    "Saints": "NO",
    "Giants": "NYG",
    "N.Y. Giants": "NYG",
    "Jets": "NYJ",
    "N.Y. Jets": "NYJ",
    "Eagles": "PHI",
    "Steelers": "PIT",
    "Chargers": "LAC",
    "L.A. Chargers": "LAC",
    "49ers": "SF",
    "Seahawks": "SEA",
    "Rams": "LAR",
    "L.A. Rams": "LAR",
    "Buccaneers": "TB",
    "Titans": "TEN",
    "Washington": "WSH",
    "Team": "WSH",
}
TEAM_NAME_MAP = {v: k for k, v in NAME_TEAM_MAP.items()}

REQUIRED_COLS = [
    "key",
    "name",
    "pos",
    "team",
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
"""Columns required from all projections to make season end score predictions
"""

COLUMN_MAP = {
    **{c: c for c in REQUIRED_COLS},
    **{  # ESPN
        "interceptions_thrown": "pass_ints",
        "passing_yards": "pass_yds",
        "td_pass": "pass_tds",
        "each_reception": "receptions",
        "td_reception": "reception_tds",
        "receiving_yards": "reception_yds",
        "rushing_yards": "rush_yds",
        "td_rush": "rush_tds",
        "field_goals_attempted_40-49_yards": "kick_40_49",
        "field_goals_attempted_50+_yards": "kick_50",
        "extra_points_made": "kick_extra_points",
        "each_fumble_recovered": "df_fumbles",
        "each_sack": "df_sacks",
        "each_interception": "df_ints",
        "total_return_td": "df_tds",
    },
    **{  # CBS
        "interceptions_thrown": "pass_ints",
        "passing_yards": "pass_yds",
        "touchdowns_passes": "pass_tds",
        "receiving_touchdowns": "reception_tds",
        "receiving_yards": "reception_yds",
        "rushing_touchdowns": "rush_tds",
        "rushing_yards": "rush_yds",
        "fumbles_lost": "fumbles",
        "extra_points_made": "kick_extra_points",
        "field_goals_1-19_yards": "kick_0_19",
        "field_goals_20-29_yards": "kick_20_29",
        "field_goals_30-39_yards": "kick_30_39",
        "field_goals_40-49_yards": "kick_40_49",
        "field_goals_50+_yards": "kick_50",
        "defensive_fumbles_recovered": "df_fumbles",
        "defensive_touchdowns": "df_tds",
        "points_allowed_per_game": "df_points_allowed_per_game",
        "sacks": "df_sacks",
        "safeties": "df_safeties",
        "interceptions": "df_ints",
    },
    **{  # NFL
        "passing_int": "pass_ints",
        "passing_td": "pass_tds",
        "passing_yds": "pass_yds",
        "receiving_rec": "receptions",
        "receiving_td": "reception_tds",
        "receiving_yds": "reception_yds",
        "rushing_td": "rush_tds",
        "rushing_yds": "rush_yds",
        "2pt": "two_pts",
        "lost": "fumbles",
        "made": "kick_extra_points",
        "0-19": "kick_0_19",
        "20-29": "kick_20_29",
        "30-39": "kick_30_39",
        "40-49": "kick_40_49",
        "50+": "kick_50",
        "sack": "df_sacks",
        "saf": "df_safeties",
        "fum_rec": "df_fumbles",
        "ret_td": "df_tds",
        "int": "df_ints",
    },
}
"""Map between column names as seen in sources and those needed in required columns above
"""


def scrape():
    """Scrape from all the sources and save to ./data/raw
    """

    print(datetime.datetime.now())

    try:
        scrape_espn()
        scrape_cbs()
        scrape_nfl()
        scrape_fantasy_pros()
        DRIVER.quit()
    except:
        DRIVER.quit()
        traceback.print_exc()
        raise


def scrape_espn(
    url="http://fantasy.espn.com/football/players/projections", out=RAW_PROJECTIONS
):
    """Scrape ESPN projections.

    Tricky because it's a React app without routing. Have to load the app and
    click through the buttons. Was reason for using Selenium
    """

    print("scraping ESPN")

    # set this to the p
    DRIVER.get(url)
    time.sleep(4)  # wait for JS app to render

    players = []
    current_button = 1
    while True:
        scroll()

        soup = BeautifulSoup(
            DRIVER.execute_script("return document.body.innerHTML"), "html.parser"
        )

        for player in soup.select("div.full-projection-table"):

            name = player.select(".pointer")[0].get_text()
            assert name
            pos = ""
            team = ""
            if player.select(".position-eligibility"):  # D/ST don't have these
                pos = player.select(".position-eligibility")[0].get_text()  # ex RB
                team = player.select(".player-teamname")[0].get_text()  # ex Bears

            table = player.select(".player-stat-table")[0]
            projection_row = table.find("tbody").find_all("tr")[1]
            headers = [
                e.find("div").get("title") for e in projection_row.find_all("td")
            ][1:]
            headers = [column(h) for h in headers]
            data = [e.get_text().lower() for e in projection_row][1:]

            p_data = {}
            p_data["name"] = name.strip()
            p_data["pos"] = pos.strip()
            team = team.strip()

            if team == "FA":
                team = "Washington"
            p_data["team"] = NAME_TEAM_MAP[team] if team else ""

            if "D/ST" in name:
                p_data["name"] = p_data["name"].replace(" D/ST", "").strip()
                if p_data["name"] == "FA":
                    p_data["name"] = "Washington"
                p_data["team"] = NAME_TEAM_MAP[p_data["name"]]
                p_data["pos"] = "DST"

            for h, d in zip(headers, data):
                if h in p_data:
                    continue  # oddly there are duplicate columns
                if "/" in d:
                    if "&" in h:
                        h1, h2 = h.split("&")
                    else:
                        h1, h2 = h.split("/")
                    d1, d2 = d.split("/")

                    if d1 != "--":
                        p_data[column(h1)] = float(d1)
                    if d2 != "--":
                        p_data[column(h2)] = float(d2)
                elif "-" in d:
                    p_data[h] = np.NaN
                else:
                    p_data[h] = float(d)

            players.append(p_data)
        try:
            next_button = DRIVER.find_element_by_link_text(str(current_button + 1))
            actions = ActionChains(DRIVER)
            actions.move_to_element(next_button).perform()
        except Exception as err:
            break

        try:
            current_button += 1
            next_button.send_keys(Keys.ENTER)
            time.sleep(1.5)
        except Exception as err:
            print(err)
            break

    df = pd.DataFrame(players)

    df["fumbles"] = np.nan
    df["two_pts"] = np.nan
    df["kick_0_19"] = np.nan
    df["kick_20_29"] = np.nan
    df["kick_30_39"] = np.nan
    df["df_points_allowed_per_game"] = df["points_allowed"].astype(float) / 16.0
    df["df_safeties"] = np.nan

    df = unify_columns(df)

    df.to_csv(os.path.join(out, f"ESPN-Projections-{YEAR}.csv"), index=False)

    validate(df)


def scrape_cbs(
    url="https://www.cbssports.com/fantasy/football/stats", out=RAW_PROJECTIONS
):
    """Scrape CBS projections.
    
    Unlike ESPN, there are routes for each position and PPR versus non-PPR.

    Example URL:
    https://www.cbssports.com/fantasy/football/stats/WR/2019/season/projections/nonppr/
    """

    print("scraping CBS")

    players = []
    for pos in ["QB", "RB", "WR", "TE", "DST", "K"]:
        page_url = f"{url}/{pos}/{YEAR}/season/projections/ppr/"

        DRIVER.get(page_url)
        time.sleep(2)
        scroll()
        time.sleep(2)

        soup = BeautifulSoup(
            DRIVER.execute_script("return document.body.innerHTML"), "html.parser"
        )
        time.sleep(0.5)

        table_header = soup.find("thead")
        table_header = table_header.find_all("tr")[1]

        headers = [h.find("div").get_text() for h in table_header.find_all("th")[1:]]
        headers = [column(h) for h in headers]
        headers = ["name", "pos", "team"] + headers

        table = soup.select(".TableBase-table")[0]
        table_body = table.find("tbody")
        for row in table_body.find_all("tr"):  # for each player
            if isinstance(row, NavigableString):
                continue
            if not row.find_all("td"):
                continue

            if pos != "DST":
                name_cell = row.select(".CellPlayerName--long")[0]

                if name_cell.find("a"):
                    name = name_cell.find("a").get_text()
                    pos = (
                        name_cell.select(".CellPlayerName-position")[0]
                        .get_text()
                        .strip()
                    )
                    team = (
                        name_cell.select(".CellPlayerName-team")[0].get_text().strip()
                    )
                else:
                    continue  # very rare, seen for Alfred Morris in 2019

                pos = pos.replace("FB", "RB")
                if team == "WAS":
                    team = "WSH"
                if team == "JAC":
                    team = "JAX"
                data = [name, pos, team]
            else:
                team = (
                    row.select(".TeamLogoNameLockup")[0]
                    .find("a")
                    .get("href")
                    .split("/")[3]
                )
                if team == "WAS":
                    team = "WSH"
                if team == "JAC":
                    team = "JAX"
                name = TEAM_NAME_MAP[team]
                data = [name, "DST", team]

            data += [
                td.get_text().strip().replace("—", "") for td in row.find_all("td")[1:]
            ]

            player_data = {}
            for k, v in zip(headers, data):
                player_data[k] = v
                if k == "fantasy_points":
                    k = "fpts"
                player_data[k] = v
            players.append(player_data)

    df = pd.DataFrame(players)
    df["two_pts"] = np.nan
    df = unify_columns(df)
    df.to_csv(os.path.join(out, f"CBS-Projections-{YEAR}.csv"), index=False)

    validate(df)


def scrape_nfl(out=RAW_PROJECTIONS):
    """Scrape NFL projections.
    
    Static routes, but the URLs are massive w/ query parameters. Example:
    https://fantasy.nfl.com/research/projections?position=0&statCategory=projectedStats&statSeason=2019&statType=seasonProjectedStats#researchProjections=researchProjections%2C%2Fresearch%2Fprojections%253Foffset%253D1%2526position%253DO%2526sort%253DprojectedPts%2526statCategory%253DprojectedStats%2526statSeason%253D2019%2526statType%253DseasonProjectedStats%2526statWeek%253D1%2Creplace
    
    First page:
    https://fantasy.nfl.com/research/projections?offset=1&position=O&sort=projectedPts&statCategory=projectedStats&statSeason=2019&statType=seasonProjectedStats&statWeek=1

    Second page:
    https://fantasy.nfl.com/research/projections?offset=1&position=O&sort=projectedPts&statCategory=projectedStats&statSeason=2019&statType=seasonProjectedStats&statWeek=1#researchProjections=researchProjections%2C%2Fresearch%2Fprojections%253Foffset%253D6%2526position%253DO%2526sort%253DprojectedPts%2526statCategory%253DprojectedStats%2526statSeason%253D2019%2526statType%253DseasonProjectedStats%2526statWeek%253D1%2Creplace
    
    Last page:
    https://fantasy.nfl.com/research/projections?offset=1&position=O&sort=projectedPts&statCategory=projectedStats&statSeason=2019&statType=seasonProjectedStats&statWeek=1#researchProjections=researchProjections%2C%2Fresearch%2Fprojections%253Foffset%253D926%2526position%253DO%2526sort%253DprojectedPts%2526statCategory%253DprojectedStats%2526statSeason%253D2019%2526statType%253DseasonProjectedStats%2526statWeek%253D1%2Creplace

    Just going to simluate clicking the next button until there's no next button
    """

    print("scraping NFL")

    # list of page urls and expected headers on that page
    pages = [
        (  # QB/WR/RB/TE
            f"https://fantasy.nfl.com/research/projections?offset=1&position=O&sort=projectedPts&statCategory=projectedStats&statSeason={YEAR}&statType=seasonProjectedStats&statWeek=1",
            [
                "Passing_Yds",
                "Passing_TD",
                "Passing_Int",
                "Rushing_Yds",
                "Rushing_TD",
                "Receiving_Rec",
                "Receiving_Yds",
                "Receiving_TD",
                "Ret_TD",
                "FumTD",
                "2PT",
                "Lost",
                "Points",
            ],
        ),
        (  # K
            f"https://fantasy.nfl.com/research/projections?offset=1&position=O&sort=projectedPts&statCategory=projectedStats&statSeason={YEAR}&statType=seasonProjectedStats&statWeek=1#researchProjections=researchProjections%2C%2Fresearch%2Fprojections%253Fposition%253D7%2526statCategory%253DprojectedStats%2526statSeason%253D{YEAR}%2526statType%253DseasonProjectedStats%2526statWeek%253D1%2Creplace",
            ["Made", "0-19", "20-29", "30-39", "40-49", "50+", "Points"],
        ),
        (  # DST
            f"https://fantasy.nfl.com/research/projections?offset=1&position=O&sort=projectedPts&statCategory=projectedStats&statSeason={YEAR}&statType=seasonProjectedStats&statWeek=1#researchProjections=researchProjections%2C%2Fresearch%2Fprojections%253Fposition%253D8%2526statCategory%253DprojectedStats%2526statSeason%253D{YEAR}%2526statType%253DseasonProjectedStats%2526statWeek%253D1%2Creplace",
            [
                "Sack",
                "Int",
                "Fum_Rec",
                "Saf",
                "TD",
                "Def_2pt_Ret",
                "Ret_TD",
                "Pts Allow",
                "Points",
            ],
        ),
    ]

    players = []
    for page_index, (page_url, headers) in enumerate(pages):
        DRIVER.get(page_url)
        time.sleep(1)
        scroll()
        time.sleep(1)

        headers = [column(h) for h in headers]
        headers = ["name", "pos", "team"] + headers

        while True:
            soup = BeautifulSoup(
                DRIVER.execute_script("return document.body.innerHTML"), "html.parser"
            )
            table = soup.find("tbody")

            for row in table.find_all("tr"):  # for each player
                if isinstance(row, NavigableString):
                    continue
                if not len(row.find_all("td")):
                    continue

                # get name, position and team
                name_cell = row.find_all("td")[0]
                name = name_cell.select(".playerNameFull")[0].get_text()
                pos_team = name_cell.find("em").get_text()
                pos_team = [v.strip() for v in pos_team.split("-")]
                if page_index == 2:  # is DST
                    name = name.split(" ")[-1]
                    team = NAME_TEAM_MAP[name]
                    data = [name, "DST", team]
                elif len(pos_team) == 1:
                    continue  # player not on a team
                else:
                    team = pos_team[1]
                    if team == "LA":
                        team = "LAR"
                    if team == "WAS":
                        team = "WSH"
                    if team == "JAC":
                        team = "JAX"
                    data = [name, pos_team[0], team]

                data += [
                    td.get_text().strip() if "-" not in td.get_text() else np.nan
                    for td in row.find_all("td")[3:]
                ]

                player_data = {}
                for k, v in zip(headers, data):
                    player_data[k] = v
                players.append(player_data)

            # find and click the next button
            try:
                next_button = DRIVER.find_element_by_link_text(">")
                actions = ActionChains(DRIVER)
                actions.move_to_element(next_button).click().perform()

                time.sleep(1)
                scroll()
                time.sleep(1)
            except:
                break

    df = pd.DataFrame(players)
    df["two_pts"] = df["2pt"]
    df["df_points_allowed_per_game"] = df["pts_allow"].astype(float) / 16.0
    df = unify_columns(df)
    df.to_csv(os.path.join(out, f"NFL-Projections-{YEAR}.csv"), index=False)

    validate(df)


def scrape_fantasy_pros(out=RAW_ADP):
    """Scrape the Fantasy Pros website for ADP information

    standard:
    https://www.fantasypros.com/nfl/adp/overall.php

    half_ppr:
    https://www.fantasypros.com/nfl/adp/half-point-ppr-overall.php

    ppr:
    https://www.fantasypros.com/nfl/adp/ppr-overall.php
    """

    print("scraping Fantasy Pros")

    urls = {
        "std": "https://www.fantasypros.com/nfl/adp/overall.php",
        "half_ppr": "https://www.fantasypros.com/nfl/adp/half-point-ppr-overall.php",
        "ppr": "https://www.fantasypros.com/nfl/adp/ppr-overall.php",
    }

    df = None
    df_set = False

    for ppr_type, url in urls.items():
        DRIVER.get(url)
        time.sleep(1.5)
        scroll()
        time.sleep(1.5)

        soup = BeautifulSoup(
            DRIVER.execute_script("return document.body.innerHTML"), "html.parser"
        )
        table = soup.select(".player-table")[0]
        table_body = table.find("tbody")

        players = []
        for tr in table_body.find_all("tr"):
            tds = tr.find_all("td")

            name_team_bye = tds[1]
            if len(name_team_bye.find_all("small")) < 1:
                continue

            name = name_team_bye.find_all("a")[0].get_text()
            team = name_team_bye.find_all("small")[0].get_text()
            if team == "WAS":
                team = "WSH"
            if team == "JAC":
                team = "JAX"
            bye = name_team_bye.find_all("small")[-1].get_text()
            bye = bye[1:-1]  # remove paranthesis

            pos = tds[2].get_text()
            for n in range(10):
                pos = pos.replace(str(n), "")

            if pos == "DST":
                name = name.split(" ")[-2]
                team = NAME_TEAM_MAP[name]

            adp = tds[-1].get_text()

            player_data = {
                "name": name,
                "team": team,
                "bye": bye,
                "pos": pos,
                ppr_type: float(adp.replace(",", "")) if isinstance(adp, str) else adp,
            }
            players.append(player_data)

        player_d = pd.DataFrame(players)
        player_d = add_key(player_d)

        if not df_set:
            df = player_d
            df_set = True
        else:
            df = pd.merge(df, player_d, on="key", how="outer")

    df = df[["key", "name", "pos", "team", "bye"] + list(urls.keys())]
    df.to_csv(os.path.join(out, f"FantasyPros-{YEAR}.csv"), index=False)

    validate(df, strict=False)


def column(text):
    """Parse column to common format.
    """

    text = text.strip().replace(" ", "_").lower().split("\n")[0].strip()

    if text[0] == "_":
        text = text[1:]
    if text[-1] == "_":
        text = text[:-1]

    return text


def unify_columns(df):
    """Re-organize stat columns."""

    for c in [c for c in df.columns if c in COLUMN_MAP]:
        df[COLUMN_MAP[c]] = df[c]
    df = add_key(df)  # add a unique id

    # sort and subselect columns so common ones are first
    return df[REQUIRED_COLS]


def add_key(df):
    """Add a unique key for each player/DST."""

    name_regex = re.compile("[^a-z ]+")

    def name(n):  # get last name
        n = n.lower().replace("sr", "").replace("st.", "").strip()
        n = name_regex.sub("", n).strip().replace("  ", " ").split(" ")
        return n[1] if len(n) > 1 else n[0]

    df["key"] = df.apply(
        lambda x: name(x["name"]) + "_" + x["pos"] + "_" + x["team"], axis=1
    )

    df = df.drop_duplicates("key")

    return df


def validate(df, strict=True):
    """Throw an exception if we're missing players at a certain position. These numbers are logical estimates."""

    pos_counts = {"QB": 32, "RB": 64, "WR": 64, "TE": 28, "DST": 32, "K": 30}

    for pos, count in pos_counts.items():
        actual_count = len(df[df.pos == pos])
        if strict and actual_count < count:
            print(df[df.pos == pos])
            raise RuntimeWarning(f"only {actual_count} {pos}'s")
        elif not strict and actual_count * 3 < count:
            print(df[df.pos == pos])
            raise RuntimeWarning(f"only {actual_count} {pos}'s")

    if len(set(df.team)) > 33:
        raise RuntimeError(f"too many teams: {set(df.team)}")


def scroll():
    DRIVER.execute_script("window.scrollTo(0, document.body.scrollHeight);")


if __name__ == "__main__":
    scrape()
