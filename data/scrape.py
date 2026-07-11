"""Projections scrapers."""

import datetime
import logging
import os
import re
import time

import pandas as pd
import numpy as np
import requests
from bs4 import BeautifulSoup, NavigableString
from selenium import webdriver
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

DIR = os.path.dirname(__file__)

# helpful resource for setting this up on headless Ubuntu: https://tecadmin.net/setup-selenium-chromedriver-on-ubuntu/
# more settings from https://stackoverflow.com/a/52340526
DRIVER_OPTIONS = webdriver.ChromeOptions()
DRIVER_OPTIONS.add_argument(
    "start-maximized"
)  # https://stackoverflow.com/a/26283818/1689770
DRIVER_OPTIONS.add_argument(
    "enable-automation"
)  # https://stackoverflow.com/a/43840128/1689770
DRIVER_OPTIONS.add_argument("--window-size=1200x900")
DRIVER_OPTIONS.add_argument("--disable-dev-shm-usage")
DRIVER_OPTIONS.add_argument(
    "--disable-features=PreloadMediaEngagementData,MediaEngagementBypassAutoplayPolicies"
)
DRIVER_OPTIONS.add_argument("--headless")  # only if you are ACTUALLY running headless
DRIVER_OPTIONS.add_argument(
    "--no-sandbox"
)  # https://stackoverflow.com/a/50725918/1689770
DRIVER_OPTIONS.add_argument(
    "--disable-dev-shm-usage"
)  # https://stackoverflow.com/a/50725918/1689770
DRIVER_OPTIONS.add_argument(
    "--disable-browser-side-navigation"
)  # https://stackoverflow.com/a/49123152/1689770
DRIVER_OPTIONS.add_argument(
    "--disable-gpu"
)  # https://stackoverflow.com/questions/51959986/how-to-solve-selenium-chromedriver-timed-out-receiving-message-from-renderer-exc
DRIVER = webdriver.Chrome(
    options=DRIVER_OPTIONS,
    service=Service(ChromeDriverManager().install()),
)

RAW_PROJECTIONS = os.path.join(DIR, "raw", "projections")
RAW_ADP = os.path.join(DIR, "raw", "adp")

YEAR = datetime.datetime.now().year

# Minimum number of ADP rows we expect from a scoring-format page. If we get fewer,
# the source has changed/broken and we should bail rather than write a stub file.
MIN_ADP_ROWS = 30

# The FFC ADP API rejects requests without a browser-like User-Agent (403).
ADP_USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"
)

