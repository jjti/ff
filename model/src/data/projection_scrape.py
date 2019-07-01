import os
import time

import pandas as pd
import numpy as np
from bs4 import BeautifulSoup, NavigableString
import requests
from selenium import webdriver
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys


RAW = os.path.join("..", "..", "data", "raw", "projections")
DRIVER = os.path.sep + os.path.join("usr", "local", "bin", "chromedriver")
"""The path to a chrome driver for the scraping of JS apps.
I put my binary in /usr/local/bin
http://chromedriver.chromium.org/
"""


def scrape_espn(url="http://fantasy.espn.com/football/players/projections", out=RAW):
    """Scrape the ESPN projections
    """

    # set this to the p
    driver = webdriver.Chrome(DRIVER)
    driver.get(url)
    time.sleep(5)

    players = []
    current_button = 1
    while True:
        soup = BeautifulSoup(
            driver.execute_script("return document.body.innerHTML"), "html.parser"
        )

        for player in soup.select("div.full-projection-table"):

            name = player.select(".pointer")[0].get_text()
            pos = player.select(".playerinfo__playerpos")[0].get_text()
            team = player.select(".pro-team-name")[0].get_text()

            table = player.select(".Table2__table")[1]
            table_headers = [e.get_text().lower() for e in table.find_all("th")][1:]
            table_rows = [
                e.get_text().lower() for e in table.find("tbody").find_all("tr")[1]
            ][1:]

            p_data = {}
            p_data["name"] = name.strip()
            p_data["pos"] = pos.strip()
            p_data["team"] = team.strip().upper()
            for h, d in zip(table_headers, table_rows):
                if h in p_data:
                    continue  # oddly there are duplicate columns
                if "/" in d:
                    d = d.split("/")[0]
                if "-" in d:
                    p_data[h] = np.NaN
                else:
                    p_data[h] = float(d)

            players.append(p_data)

        try:
            next_button = driver.find_element_by_link_text(str(current_button + 1))
            actions = ActionChains(driver)
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
    df = sort_columns(df)
    df.to_csv(os.path.join(out, "ESPN-Projections-2019.csv"), index=False)


def scrape_cbs(url="https://www.cbssports.com/fantasy/football/stats", out=RAW):
    """Scrape the CBS projections site.
    
    Unlike ESPN, there are routes for each position and PPR versus non-PPR.

    Example URL:
    https://www.cbssports.com/fantasy/football/stats/WR/2019/season/projections/nonppr/
    """

    driver = webdriver.Chrome(DRIVER)

    for ppr in ["ppr", "nonppr"]:
        players = []
        for pos in ["QB", "RB", "WR", "TE", "DST", "K"]:
            page_url = f"{url}/{pos}/2019/season/projections/{ppr}/"

            driver.get(page_url)
            time.sleep(1)

            soup = BeautifulSoup(
                driver.execute_script("return document.body.innerHTML"), "html.parser"
            )

            table_header = soup.find("thead")
            table_header = table_header.find_all("tr")[1]

            headers = [
                h.find("div").get_text() for h in table_header.find_all("th")[1:]
            ]
            headers = [h.strip().lower().replace(" ", "_") for h in headers]
            headers = [h.split("\n")[0] if "\n" in h else h for h in headers]
            headers = ["name", "pos", "team"] + headers

            table = soup.select(".TableBase-table")[0]
            table_body = table.find("tbody")
            for row in table_body.find_all("tr"):  # for each player
                if isinstance(row, NavigableString):
                    continue
                if not len(row.find_all("td")):
                    continue

                if pos is not "DST":
                    name_cell = row.select(".CellPlayerName--long")[0]

                    name = name_cell.find("a").get_text()
                    pos, team = [
                        v.get_text().strip() for v in name_cell.find_all("span")
                    ]
                    data = [name, pos, team]
                else:
                    team = row.find("td").get_text().strip()
                    data = [team, "DST", team]

                data += [
                    td.get_text().strip().replace("—", "")
                    for td in row.find_all("td")[1:]
                ]

                player_data = {}
                for k, v in zip(headers, data):
                    player_data[k] = v
                    if k == "fantasy_points":
                        k = "fpts"
                    player_data[k] = v
                players.append(player_data)

        df = pd.DataFrame(players)
        df = sort_columns(df)

        filename = os.path.join(out, "CBS-Projections-2019.csv")
        if ppr == "ppr":
            filename = os.path.join(out, "CBS-Projections-PPR-2019.csv")

        df.to_csv(filename, index=False)


def sort_columns(df):
    """Put name, pos, team and pts first
    """

    ordered_cols = ["name", "pos", "team", "fpts"]
    df = df[ordered_cols + [c for c in df.columns if c not in ordered_cols]]
    return df


if __name__ == "__main__":
    scrape_cbs()