TEAM_TO_ABRV_MAP = {
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
    "Commanders": "WSH",
    "Team": "WSH",
}
ABRV_TO_TEAM_MAP = {v: k for k, v in TEAM_TO_ABRV_MAP.items()}

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

    Each source is scraped independently: the sites change their markup often and
    break one scraper at a time, so a single failing source should not throw away
    the data we successfully collected from the others. We only raise if *every*
    source failed (i.e. the run produced nothing).
    """

    sources = [scrape_espn, scrape_cbs, scrape_nfl, scrape_adp]
    failures = []

    try:
        for source in sources:
            try:
                source()
            except Exception:
                failures.append(source.__name__)
                logging.exception("Failed to scrape %s -- continuing", source.__name__)
    finally:
        DRIVER.quit()

    if len(failures) == len(sources):
        raise RuntimeError(f"all scrapers failed: {failures}")
    if failures:
        logging.warning("finished scrape with failed sources: %s", failures)


def scrape_espn():
    """Scrape ESPN projections.

    Tricky because it's a React app without routing. Have to load the app and
    click through the buttons. Was reason for using Selenium
    """

    url = "http://fantasy.espn.com/football/players/projections"
    out = RAW_PROJECTIONS

    logging.info("Scraping ESPN")
    DRIVER.get(url)
    time.sleep(5)  # wait for JS app to render

    players = []
    page = 1
    free_agents = 0
    while True:
        time.sleep(1)
        scroll()
        time.sleep(1)

        soup = BeautifulSoup(
            DRIVER.execute_script("return document.body.innerHTML"), "html.parser"
        )

        # parse each player row's meta
        for player in soup.select("div.full-projection-table"):
            name = player.select(".player-name")[0].get_text()
            assert name

            pos = ""
            team = ""
            if player.select(".position-eligibility"):  # D/ST don't have these
                pos = player.select(".position-eligibility")[0].get_text()  # eg RB
                team = player.select(".player-teamname")[0].get_text()  # eg Bears

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

            if "D/ST" in name:
                p_data["name"] = p_data["name"].replace(" D/ST", "").strip()
                p_data["team"] = TEAM_TO_ABRV_MAP[p_data["name"]]
                p_data["pos"] = "DST"
            elif team in TEAM_TO_ABRV_MAP:
                p_data["team"] = TEAM_TO_ABRV_MAP[team]
            elif team == "FA":
                free_agents += 1
                continue
            else:
                logging.error("unrecognized player row: %s", player)

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
                    p_data[h] = np.nan
                else:
                    p_data[h] = float(d)

            players.append(p_data)

        # find the button to click to the next page
        try:
            next_button = DRIVER.find_element(by=By.ID, value=str(page + 1))
            actions = ActionChains(DRIVER)
            actions.move_to_element(next_button).perform()
        except Exception as err:
            if page == 1:
                logging.exception("error moving to element: %s", err)
            break

        # click the next page's button
        try:
            if page % 5 == 0:
                logging.info("Scraping ESPN: page=%d, players=%d", page, len(players))
            page += 1
            next_button.send_keys(Keys.ENTER)
        except Exception as err:
            if page == 2:
                logging.exception("error clicking button: %s", err)
            break

    df = pd.DataFrame(players)
    if free_agents:
        logging.info("Skipped %d free-agents", free_agents)

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


def scrape_cbs():
    """Scrape CBS projections.

    Unlike ESPN, there are routes for each position and PPR versus non-PPR.

    Example URL:
    https://www.cbssports.com/fantasy/football/stats/WR/2019/season/projections/nonppr/
    """

    url = "https://www.cbssports.com/fantasy/football/stats"
    out = RAW_PROJECTIONS
    logging.info("Scraping CBS")

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
                    # very rare, seen for Alfred Morris in 2019
                    logging.warning("Skipping player, no position: %s", name_cell)
                    continue

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
                name = ABRV_TO_TEAM_MAP[team]
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


def scrape_nfl():
    """Scrape NFL projections.

    Static routes, but the URLs are massive w/ query parameters. Example:
    https://fantasy.nfl.com/research/projections?position=0&statCategory=projectedStats&statSeason=2019&statType=seasonProjectedStats#researchProjections=researchProjections%2C%2Fresearch%2Fprojections%253Foffset%253D1%2526position%253DO%2526sort%253DprojectedPts%2526statCategory%253DprojectedStats%2526statSeason%253D2019%2526statType%253DseasonProjectedStats%2526statWeek%253D1%2Creplace

    First page:
    https://fantasy.nfl.com/research/projections?offset=1&position=O&sort=projectedPts&statCategory=projectedStats&statSeason=2019&statType=seasonProjectedStats&statWeek=1

    Second page:
    https://fantasy.nfl.com/research/projections?offset=1&position=O&sort=projectedPts&statCategory=projectedStats&statSeason=2019&statType=seasonProjectedStats&statWeek=1#researchProjections=researchProjections%2C%2Fresearch%2Fprojections%253Foffset%253D6%2526position%253DO%2526sort%253DprojectedPts%2526statCategory%253DprojectedStats%2526statSeason%253D2019%2526statType%253DseasonProjectedStats%2526statWeek%253D1%2Creplace

    Last page:
    https://fantasy.nfl.com/research/projections?offset=1&position=O&sort=projectedPts&statCategory=projectedStats&statSeason=2019&statType=seasonProjectedStats&statWeek=1#researchProjections=researchProjections%2C%2Fresearch%2Fprojections%253Foffset%253D926%2526position%253DO%2526sort%253DprojectedPts%2526statCategory%253DprojectedStats%2526statSeason%253D2019%2526statType%253DseasonProjectedStats%2526statWeek%253D1%2Creplace

    Just going to simulate clicking the next button until there's no next button
    """

    out = RAW_PROJECTIONS
    logging.info("Scraping NFL")

    # list of page urls and expected headers on that page
    pages = [
        (  # QB/WR/RB/TE
            f"https://fantasy.nfl.com/research/projections?position=O&sort=projectedPts&statCategory=projectedStats&statSeason={YEAR}&statType=seasonProjectedStats",
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
            f"https://fantasy.nfl.com/research/projections?position=7&statCategory=projectedStats&statSeason={YEAR}&statType=seasonProjectedStats",
            ["Made", "0-19", "20-29", "30-39", "40-49", "50+", "Points"],
        ),
        (  # DST
            f"https://fantasy.nfl.com/research/projections?position=8&statCategory=projectedStats&statSeason={YEAR}&statType=seasonProjectedStats",
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
    page = 0
    free_agents = 0
    for page_index, (page_url, headers) in enumerate(pages):
        headers = [column(h) for h in headers]
        headers = ["name", "pos", "team"] + headers

        # NFL.com paginates 25 players per page via an `offset` query param
        # (offset=1, 26, 51, ...). The site no longer advances on a "next"
        # button click, so navigate the offset URLs directly instead.
        offset = 1
        last_first_name = None
        for _ in range(60):  # safety cap on pages per position group
            DRIVER.get(page_url + f"&offset={offset}")
            time.sleep(0.75)
            scroll()
            time.sleep(0.75)

            try:
                soup = BeautifulSoup(
                    DRIVER.execute_script("return document.body.innerHTML"), "html.parser"
                )
            except Exception as e:
                logging.warning("bailing on nfl pagination on error", exc_info=e)
                break
            table = soup.find("tbody")
            if table is None:
                break

            rows = [
                row
                for row in table.find_all("tr")
                if not isinstance(row, NavigableString) and row.find_all("td")
            ]
            if not rows:
                break  # past the last page

            # the offset URL stopped advancing (would re-scrape the same page)
            first_name = rows[0].find_all("td")[0].select(".playerNameFull")[0].get_text()
            if first_name == last_first_name:
                break
            last_first_name = first_name

            # parse each player in the table
            for row in rows:
                # get name, position and team
                name_cell = row.find_all("td")[0]
                name = name_cell.select(".playerNameFull")[0].get_text()
                pos_team = name_cell.find("em").get_text()
                pos_team = [v.strip() for v in pos_team.split("-")]
                if page_index == 2:  # is DST
                    name = name.split(" ")[-1]
                    team = TEAM_TO_ABRV_MAP[name]
                    data = [name, "DST", team]
                elif len(pos_team) == 1:  # player not on a team
                    free_agents += 1
                    continue
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

            page += 1
            if page % 5 == 0:
                logging.info(
                    "Scraping NFL: page=%d, players=%d, first_on_page=%s",
                    page,
                    len(players),
                    first_name,
                )

            offset += len(rows)

    logging.info("Skipped %d free-agents", free_agents)

    df = pd.DataFrame(players)
    df["two_pts"] = df["2pt"]
    df["df_points_allowed_per_game"] = df["pts_allow"].astype(float) / 16.0
    df = unify_columns(df)
    df.to_csv(os.path.join(out, f"NFL-Projections-{YEAR}.csv"), index=False)

    # validate(df)


def scrape_adp():
    """Scrape ADP from Fantasy Football Calculator's public JSON API.

    We used to scrape the FantasyPros ADP pages, but they moved the full report
    behind a free login (logged out you only get the top ~5 players). FFC exposes
    the same data as an open JSON API keyed by scoring format -- no auth, no
    Selenium, no brittle HTML parsing:

    https://fantasyfootballcalculator.com/api/v1/adp/{format}?teams=12&year=YYYY
    """

    out = RAW_ADP
    logging.info("Scraping ADP from Fantasy Football Calculator")

    # FFC scoring format -> our column name.
    formats = {"std": "standard", "half_ppr": "half-ppr", "ppr": "ppr"}

    # FFC names DSTs "Seattle Defense"; the projection sources key them by team
    # nickname (e.g. "seahawks_DST_SEA"), so map abbreviation -> nickname. Prefer
    # the single-word nickname ("Raiders" over "Las Vegas", "Commanders" over "Team").
    abrv_to_nickname = {}
    for nickname, abrv in TEAM_TO_ABRV_MAP.items():
        if " " in nickname or "." in nickname or nickname == "Team":
            continue
        abrv_to_nickname.setdefault(abrv, nickname)

    # FFC position codes -> ours.
    pos_map = {"DEF": "DST", "PK": "K"}

    # Accumulate one record per player across the three scoring formats, keyed the
    # same way the projection sources are so the aggregate join lines up.
    records = {}
    for ppr_type, fmt in formats.items():
        url = (
            f"https://fantasyfootballcalculator.com/api/v1/adp/{fmt}"
            f"?teams=12&year={YEAR}"
        )
        logging.info("Scraping ADP: ppr_type=%s, url=%s", ppr_type, url)
        # A User-Agent is required -- the API returns 403 for the default one.
        resp = requests.get(url, headers={"User-Agent": ADP_USER_AGENT}, timeout=30)
        resp.raise_for_status()
        players = resp.json().get("players", [])

        if len(players) < MIN_ADP_ROWS:
            raise RuntimeError(
                f"ADP for {ppr_type} returned only {len(players)} rows "
                f"(expected >= {MIN_ADP_ROWS})"
            )

        for p in players:
            team = p["team"]
            if team == "WAS":
                team = "WSH"
            if team == "JAC":
                team = "JAX"

            pos = pos_map.get(p["position"], p["position"])

            name = p["name"]
            if pos == "DST":
                name = abrv_to_nickname.get(team, name)

            key = player_key(name, pos, team)
            record = records.setdefault(
                key,
                {"key": key, "name": name, "pos": pos, "team": team, "bye": p.get("bye")},
            )
            # Keep the first (lowest-ADP) player when two names collide on a key,
            # matching the old drop_duplicates(keep="first") behavior.
            if ppr_type not in record:
                record[ppr_type] = float(p["adp"])

    df = pd.DataFrame(records.values())
    df = df[["key", "name", "pos", "team", "bye"] + list(formats.keys())]
    df.to_csv(os.path.join(out, f"FFC-{YEAR}.csv"), index=False)

    logging.info("Validating ADP players")
    validate(df, strict=False, skip_fantasy_pros_check=True)


def column(text):
    """Parse column to common format."""

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


_NAME_REGEX = re.compile("[^a-z ]+")


def player_key(name, pos, team):
    """Build the unique key used to join a player/DST across sources."""

    n = name.lower().replace("sr", "").replace("st.", "").strip()
    n = _NAME_REGEX.sub("", n).strip().replace("  ", " ").split(" ")
    last = n[1] if len(n) > 1 else n[0]
    return last + "_" + pos + "_" + team


def add_key(df):
    """Add a unique key for each player/DST."""

    df["key"] = df.apply(
        lambda x: player_key(x["name"], x["pos"], x["team"]), axis=1
    )

    df = df.drop_duplicates("key")

    return df


def validate(df, strict=True, skip_fantasy_pros_check=False):
    """Throw an exception if we're missing players at a certain position. These numbers are logical estimates."""

    logging.info("scraped %d players", len(df))
    pos_counts = {"QB": 32, "RB": 64, "WR": 64, "TE": 28, "DST": 32, "K": 15}
    pos_unique = df.pos.unique()

    for pos, count in pos_counts.items():
        # At the time of writing, ppr-overall on Fantasy Pros is missing all DSTs for unclear reasons.
        # https://www.fantasypros.com/nfl/adp/ppr-overall.php
        if skip_fantasy_pros_check and (pos == "DST" or pos == "K"):
            continue

        actual_count = len(df[df.pos == pos])
        # weird re-ordering bug seen in ESPN right now, ignoring missing DSTs
        # if strict and actual_count < count:
        if strict and actual_count < count and pos != "DST":
            raise RuntimeWarning(f"only {actual_count} {pos}'s. All pos: {pos_unique}")
        elif not strict and actual_count * 3 < count:
            raise RuntimeWarning(f"only {actual_count} {pos}'s. All pos: {pos_unique}")

    if len(set(df.team)) > 33:
        raise RuntimeError(f"too many teams: {set(df.team)}")

    logging.info("players are valid")


def scroll():
    DRIVER.execute_script("window.scrollTo(0, document.body.scrollHeight);")
